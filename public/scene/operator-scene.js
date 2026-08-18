/* <operator-scene> — playable third-person operator in a dark hangar.
   A programmatically modelled, jointed character (no photo sampling): WASD to move,
   mouse to aim, click to fire, R to reload. Assembles on 'operator:deploy'.
   Broadcasts 'operator:hud' {ammo, mag, reloading, shots, hit}.
   Attributes: accent, motion (calm|standard|aggressive) */
(function () {
  const SRC = 'https://unpkg.com/three@0.137.5/build/three.min.js';
  const GLTF = 'https://unpkg.com/three@0.137.5/examples/js/loaders/GLTFLoader.js';
  let pending;
  function loadThree() {
    if (window.THREE) return Promise.resolve(window.THREE);
    if (pending) return pending;
    pending = new Promise((res, rej) => {
      const load = (src) => new Promise((ok, no) => {
        const s = document.createElement('script');
        s.src = src; s.onload = ok; s.onerror = no;
        document.head.appendChild(s);
      });
      (window.THREE ? Promise.resolve() : load(SRC))
        .then(() => (window.THREE.GLTFLoader ? null : load(GLTF)))
        .then(() => res(window.THREE))
        .catch(rej);
    });
    return pending;
  }
  const SPEED = { calm: 0.6, standard: 1, aggressive: 1.6 };

  /* Binds the rigged GLB to the procedural control rig. The proxy skeleton stays
     the thing the scene animates (world-aligned axes, its own IK); each frame the
     proxy's world rotations are retargeted onto the real bones, so the Rigify
     rest pose and bone rolls never have to be reasoned about. */
  const BONE_KEYS = ['hips', 'chest', 'neck', 'head', 'shoulderL', 'elbowL', 'handL',
    'shoulderR', 'elbowR', 'handR', 'thighL', 'kneeL', 'footL', 'thighR', 'kneeR', 'footR'];
  const FALLBACK = {
    hips: 'DEF-spine', chest: 'DEF-spine003', neck: 'DEF-spine004', head: 'DEF-spine006',
    shoulderL: 'DEF-upper_armL', elbowL: 'DEF-forearmL', handL: 'DEF-handL',
    shoulderR: 'DEF-upper_armR', elbowR: 'DEF-forearmR', handR: 'DEF-handR',
    thighL: 'DEF-thighL', kneeL: 'DEF-shinL', footL: 'DEF-footL',
    thighR: 'DEF-thighR', kneeR: 'DEF-shinR', footR: 'DEF-footR'
  };
  /* intermediate spine bones share the chest's bend so the torso curves */
  const SPREAD = [['DEF-spine001', 'chest', 0.3], ['DEF-spine002', 'chest', 0.45], ['DEF-spine005', 'head', 0.4]];
  /* GLTFLoader sanitizes node names, so ".003" arrives as "003" */
  const bkey = (s) => String(s).replace(/\s/g, '_').replace(/[.:/[\]]/g, '');

  function attachRigged(T, rig, url, mapUrl, done) {
    const wantMap = fetch(mapUrl).then((r) => r.json()).catch(() => null);
    new T.GLTFLoader().load(url, (gltf) => {
      wantMap.then((bm) => {
        const names = (bm && bm.bones) || {};
        const byName = {};
        let skinned = null;
        gltf.scene.traverse((o) => {
          if (o.name) { byName[o.name] = o; byName[bkey(o.name)] = o; }
          if (o.isSkinnedMesh && !skinned) skinned = o;
        });
        if (!skinned) return;

        const real = {};
        BONE_KEYS.forEach((k) => {
          real[k] = (names[k] && byName[bkey(names[k])]) || byName[FALLBACK[k]] || null;
        });
        if (!real.hips || !real.shoulderL || !real.handR) return;

        rig.root.add(gltf.scene);
        gltf.scene.updateMatrixWorld(true);
        const wp = (o) => o.getWorldPosition(new T.Vector3());
        const P = {};
        BONE_KEYS.forEach((k) => { if (real[k]) P[k] = wp(real[k]); });

        /* the proxy is rebuilt on the real rig's measurements, so IK solved on the
           proxy lands the real hands exactly on the weapon */
        /* the proxy's 'R' limb sits on -x, so it binds to whichever real bone is on -x
           — that keeps the trigger hand on the character's actual right */
        const armSide = { R: P.shoulderL.x < 0 ? 'L' : 'R', L: P.shoulderL.x < 0 ? 'R' : 'L' };
        const legSide = { R: P.thighL.x < 0 ? 'L' : 'R', L: P.thighL.x < 0 ? 'R' : 'L' };

        rig.hips.position.copy(P.hips);
        rig.hipsRestY = P.hips.y;
        rig.chest.position.copy(P.chest).sub(P.hips);
        rig.neck.position.copy(P.neck).sub(P.chest);
        rig.head.position.copy(P.head).sub(P.neck);
        rig.armL1 = P.shoulderL.distanceTo(P.elbowL);
        rig.armL2 = P.elbowL.distanceTo(P.handL);
        ['L', 'R'].forEach((pk) => {
          const rs = armSide[pk];
          const arm = rig.arms[pk];
          arm.sh.position.copy(P['shoulder' + rs]).sub(P.chest);
          arm.sh.quaternion.identity();
          arm.elbow.position.set(0, -rig.armL1, 0);
          arm.elbow.rotation.set(0, 0, 0);
          arm.hand.position.set(0, -rig.armL2, 0);
          const leg = rig.legs[pk], ls = legSide[pk];
          leg.hip.position.copy(P['thigh' + ls]).sub(P.hips);
          leg.hip.rotation.set(0, 0, 0);
          leg.knee.position.copy(P['knee' + ls]).sub(P['thigh' + ls]);
          leg.knee.rotation.set(0, 0, 0);
        });
        rig.root.position.set(0, 0, 0);
        rig.root.rotation.set(0, 0, 0);
        rig.chest.rotation.set(0, 0, 0);
        rig.neck.rotation.set(0, 0, 0);
        rig.head.rotation.set(0, 0, 0);
        rig.root.updateMatrixWorld(true);

        /* Retarget by world rotation delta. That is only valid when both skeletons
           share a reference pose, so the control rig's limbs are first posed into THIS
           rig's rest pose (a T-pose) and that is what gets captured as the reference —
           after which every rotation the IK produces transfers exactly, roll included. */
        const DOWN = new T.Vector3(0, -1, 0);
        const tmpQ = new T.Quaternion(), tmpV = new T.Vector3();
        const alignTo = (bone, parentObj, from, to) => {
          parentObj.getWorldQuaternion(tmpQ).invert();
          tmpV.copy(to).sub(from).normalize().applyQuaternion(tmpQ);
          bone.quaternion.setFromUnitVectors(DOWN, tmpV);
          bone.updateWorldMatrix(true, true);
        };
        ['L', 'R'].forEach((pk) => {
          const rs = armSide[pk], arm = rig.arms[pk];
          alignTo(arm.sh, rig.chest, P['shoulder' + rs], P['elbow' + rs]);
          alignTo(arm.elbow, arm.sh, P['elbow' + rs], P['hand' + rs]);
          const ls = legSide[pk], leg = rig.legs[pk];
          alignTo(leg.hip, rig.hips, P['thigh' + ls], P['knee' + ls]);
          alignTo(leg.knee, leg.hip, P['knee' + ls], P['foot' + ls]);
        });
        rig.root.updateMatrixWorld(true);

        const wq = (o) => o.getWorldQuaternion(new T.Quaternion());

        /* Builds a bone orientation from a direction plus a pole, so roll is never left
           to a minimal-arc guess — an unconstrained roll twists the skinned arm inside out. */
        const fqX = new T.Vector3(), fqY = new T.Vector3(), fqZ = new T.Vector3(), fqM = new T.Matrix4();
        const frameQuat = (u, pole, out) => {
          fqY.copy(u).normalize().multiplyScalar(-1);
          fqZ.copy(pole).addScaledVector(fqY, -pole.dot(fqY));
          if (fqZ.lengthSq() < 1e-8) fqZ.set(fqY.z, fqY.x, fqY.y);
          fqZ.normalize();
          fqX.crossVectors(fqY, fqZ).normalize();
          fqZ.crossVectors(fqX, fqY);
          fqM.makeBasis(fqX, fqY, fqZ);
          return out.setFromRotationMatrix(fqM);
        };

        const proxyOf = (k) => {
          if (k === 'hips' || k === 'chest' || k === 'neck' || k === 'head') return rig[k];
          const m = k.match(/^(shoulder|elbow|thigh|knee)([LR])$/);
          if (!m) return null;
          if (m[1] === 'shoulder' || m[1] === 'elbow') {
            const pk = m[2] === armSide.L ? 'L' : 'R';
            return m[1] === 'shoulder' ? rig.arms[pk].sh : rig.arms[pk].elbow;
          }
          const lk = m[2] === legSide.L ? 'L' : 'R';
          return m[1] === 'thigh' ? rig.legs[lk].hip : rig.legs[lk].knee;
        };

        const steps = [];
        const push = (bone, proxy, w) => {
          if (!bone || !proxy) return;
          steps.push({ bone: bone, proxy: proxy, w: w, pRest: wq(proxy), rRest: wq(bone) });
        };
        ['hips', 'chest', 'neck', 'head'].forEach((k) => push(real[k], rig[k], 1));
        SPREAD.forEach(([bn, pk, w]) => {
          const b = byName[bkey(bn)];
          if (b && b.isBone) push(b, rig[pk], w);
        });
        /* legs retarget cleanly — both rigs rest with the legs straight down */
        ['thighL', 'kneeL', 'thighR', 'kneeR'].forEach((k) => push(real[k], proxyOf(k), 1));
        /* the clavicle is deliberately left at rest: rotating it moves the upper arm's
           origin, which slides the hands off the weapon by several centimetres */
        /* hands and feet keep their rest rotation, so wrists and ankles stay straight */

        /* ARMS — posed ONCE, then never touched again.
           Every previous attempt solved the hands onto the weapon every frame, and any
           orientation error in that solve shows up as a twisted, shrink-wrapped arm. So the
           dependency is inverted: the arms are posed once into a rifle stance and the WEAPON
           is socketed to the trigger hand. The arm bones then hold constant local rotations
           for the life of the page — geometrically incapable of morphing — and aim comes
           from the spine and head, which the retarget above already drives. */
        const armMeta = {};
        ['R', 'L'].forEach((pk) => {
          const rs = armSide[pk];
          const sh = real['shoulder' + rs], el = real['elbow' + rs], hb = real['hand' + rs];
          if (!sh || !el) return;
          /* each bone's rest direction toward its child, held in the bone's own local frame
             so it stays valid under any parent rotation */
          const localDir = (bone, from, to) => {
            const v = to.clone().sub(from);
            if (v.lengthSq() < 1e-10) v.set(0, -1, 0);
            return v.normalize().applyQuaternion(wq(bone).invert());
          };
          const m = {
            sh: sh, el: el, hand: hb,
            l1: P['shoulder' + rs].distanceTo(P['elbow' + rs]),
            l2: P['elbow' + rs].distanceTo(P['hand' + rs]),
            shRest: sh.quaternion.clone(), shDir: localDir(sh, P['shoulder' + rs], P['elbow' + rs]),
            elRest: el.quaternion.clone(), elDir: localDir(el, P['elbow' + rs], P['hand' + rs])
          };
          if (hb) {
            const kid = (hb.children || []).filter((c) => c.isBone)[0];
            const tip = new T.Vector3();
            if (kid) kid.getWorldPosition(tip);
            if (!kid || tip.distanceToSquared(P['hand' + rs]) < 1e-8) {
              tip.copy(P['hand' + rs]).add(P['hand' + rs].clone().sub(P['elbow' + rs]).normalize().multiplyScalar(0.1));
            }
            m.handRest = hb.quaternion.clone();
            m.handDir = localDir(hb, P['hand' + rs], tip);
          }
          armMeta[pk] = m;
        });

        const qA = new T.Quaternion(), qB = new T.Quaternion(), qC = new T.Quaternion(), qI = new T.Quaternion();
        const vSh = new T.Vector3(), vV = new T.Vector3(), vE1 = new T.Vector3(), vE2 = new T.Vector3();
        const vU = new T.Vector3(), vEl = new T.Vector3(), vPole = new T.Vector3(), qW = new T.Quaternion();
        const vHD = new T.Vector3(), vB = new T.Vector3(), qRifle = new T.Quaternion();
        const MAX_WRIST = 0.8;
        const setWorldQuat = (bone, want) => {
          bone.parent.getWorldQuaternion(qC).invert();
          bone.quaternion.copy(qC.multiply(want));
          bone.updateWorldMatrix(false, false);
        };
        /* Rotates a bone from its rest orientation by the shortest arc that takes its own
           rest direction onto aimDir — no roll is ever introduced. maxArc (radians, 0 = off)
           caps how far the bone may swing, which is what keeps the wrist inside its range. */
        const qP = new T.Quaternion(), qArc = new T.Quaternion(), vRest = new T.Vector3();
        const aimBone = (bone, restLocal, dirLocal, aimDir, maxArc) => {
          bone.parent.getWorldQuaternion(qP);
          qA.copy(qP).multiply(restLocal);
          vRest.copy(dirLocal).applyQuaternion(qA).normalize();
          vB.copy(aimDir).normalize();
          const dot = Math.max(-1, Math.min(1, vRest.dot(vB)));
          if (dot > 0.999999) { bone.quaternion.copy(restLocal); bone.updateWorldMatrix(false, false); return; }
          qArc.setFromUnitVectors(vRest, vB);
          const ang = Math.acos(dot);
          /* scaling the arc toward identity swings along the same great circle, so a capped
             joint stops short of the target instead of snapping to a different plane */
          if (maxArc > 0 && ang > maxArc) qArc.slerpQuaternions(qI, qArc, maxArc / ang);
          setWorldQuat(bone, qArc.multiply(qA));
        };
        rig.sync = function () {
          real.hips.position.y = P.hips.y + (rig.hips.position.y - rig.hipsRestY);
          for (let i = 0; i < steps.length; i++) {
            const s = steps[i];
            s.proxy.getWorldQuaternion(qA);
            qA.multiply(qB.copy(s.pRest).invert());
            if (s.w !== 1) qA.slerpQuaternions(qI, qA, s.w);
            qA.multiply(s.rRest);
            setWorldQuat(s.bone, qA);
          }
          /* nothing to do for the arms — they are a fixed pose riding the chest */
        };

        /* STANCE — both hands are placed explicitly, in CHEST space, measured from the chest
           bone: -X is the character's right, +Z is forward. Each arm gets ONE two-bone solve
           with an authored elbow pole, the weapon is then fitted between the two hands, and
           nothing is solved again for the life of the page. Targets are chosen to sit inside
           each arm's reach (0.515 m), so no arm is ever driven to full extension. */
        const STANCE = {
          R: { at: [-0.030, -0.205, 0.100], pole: [-0.35, -1, -0.25] },
          L: { at: [0.030, -0.222, 0.258], pole: [0.45, -1, 0.10] }
        };
        (function poseArms() {
          const chestQ = wq(real.chest);
          const chestPos = real.chest.getWorldPosition(new T.Vector3());
          const inChest = (a) => new T.Vector3(a[0], a[1], a[2]).applyQuaternion(chestQ);
          const atChest = (a) => chestPos.clone().add(inChest(a));
          const R = armMeta.R, L = armMeta.L;
          if (!R || !R.hand || !L || !L.hand) return;

          /* one analytic two-bone solve: the pole fixes the bend plane, so the elbow lands
             where it was authored instead of wherever the math happens to swing it */
          const MAX_EXT = 0.88;
          const solveTo = (m, target, pole) => {
            const sp = m.sh.getWorldPosition(new T.Vector3());
            const v = target.clone().sub(sp);
            /* An arm at full stretch reads as a locked, jutting limb no matter how the rest
               of the pose is tuned, so the target is pulled toward the shoulder before it can
               ever get there — a bent elbow is non-negotiable. */
            const span = (m.l1 + m.l2) * MAX_EXT;
            if (v.length() > span) {
              v.setLength(span);
              target = sp.clone().add(v);
            }
            const d = v.length();
            const e1 = v.clone().normalize();
            const e2 = pole.clone();
            e2.addScaledVector(e1, -e2.dot(e1));
            if (e2.lengthSq() < 1e-8) e2.set(0, -1, 0);
            e2.normalize();
            const cosT = Math.max(-1, Math.min(1, (d * d - m.l1 * m.l1 - m.l2 * m.l2) / (2 * m.l1 * m.l2)));
            const al = Math.atan2(m.l2 * Math.sin(Math.acos(cosT)), m.l1 + m.l2 * cosT);
            const u = e1.clone().multiplyScalar(Math.cos(al)).addScaledVector(e2, Math.sin(al));
            aimBone(m.sh, m.shRest, m.shDir, u, 0);
            const u2 = target.clone().sub(sp.addScaledVector(u, m.l1));
            if (u2.lengthSq() > 1e-8) aimBone(m.el, m.elRest, m.elDir, u2, 0);
          };
          solveTo(R, atChest(STANCE.R.at), inChest(STANCE.R.pole).normalize());
          solveTo(L, atChest(STANCE.L.at), inChest(STANCE.L.pole).normalize());

          const handR = R.hand.getWorldPosition(new T.Vector3());
          const handL = L.hand.getWorldPosition(new T.Vector3());

          /* weapon: barrel down the hand-to-hand line, rolled upright against the chest */
          const zAx = handL.clone().sub(handR).normalize();
          const yAx = inChest([0, 1, 0]).normalize();
          yAx.addScaledVector(zAx, -yAx.dot(zAx));
          if (yAx.lengthSq() < 1e-8) yAx.set(0, 1, 0);
          yAx.normalize();
          const xAx = new T.Vector3().crossVectors(yAx, zAx).normalize();
          yAx.crossVectors(zAx, xAx);
          const wQuat = new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(xAx, yAx, zAx));
          const wPos = handR.clone().sub(new T.Vector3(GRIP_R.x, GRIP_R.y, GRIP_R.z).applyQuaternion(wQuat));

          const handWorld = R.hand.matrixWorld.clone();
          if (rig.rifle.parent) rig.rifle.parent.remove(rig.rifle);
          R.hand.add(rig.rifle);
          handWorld.invert()
            .multiply(new T.Matrix4().compose(wPos, wQuat, new T.Vector3(1, 1, 1)))
            .decompose(rig.rifle.position, rig.rifle.quaternion, rig.rifle.scale);
          rig.rifle.updateWorldMatrix(false, true);
          rig.rifleBase = { pos: rig.rifle.position.clone(), quat: rig.rifle.quaternion.clone() };
          rig.recoilAxis = new T.Vector3(0, 0, 1).applyQuaternion(rig.rifleBase.quat);

          /* The stance is bladed, so the barrel sits off the chest's own forward. Record that
             angle: the aim then yaws the body by (aim - offset), which points the MUZZLE at the
             cursor instead of the sternum. */
          const fwd = inChest([0, 0, 1]).normalize();
          rig.aimYawOffset = Math.atan2(zAx.x, zAx.z) - Math.atan2(fwd.x, fwd.z);

          /* The weapon is now rigid relative to the trigger hand, so the foregrip is a fixed
             point in space. One more solve closes the few millimetres the first pass left. */
          solveTo(L, new T.Vector3(GRIP_L.x, GRIP_L.y, GRIP_L.z).applyMatrix4(rig.rifle.matrixWorld),
            inChest(STANCE.L.pole).normalize());

          /* wrists: fingers down each grip, read from the weapon's own axes */
          const rifleQ = rig.rifle.getWorldQuaternion(new T.Quaternion());
          const wristTo = (m, g) => aimBone(m.hand, m.handRest, m.handDir,
            new T.Vector3(g.dir.x, g.dir.y, g.dir.z).applyQuaternion(rifleQ).normalize(), MAX_WRIST);
          wristTo(R, HAND_R);
          wristTo(L, HAND_L);
        })();

                const mat = skinned.material;
        mat.envMapIntensity = 0.5;
        if (mat.map) mat.map.encoding = T.sRGBEncoding;
        mat.transparent = true;
        mat.opacity = 0;
        skinned.castShadow = true;
        skinned.frustumCulled = false;

        const wireMat = new T.MeshBasicMaterial({
          name: 'operatorWire', color: 0xe9e7e2, wireframe: true,
          transparent: true, opacity: 0, fog: true, depthWrite: false
        });
        const wire = new T.SkinnedMesh(skinned.geometry, wireMat);
        wire.name = 'operator-wire';
        wire.frustumCulled = false;
        skinned.parent.add(wire);
        wire.bind(skinned.skeleton, skinned.bindMatrix);
        wire.visible = false;

        rig.root.traverse((o) => { if (o.isMesh && !o.isSkinnedMesh) o.visible = o.userData.keep === true; });
        /* keep === false marks the block-out weapon the real mesh replaced — showing it
           again puts a grey slab through the hands */
        rig.rifle.traverse((o) => {
          if (!o.isMesh) return;
          if (o.userData.keep === false) { o.visible = false; return; }
          o.visible = true;
          o.userData.keep = true;
        });

        done(skinned, mat, wire, wireMat);
      });
    });
  }

  /* Swaps the block-out weapon for the real CZ Bren mesh. Parts arrive as 12
     separate untextured objects, so materials are assigned by their source names. */
  const WEAPON_LEN = 0.9;               /* real overall length, metres */
  const WEAPON_SRC_LEN = 4.627;         /* the model's own length along +Z */
  const WEAPON_MUZZLE_Z = 2.298;        /* source-space tip */
  function loadWeapon(T, rig, url, accent, done) {
    /* values sit a step above the plate carrier so the weapon reads as a silhouette
       against the dark hangar; metalness stays low since the scene has no env map */
    const dark = new T.MeshStandardMaterial({ name: 'wpnPolymer', color: 0x14161a, roughness: 0.74, metalness: 0.1 });
    const metal = new T.MeshStandardMaterial({ name: 'wpnMetal', color: 0x1c2025, roughness: 0.62, metalness: 0.2 });
    const steel = new T.MeshStandardMaterial({ name: 'wpnSteel', color: 0x272c32, roughness: 0.5, metalness: 0.32 });
    const lens = new T.MeshStandardMaterial({
      name: 'wpnLens', color: accent, emissive: accent, emissiveIntensity: 1.8, roughness: 0.25, metalness: 0
    });
    const pick = (n) => {
      const k = String(n).toLowerCase();
      if (k.indexOf('glass') === 0) return lens;
      if (k.indexOf('grip') === 0 || k.indexOf('stock') === 0 || k.indexOf('mag') === 0) return dark;
      if (k.indexOf('ironsight') === 0 || k.indexOf('bolt') === 0) return steel;
      return metal;
    };
    new T.GLTFLoader().load(url, (gltf) => {
      const s = WEAPON_LEN / WEAPON_SRC_LEN;
      gltf.scene.scale.setScalar(s);
      gltf.scene.traverse((o) => {
        if (!o.isMesh) return;
        o.material = pick(o.material && o.material.name);
        o.castShadow = true;
        o.userData.keep = true;
      });
      /* the block-out stays as the invisible reference the IK grips were tuned on */
      rig.rifle.traverse((o) => { if (o.isMesh) { o.visible = false; o.userData.keep = false; } });
      rig.rifle.add(gltf.scene);
      rig.muzzle.position.set(0, 0, WEAPON_MUZZLE_Z * s);
      done([dark, metal, steel, lens]);
    }, undefined, () => {
      /* no model: the block-out weapon stays visible */
      done([]);
    });
  }

  function buildOperator(T, accent) {
    const M = {
      gear: new T.MeshStandardMaterial({ name: 'gear', color: 0x1c1c1f, roughness: 0.66, metalness: 0.08 }),
      pad: new T.MeshStandardMaterial({ name: 'pad', color: 0x26262a, roughness: 0.5, metalness: 0.12 }),
      steel: new T.MeshStandardMaterial({ name: 'steel', color: 0x24242a, roughness: 0.56, metalness: 0.5 }),
      olive: new T.MeshStandardMaterial({ name: 'olive', color: 0x424536, roughness: 0.7, metalness: 0.05 }),
      skin: new T.MeshStandardMaterial({ name: 'skin', color: 0x8d5e3f, roughness: 0.72, metalness: 0.02 }),
      lens: new T.MeshStandardMaterial({ name: 'lens', color: 0x101014, roughness: 0.12, metalness: 0.9 }),
      patch: new T.MeshStandardMaterial({ name: 'patch', color: 0xcfc7b4, roughness: 0.8, metalness: 0 }),
      saffron: new T.MeshStandardMaterial({ name: 'saffron', color: 0xd98118, roughness: 0.8 }),
      white: new T.MeshStandardMaterial({ name: 'flagwhite', color: 0xd9d5cc, roughness: 0.8 }),
      green: new T.MeshStandardMaterial({ name: 'flaggreen', color: 0x2f6b3a, roughness: 0.8 }),
      glow: new T.MeshStandardMaterial({ name: 'glow', color: accent, emissive: accent, emissiveIntensity: 1.4, roughness: 0.4 })
    };
    const box = (w, h, d, mat, name) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), mat); m.name = name; return m; };
    const cyl = (rt, rb, h, mat, name, seg) => { const m = new T.Mesh(new T.CylinderGeometry(rt, rb, h, seg || 16), mat); m.name = name; return m; };
    const sph = (r, mat, name) => { const m = new T.Mesh(new T.SphereGeometry(r, 22, 16), mat); m.name = name; return m; };

    const root = new T.Group(); root.name = 'operator';
    const hips = new T.Group(); hips.name = 'hips'; hips.position.y = 0.94; root.add(hips);
    const belt = box(0.34, 0.11, 0.23, M.gear, 'belt'); belt.position.y = 0.03; hips.add(belt);
    const buckle = box(0.07, 0.05, 0.02, M.steel, 'buckle'); buckle.position.set(0, 0.03, 0.121); hips.add(buckle);

    const legs = {};
    [-1, 1].forEach((sd) => {
      const side = sd < 0 ? 'R' : 'L';
      const hip = new T.Group(); hip.name = 'hip' + side;
      hip.position.set(sd * 0.105, -0.02, 0); hips.add(hip);
      const thigh = cyl(0.098, 0.085, 0.44, M.gear, 'thigh' + side);
      thigh.position.y = -0.22; hip.add(thigh);
      const knee = new T.Group(); knee.name = 'knee' + side; knee.position.y = -0.44; hip.add(knee);
      const pad = box(0.15, 0.14, 0.13, M.pad, 'kneepad' + side); pad.position.set(0, -0.02, 0.045); knee.add(pad);
      const shin = cyl(0.078, 0.062, 0.42, M.gear, 'shin' + side); shin.position.y = -0.21; knee.add(shin);
      const boot = box(0.125, 0.1, 0.29, M.gear, 'boot' + side); boot.position.set(0, -0.44, 0.035); knee.add(boot);
      const sole = box(0.13, 0.03, 0.3, M.pad, 'sole' + side); sole.position.set(0, -0.5, 0.035); knee.add(sole);
      if (sd > 0) {
        const rigPouch = box(0.1, 0.16, 0.07, M.gear, 'thighRig'); rigPouch.position.set(sd * 0.07, -0.24, 0.06); hip.add(rigPouch);
        const pistol = box(0.05, 0.13, 0.05, M.steel, 'sidearm'); pistol.position.set(sd * 0.085, -0.26, 0.055); hip.add(pistol);
      }
      legs[side] = { hip: hip, knee: knee };
    });

    const chest = new T.Group(); chest.name = 'chest'; chest.position.y = 0.1; hips.add(chest);
    const torso = box(0.38, 0.44, 0.24, M.gear, 'torso'); torso.position.y = 0.2; chest.add(torso);
    const carrier = box(0.36, 0.34, 0.29, M.pad, 'plateCarrier'); carrier.position.y = 0.2; chest.add(carrier);
    const patchDark = box(0.13, 0.08, 0.008, M.gear, 'patchBacking'); patchDark.position.set(0, 0.235, 0.146); chest.add(patchDark);
    const patch141 = box(0.115, 0.065, 0.012, M.patch, 'patch141'); patch141.position.set(0, 0.235, 0.152); chest.add(patch141);
    [[-0.11, 0.09], [0, 0.085], [0.11, 0.09]].forEach(([x, w], i) => {
      const pouch = box(w, 0.11, 0.07, M.gear, 'pouch' + i);
      pouch.position.set(x, 0.06, 0.155); chest.add(pouch);
    });
    const collar = cyl(0.1, 0.11, 0.09, M.gear, 'collar'); collar.position.y = 0.43; chest.add(collar);
    const flag = new T.Group(); flag.name = 'flagPatch'; flag.position.set(0.2, 0.3, 0.035); flag.rotation.y = 0.5;
    [[0.014, M.saffron], [0, M.white], [-0.014, M.green]].forEach(([y, mat], i) => {
      const st = box(0.06, 0.014, 0.008, mat, 'flagStripe' + i); st.position.y = y; flag.add(st);
    });
    chest.add(flag);

    const arms = {};
    [-1, 1].forEach((sd) => {
      const side = sd < 0 ? 'R' : 'L';
      const sh = new T.Group(); sh.name = 'shoulder' + side;
      sh.position.set(sd * 0.21, 0.34, 0); chest.add(sh);
      const cap = sph(0.095, M.gear, 'shoulderCap' + side); sh.add(cap);
      const upper = cyl(0.072, 0.062, 0.27, M.gear, 'upperArm' + side); upper.position.y = -0.145; sh.add(upper);
      const elbow = new T.Group(); elbow.name = 'elbow' + side; elbow.position.y = -0.28; sh.add(elbow);
      const fore = cyl(0.06, 0.05, 0.25, M.gear, 'forearm' + side); fore.position.y = -0.13; elbow.add(fore);
      const hand = new T.Group(); hand.name = 'hand' + side; hand.position.y = -0.27; elbow.add(hand);
      const glove = box(0.08, 0.1, 0.075, M.pad, 'glove' + side); hand.add(glove);
      arms[side] = { sh: sh, elbow: elbow, hand: hand };
    });

    const neck = new T.Group(); neck.name = 'neck'; neck.position.y = 0.47; chest.add(neck);
    const neckMesh = cyl(0.055, 0.06, 0.08, M.skin, 'neckMesh'); neckMesh.position.y = 0.03; neck.add(neckMesh);
    const head = new T.Group(); head.name = 'head'; head.position.y = 0.1; neck.add(head);
    const skull = sph(0.112, M.skin, 'skull'); skull.scale.set(1, 1.14, 1.06); skull.position.y = 0.05; head.add(skull);
    const jaw = box(0.13, 0.08, 0.14, M.skin, 'jaw'); jaw.position.set(0, -0.025, 0.028); head.add(jaw);
    const beard = box(0.115, 0.05, 0.12, M.gear, 'beard'); beard.position.set(0, -0.055, 0.04); head.add(beard);
    const hairTop = sph(0.108, M.gear, 'hair'); hairTop.scale.set(1.02, 0.72, 1.04); hairTop.position.y = 0.105; head.add(hairTop);
    const bun = sph(0.05, M.gear, 'hairBun'); bun.position.set(0, 0.12, -0.105); head.add(bun);
    const glasses = box(0.225, 0.05, 0.055, M.lens, 'glasses'); glasses.position.set(0, 0.045, 0.088); head.add(glasses);
    const gFrame = box(0.235, 0.012, 0.05, M.gear, 'glassesFrame'); gFrame.position.set(0, 0.07, 0.086); head.add(gFrame);
    const band = new T.Mesh(new T.TorusGeometry(0.115, 0.014, 8, 28, Math.PI), M.olive);
    band.name = 'headsetBand'; band.rotation.z = Math.PI / 2; band.rotation.y = Math.PI / 2; band.position.y = 0.08; head.add(band);
    [-1, 1].forEach((sd) => {
      const cup = cyl(0.048, 0.048, 0.045, M.olive, 'earCup' + (sd < 0 ? 'L' : 'R'));
      cup.rotation.z = Math.PI / 2; cup.position.set(sd * 0.115, 0.02, 0); head.add(cup);
    });
    const boom = cyl(0.006, 0.006, 0.12, M.gear, 'micBoom', 8);
    boom.position.set(-0.085, -0.02, 0.055); boom.rotation.set(0.5, 0, 0.9); head.add(boom);
    const mic = sph(0.014, M.gear, 'mic'); mic.position.set(-0.045, -0.055, 0.095); head.add(mic);
    const nvg = box(0.09, 0.045, 0.05, M.steel, 'nvgMount'); nvg.position.set(0, 0.155, 0.055); head.add(nvg);

    const rifle = new T.Group(); rifle.name = 'rifle';
    const receiver = box(0.055, 0.075, 0.34, M.steel, 'receiver'); rifle.add(receiver);
    const handguard = cyl(0.028, 0.028, 0.3, M.steel, 'handguard', 8); handguard.rotation.x = Math.PI / 2; handguard.position.z = 0.31; rifle.add(handguard);
    const barrel = cyl(0.011, 0.011, 0.16, M.steel, 'barrel', 6); barrel.rotation.x = Math.PI / 2; barrel.position.z = 0.53; rifle.add(barrel);
    const supp = cyl(0.022, 0.022, 0.17, M.pad, 'suppressor', 8); supp.rotation.x = Math.PI / 2; supp.position.z = 0.66; rifle.add(supp);
    const mag = box(0.045, 0.19, 0.07, M.steel, 'magazine'); mag.position.set(0, -0.12, 0.02); mag.rotation.x = 0.16; rifle.add(mag);
    const grip = box(0.04, 0.11, 0.05, M.gear, 'pistolGrip'); grip.position.set(0, -0.08, -0.12); grip.rotation.x = -0.28; rifle.add(grip);
    const stock = box(0.05, 0.09, 0.22, M.gear, 'stock'); stock.position.z = -0.26; rifle.add(stock);
    const buttpad = box(0.055, 0.11, 0.03, M.pad, 'buttpad'); buttpad.position.z = -0.375; rifle.add(buttpad);
    const rail = box(0.03, 0.02, 0.36, M.steel, 'rail'); rail.position.set(0, 0.048, 0.14); rifle.add(rail);
    const optic = box(0.045, 0.055, 0.13, M.steel, 'optic'); optic.position.set(0, 0.085, 0.1); rifle.add(optic);
    const opticLens = cyl(0.021, 0.021, 0.008, M.glow, 'opticLens', 10); opticLens.rotation.x = Math.PI / 2; opticLens.position.set(0, 0.085, 0.168); rifle.add(opticLens);
    const foreGrip = box(0.035, 0.09, 0.04, M.gear, 'foreGrip'); foreGrip.position.set(0, -0.06, 0.36); rifle.add(foreGrip);
    const muzzle = new T.Object3D(); muzzle.name = 'muzzle'; muzzle.position.z = 0.76; rifle.add(muzzle);

    /* shouldered: barrel runs along the chest's forward axis, so aiming the
       upper body aims the weapon */
    chest.add(rifle);
    rifle.position.set(0.0, -0.1, 0.16);
    rifle.rotation.set(0, 0, 0.05);

    root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return { root: root, hips: hips, chest: chest, neck: neck, head: head, arms: arms, legs: legs,
      rifle: rifle, muzzle: muzzle, mats: M, hipsRestY: 0.94, armL1: 0.28, armL2: 0.27, sync: null };
  }

  /* two-bone IK: puts the hand exactly on a target expressed in chest space */
  const GRIP_R = { x: 0, y: -0.048, z: -0.150 };
  const GRIP_L = { x: 0, y: -0.044, z: 0.020 };
  /* wrist frames in weapon space: dir runs from the wrist down through the fingers,
     palm is the direction the palm faces. The pistol grip rakes back, the vertical
     foregrip hangs straight down, and the two palms oppose each other. */
  const HAND_R = { dir: { x: 0.1, y: -1, z: -0.42 }, palm: { x: -0.35, y: -0.2, z: 1 } };
  const HAND_L = { dir: { x: -0.08, y: -1, z: 0.16 }, palm: { x: 0.4, y: -0.15, z: -1 } };
  function makeSolver(T) {
    const DOWN = new T.Vector3(0, -1, 0);
    const XAX = new T.Vector3(1, 0, 0);
    const v = new T.Vector3(), q1 = new T.Quaternion(), q2 = new T.Quaternion(), q3 = new T.Quaternion();
    /* twist swings the elbow out of the torso without moving the hand */
    return function solveArm(arm, target, l1, l2, twist) {
      v.copy(target).sub(arm.sh.position);
      let d = v.length();
      const max = (l1 + l2) * 0.995;
      if (d > max) d = max;
      if (d < 0.04) d = 0.04;
      const ci = Math.max(-1, Math.min(1, (l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2)));
      const bend = Math.PI - Math.acos(ci);
      arm.elbow.rotation.set(-bend, 0, 0);
      const alpha = Math.atan2(l2 * Math.sin(bend), l1 + l2 * Math.cos(bend));
      v.normalize();
      q1.setFromUnitVectors(DOWN, v);
      q2.setFromAxisAngle(XAX, alpha);
      q3.setFromAxisAngle(v, twist || 0);
      arm.sh.quaternion.copy(q3).multiply(q1).multiply(q2);
    };
  }

  function poseWeaponReady() {}

  class OperatorScene extends HTMLElement {
    static get observedAttributes() { return ['accent', 'motion', 'look']; }

    _applyLook() {
      const f = this._figure;
      const wire = (this.getAttribute('look') || 'textured') === 'wireframe';
      if (this._rigMats) {
        const M = this._rigMats;
        Object.keys(M).forEach((k) => {
          if (k === 'glow' || M[k].name === 'wpnLens') return;
          const m = M[k];
          if (m.userData.solidHex === undefined) m.userData.solidHex = m.color.getHex();
          m.wireframe = wire;
          m.color.setHex(wire ? 0xe9e7e2 : m.userData.solidHex);
          m.userData.fade = wire ? 0.34 : 1;
        });
      }
      if (!f) return;
      f.mesh.visible = !wire;
      f.wire.visible = wire;
    }

    connectedCallback() {
      Object.assign(this.style, { display: 'block', position: 'absolute', inset: '0', width: '100%', height: '100%', overflow: 'hidden' });
      loadThree().then((T) => { if (!this._dead) this.build(T); }).catch(() => {});
    }
    disconnectedCallback() {
      this._dead = true;
      if (this._raf) cancelAnimationFrame(this._raf);
      if (this._ro) this._ro.disconnect();
      [['pointermove', this._onMove], ['pointerdown', this._onDown], ['pointerup', this._onUp],
       ['keydown', this._onKeyDown], ['keyup', this._onKeyUp], ['scroll', this._onScroll],
       ['operator:deploy', this._onDeploy]].forEach(([k, fn]) => fn && window.removeEventListener(k, fn));
      if (this._renderer) { this._renderer.dispose(); this._renderer.domElement.remove(); }
    }
    attributeChangedCallback(n, _o, v) {
      if (!this._T || !v) return;
      if (n === 'accent' && this._accentMats) this._accentMats.forEach((m) => {
        if (m.color) m.color.set(v);
        if (m.emissive) m.emissive.set(v);
      });
      if (n === 'motion') this._speed = SPEED[v] || 1;
      if (n === 'look') this._applyLook();
    }

    build(T) {
      this._T = T;
      const accent = new T.Color(this.getAttribute('accent') || '#ffb020');
      this._speed = SPEED[this.getAttribute('motion') || 'standard'] || 1;

      const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.outputEncoding = T.sRGBEncoding;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = T.PCFSoftShadowMap;
      Object.assign(renderer.domElement.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block' });
      this.appendChild(renderer.domElement);
      this._renderer = renderer;

      const scene = new T.Scene();
      scene.fog = new T.Fog(0x0a0e15, 7, 26);
      const camera = new T.PerspectiveCamera(38, 1, 0.1, 120);

      scene.add(new T.AmbientLight(0xffffff, 0.26));
      const key = new T.DirectionalLight(0xfff2dd, 1.15);
      key.position.set(2.2, 5.2, 4.2);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 0.5; key.shadow.camera.far = 16;
      key.shadow.camera.left = -4; key.shadow.camera.right = 4;
      key.shadow.camera.top = 5; key.shadow.camera.bottom = -1;
      key.shadow.bias = -0.0012;
      scene.add(key);
      const rimL = new T.PointLight(accent.getHex(), 1.6, 12); rimL.position.set(-3.2, 2.2, -2.4); scene.add(rimL);
      const fillR = new T.PointLight(0x7fa8ff, 1.5, 14); fillR.position.set(3.6, 1.7, -3.2); scene.add(fillR);

      const shadowPlane = new T.Mesh(new T.PlaneGeometry(60, 60), new T.ShadowMaterial({ opacity: 0.6 }));
      shadowPlane.rotation.x = -Math.PI / 2; shadowPlane.position.y = 0.002; shadowPlane.receiveShadow = true;
      scene.add(shadowPlane);

      const gl = [], EXT = 16, GAPG = 1.1;
      for (let i = -EXT; i <= EXT; i++) {
        gl.push(i * GAPG, 0, -EXT * GAPG, i * GAPG, 0, EXT * GAPG);
        gl.push(-EXT * GAPG, 0, i * GAPG, EXT * GAPG, 0, i * GAPG);
      }
      const gg = new T.BufferGeometry();
      gg.setAttribute('position', new T.BufferAttribute(new Float32Array(gl), 3));
      const gridMat = new T.LineBasicMaterial({ color: 0x5c6470, transparent: true, opacity: 0.16, fog: true });
      scene.add(new T.LineSegments(gg, gridMat));

      const shaftMat = new T.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.04, blending: T.AdditiveBlending, side: T.DoubleSide, depthWrite: false, fog: false });
      const shafts = new T.Group();
      [[-4.2, -0.22], [1.4, 0.08], [4.8, 0.28]].forEach(([x, tilt], i) => {
        const cone = new T.Mesh(new T.ConeGeometry(1.4 + i * 0.3, 12, 26, 1, true), shaftMat);
        cone.position.set(x, 5.4, -1.8 - i * 0.9);
        cone.rotation.z = tilt;
        shafts.add(cone);
      });
      scene.add(shafts);

      const DN = 1100, dp = new Float32Array(DN * 3), dv = new Float32Array(DN);
      for (let i = 0; i < DN; i++) {
        dp[i * 3] = (Math.random() - 0.5) * 20;
        dp[i * 3 + 1] = Math.random() * 8;
        dp[i * 3 + 2] = (Math.random() - 0.5) * 14;
        dv[i] = 0.12 + Math.random() * 0.4;
      }
      const dgeo = new T.BufferGeometry();
      dgeo.setAttribute('position', new T.BufferAttribute(dp, 3));
      scene.add(new T.Points(dgeo, new T.PointsMaterial({ color: accent, size: 0.035, transparent: true, opacity: 0.5, blending: T.AdditiveBlending, depthWrite: false, fog: true })));

      const rig = buildOperator(T, accent);
      this._rig = rig;
      const qKick = new T.Quaternion(), AXIS_X = new T.Vector3(1, 0, 0);
      scene.add(rig.root);
      const allMats = Object.keys(rig.mats).map((k) => rig.mats[k]);
      allMats.forEach((m) => { m.transparent = true; m.opacity = 0; });
      this._rigMats = rig.mats;
      this._applyLook();

      loadWeapon(T, rig, this.getAttribute('weapon') || 'czbren2.glb', accent, (mats) => {
        if (this._dead) return;
        mats.forEach((m, i) => {
          m.transparent = true;
          m.opacity = 0;
          rig.mats['wpn' + i] = m;
          allMats.push(m);
          if (m.name === 'wpnLens') (this._accentMats = this._accentMats || []).push(m);
        });
        this._applyLook();
      });

      attachRigged(T, rig, this.getAttribute('model') || 'operator-rigged.glb',
        this.getAttribute('bonemap') || 'bonemap.json', (mesh, mat, wire, wireMat) => {
        if (this._dead) return;
        allMats.push(mat, wireMat);
        this._figure = { mesh: mesh, wire: wire };
        this._applyLook();
      });

      const markMat = new T.LineBasicMaterial({ color: accent, transparent: true, opacity: 0, fog: false });
      const mark = new T.LineSegments(new T.WireframeGeometry(new T.RingGeometry(0.62, 0.635, 64)), markMat);
      mark.rotation.x = -Math.PI / 2; mark.position.y = 0.012;
      scene.add(mark);

      const flashMat = new T.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0, blending: T.AdditiveBlending, side: T.DoubleSide, depthWrite: false, fog: false });
      const flash = new T.Mesh(new T.PlaneGeometry(0.44, 0.44), flashMat);
      scene.add(flash);
      const tracerMat = new T.LineBasicMaterial({ color: accent, transparent: true, opacity: 0, blending: T.AdditiveBlending, fog: false });
      const tracerGeo = new T.BufferGeometry();
      tracerGeo.setAttribute('position', new T.BufferAttribute(new Float32Array(6), 3));
      scene.add(new T.Line(tracerGeo, tracerMat));

      const IMPACTS = 5, impacts = [];
      for (let i = 0; i < IMPACTS; i++) {
        const m = new T.LineBasicMaterial({ color: accent, transparent: true, opacity: 0, blending: T.AdditiveBlending, fog: false });
        const ring = new T.LineSegments(new T.WireframeGeometry(new T.RingGeometry(0.06, 0.07, 24)), m);
        ring.visible = false; scene.add(ring);
        const dir = [];
        for (let s = 0; s < 14; s++) {
          const a = Math.random() * Math.PI * 2, v = 0.3 + Math.random() * 0.9;
          dir.push(Math.cos(a) * v, Math.abs(Math.sin(a)) * v, (Math.random() - 0.5) * 0.4);
        }
        const sg = new T.BufferGeometry();
        sg.setAttribute('position', new T.BufferAttribute(new Float32Array(14 * 3), 3));
        const sm = new T.PointsMaterial({ color: accent, size: 0.035, transparent: true, opacity: 0, blending: T.AdditiveBlending, fog: false });
        const sparks = new T.Points(sg, sm);
        sparks.visible = false; scene.add(sparks);
        impacts.push({ ring: ring, m: m, sparks: sparks, sm: sm, dir: dir, life: 0 });
      }
      let impactCursor = 0;
      this._accentMats = (this._accentMats || []).concat([rig.mats.glow, shaftMat, flashMat, tracerMat, markMat]);
      impacts.forEach((i) => this._accentMats.push(i.m, i.sm));

      let camDist = 4.4, camBias = 1.5;
      const resize = () => {
        const w = this.clientWidth || 1, h = this.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        camDist = w >= 1400 ? 3.5 : w >= 1100 ? 3.75 : w >= 820 ? 4.3 : 5.2;
        camBias = w >= 1100 ? 0.12 : w >= 820 ? 0.1 : 0.05;
      };
      this._ro = new ResizeObserver(resize);
      this._ro.observe(this);
      resize();

      const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
      const keys = {};
      const clock = new T.Clock();
      const ray = new T.Raycaster();
      const aimPlane = new T.Plane(new T.Vector3(0, 0, 1), 0);
      const aim = new T.Vector3(0, 1.3, 2.3);
      const ndc = new T.Vector2();
      let lastMove = -99, deployed = !!window.__operatorDeployed, assembleT = 0;

      this._onMove = (e) => {
        ptr.tx = (e.clientX / innerWidth - 0.5) * 2;
        ptr.ty = (e.clientY / innerHeight - 0.5) * 2;
        lastMove = clock.elapsedTime;
      };
      this._onDeploy = () => { deployed = true; };
      window.addEventListener('pointermove', this._onMove, { passive: true });
      window.addEventListener('operator:deploy', this._onDeploy);

      const MAG = 30;
      let ammo = MAG, reloading = 0, firing = false, lastShot = 0, kick = 0, shake = 0, shots = 0;
      const hud = (hit) => window.dispatchEvent(new CustomEvent('operator:hud', {
        detail: { ammo: ammo, mag: MAG, reloading: reloading > 0, shots: shots, hit: !!hit }
      }));
      hud(false);
      const reload = () => { if (reloading || ammo === MAG) return; reloading = 1.4; hud(false); };

      this._onKeyDown = (e) => {
        const k = (e.key || '').toLowerCase();
        keys[k] = true;
        if (k === 'r') reload();
      };
      this._onKeyUp = (e) => { keys[(e.key || '').toLowerCase()] = false; };
      window.addEventListener('keydown', this._onKeyDown);
      window.addEventListener('keyup', this._onKeyUp);

      const wm = new T.Vector3(), wd = new T.Vector3();
      const fire = () => {
        if ((!deployed && !window.__operatorDeployed) || reloading > 0 || assembleT < 0.8) return;
        if (ammo <= 0) { reload(); return; }
        ammo--; shots++; kick = 1; shake = 1;
        rig.root.updateMatrixWorld(true);
        rig.muzzle.getWorldPosition(wm);
        rig.muzzle.getWorldDirection(wd);
        wd.multiplyScalar(-1);
        wd.x += (Math.random() - 0.5) * 0.02;
        wd.y += (Math.random() - 0.5) * 0.02;
        const hit = wm.clone().add(wd.clone().multiplyScalar(14));
        const tp = tracerGeo.getAttribute('position');
        tp.array[0] = wm.x; tp.array[1] = wm.y; tp.array[2] = wm.z;
        tp.array[3] = hit.x; tp.array[4] = hit.y; tp.array[5] = hit.z;
        tp.needsUpdate = true;
        tracerMat.opacity = 1;
        flash.position.copy(wm); flashMat.opacity = 1;
        const im = impacts[impactCursor];
        impactCursor = (impactCursor + 1) % IMPACTS;
        im.life = 1;
        im.ring.position.copy(hit); im.ring.lookAt(camera.position); im.ring.visible = true;
        im.sparks.position.copy(hit); im.sparks.visible = true;
        hud(true);
        if (ammo === 0) reload();
      };

      this._onDown = (e) => {
        if (e.button !== 0) return;
        if (e.target && e.target.closest && e.target.closest('a,button,input,textarea,select,[data-no-fire]')) return;
        if ((window.scrollY || 0) > innerHeight * 0.75) return;
        firing = true; fire();
      };
      this._onUp = () => { firing = false; };
      window.addEventListener('pointerdown', this._onDown);
      window.addEventListener('pointerup', this._onUp);

      let scrollY = window.scrollY || 0, targetScroll = scrollY;
      this._onScroll = () => { targetScroll = window.scrollY || 0; };
      window.addEventListener('scroll', this._onScroll, { passive: true });

      const dattr = dgeo.getAttribute('position');
      setTimeout(() => { deployed = true; }, 9000);

      const vel = new T.Vector2(0, 0);
      const camTarget = new T.Vector3();
      let phase = 0, aimYaw = 0, aimPitch = 0, orbit = 0, recoil = 0;

      const tick = () => {
        if (this._dead) return;
        this._raf = requestAnimationFrame(tick);
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime, s = this._speed;
        scrollY += (targetScroll - scrollY) * 0.08;
        const page = scrollY / Math.max(1, innerHeight);
        const inHero = page < 0.75;

        if (!deployed && window.__operatorDeployed) deployed = true;
        if (deployed && assembleT < 2) assembleT += dt * 0.9;
        const built = Math.min(1, assembleT / 1.2);
        const eb = built * built * (3 - 2 * built);
        const gone = Math.min(1, Math.max(0, (page - 0.12) * 1.9));
        const vis = eb * (1 - gone);
        allMats.forEach((m) => { m.opacity = vis * (m.userData.fade || 1); });
        markMat.opacity = 0.5 * vis;
        gridMat.opacity = 0.16 * (0.4 + 0.6 * eb);

        ptr.x += (ptr.tx - ptr.x) * 0.12;
        ptr.y += (ptr.ty - ptr.y) * 0.12;

        if (reloading > 0) {
          reloading -= dt;
          if (reloading <= 0) { reloading = 0; ammo = MAG; hud(false); }
        }
        if (firing && performance.now() - lastShot > 105) { lastShot = performance.now(); fire(); }

        const sprint = keys['shift'] ? 1.7 : 1;
        let ix = 0, iz = 0;
        if (inHero) {
          if (keys['w'] || keys['arrowup']) iz -= 1;
          if (keys['s'] || keys['arrowdown']) iz += 1;
          if (keys['a'] || keys['arrowleft']) ix -= 1;
          if (keys['d'] || keys['arrowright']) ix += 1;
        }
        const len = Math.hypot(ix, iz) || 1;
        const maxSp = 2.2 * sprint;
        vel.x += ((ix / len) * maxSp - vel.x) * 0.14;
        vel.y += ((iz / len) * maxSp - vel.y) * 0.14;
        rig.root.position.x = Math.max(-3.4, Math.min(3.4, rig.root.position.x + vel.x * dt));
        rig.root.position.z = Math.max(-2.6, Math.min(2.4, rig.root.position.z + vel.y * dt));
        const moving = Math.hypot(vel.x, vel.y);
        const walk = Math.min(1, moving / 2.2);

        const idle = moving < 0.05 ? Math.min(1, Math.max(0, (t - lastMove - 2.2) / 2.4)) : 0;
        if (idle <= 0.001) orbit = 0; else orbit += dt * 0.22;
        /* aim from a yaw-independent reference (the chest pivot in world space),
           otherwise the muzzle's own swing feeds back and spins him around */
        aimPlane.set(new T.Vector3(0, 0, 1), -(rig.root.position.z + 2.3));
        ndc.set(ptr.x, -ptr.y);
        ray.setFromCamera(ndc, camera);
        ray.ray.intersectPlane(aimPlane, aim);
        wm.set(rig.root.position.x, 1.32, rig.root.position.z);
        const dx = aim.x - wm.x, dy = aim.y - wm.y, dz = aim.z - wm.z;
        const yawT = Math.max(-0.7, Math.min(0.7, Math.atan2(dx, Math.max(1.2, dz)))) + Math.sin(orbit) * 0.55 * idle - (rig.aimYawOffset || 0);
        const pitchT = Math.atan2(dy, Math.max(1.2, Math.hypot(dx, dz)));
        aimYaw += (yawT - aimYaw) * 0.14;
        aimPitch += (pitchT - aimPitch) * 0.14;

        /* aim: hips turn part way, upper body carries the rest — the rifle is
           shouldered on the chest, so this points the barrel at the cursor */
        const yaw = Math.max(-1.1, Math.min(1.1, aimYaw));
        rig.root.rotation.y = yaw * 0.45;
        rig.chest.rotation.y = yaw * 0.55;
        const pitch = Math.max(-0.34, Math.min(0.34, -aimPitch));
        rig.chest.rotation.x = pitch - recoil * 0.1 + walk * 0.05;
        rig.chest.rotation.z = Math.sin(t * 0.8) * 0.012;
        rig.neck.rotation.x = pitch * 0.3;
        rig.head.rotation.y = -yaw * 0.15;
        /* recoil and reload play out as offsets from the socket transform, in the weapon's
           own axes — the grip itself can never drift */
        if (rig.rifleBase) {
          const b = rig.rifleBase;
          let kickPitch = -recoil * 0.13, kickBack = recoil * 0.03;
          if (reloading > 0) {
            const r = 1 - Math.abs(reloading / 1.4 - 0.5) * 2;
            kickPitch = 0.5 * r;
            kickBack = 0.045 * r;
          }
          rig.rifle.position.copy(b.pos).addScaledVector(rig.recoilAxis, -kickBack);
          rig.rifle.quaternion.copy(b.quat).multiply(qKick.setFromAxisAngle(AXIS_X, kickPitch));
        }



        phase += dt * (5.4 + 3 * walk) * (moving > 0.05 ? 1 : 0) * s;
        rig.legs.L.hip.rotation.x = Math.sin(phase) * 0.5 * walk;
        rig.legs.R.hip.rotation.x = Math.sin(phase + Math.PI) * 0.5 * walk;
        rig.legs.L.knee.rotation.x = Math.max(0, -Math.sin(phase + 0.7)) * 0.85 * walk;
        rig.legs.R.knee.rotation.x = Math.max(0, -Math.sin(phase + Math.PI + 0.7)) * 0.85 * walk;
        rig.hips.position.y = rig.hipsRestY + Math.abs(Math.sin(phase * 2)) * 0.022 * walk + Math.sin(t * 1.1) * 0.006;
        rig.hips.rotation.z = Math.sin(phase) * 0.03 * walk;
        if (rig.sync) rig.sync();
        mark.position.x = rig.root.position.x;
        mark.position.z = rig.root.position.z;
        mark.rotation.z = t * 0.25;

        recoil += (0 - recoil) * 0.14;
        recoil = Math.max(recoil, kick);
        kick *= 0.82; shake *= 0.8;
        tracerMat.opacity *= 0.68;
        flashMat.opacity *= 0.5;
        flash.scale.setScalar(0.6 + flashMat.opacity);
        flash.lookAt(camera.position);

        for (const im of impacts) {
          if (im.life <= 0) continue;
          im.life -= dt * 2.2;
          const l = Math.max(0, im.life), age = 1 - l;
          im.m.opacity = l * 0.9;
          im.ring.scale.setScalar(0.5 + age * 3);
          im.sm.opacity = l * l;
          const sp = im.sparks.geometry.getAttribute('position');
          for (let k = 0; k < 14; k++) {
            sp.array[k * 3] = im.dir[k * 3] * age * 0.6;
            sp.array[k * 3 + 1] = im.dir[k * 3 + 1] * age * 0.6 - age * age * 0.5;
            sp.array[k * 3 + 2] = im.dir[k * 3 + 2] * age * 0.6;
          }
          sp.needsUpdate = true;
          if (im.life <= 0) { im.ring.visible = false; im.sparks.visible = false; }
        }

        for (let i = 0; i < DN; i++) {
          dattr.array[i * 3 + 1] += dv[i] * dt;
          if (dattr.array[i * 3 + 1] > 8) dattr.array[i * 3 + 1] = 0;
        }
        dattr.needsUpdate = true;
        shafts.rotation.y = Math.sin(t * 0.06) * 0.05;

        const push = Math.min(1, assembleT / 1.5);
        const ep = push * push * (3 - 2 * push);
        const dist = camDist + (1 - ep) * 2.8;
        camTarget.set(rig.root.position.x - camBias, 1.54 + pitch * 0.3 + page * 0.5, rig.root.position.z);
        camera.position.set(
          rig.root.position.x - camBias * 0.35 + Math.sin(orbit * 0.5) * 0.5 * idle + ptr.x * 0.25 + (Math.random() - 0.5) * shake * 0.04,
          1.9 - pitch * 0.4 - ptr.y * 0.12 + page * 0.6 + (Math.random() - 0.5) * shake * 0.04,
          rig.root.position.z + dist
        );
        camera.lookAt(camTarget);

        renderer.render(scene, camera);
      };
      tick();
    }
  }
  customElements.define('operator-scene', OperatorScene);
})();
