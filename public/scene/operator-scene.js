/* <operator-scene> — the posed operator in a dark hangar.
   WASD to move, mouse to aim, click to fire, R to reload. Assembles on
   'operator:deploy'. Broadcasts 'operator:hud' {ammo, mag, reloading, shots, hit}.
   Attributes: accent, motion (calm|standard|aggressive), look (textured|wireframe)

   The pose is the art, not something this file computes. The previous version
   rebuilt a proxy skeleton, solved IK to put the hands on a weapon, and
   retargeted the result onto the real bones every frame. That only works for a
   rig exported in T-pose, and even then the stance took constant tuning.

   This version loads the operator exactly as posed in Blender — rifle
   shouldered, hands already on the grips, weapon parented to the hand — and
   never rewrites a bone. Everything it animates is a small ADDITIVE offset on
   top of that pose:

     aim      yaw the root, add a little chest yaw and pitch
     walk     bob the root, swing thighs and knees a few degrees
     breathe  a slow sine on the chest
     recoil   a kick on the weapon node, in the weapon's own axes

   None of that can collapse the mesh, because the baked pose is always the rest
   the offsets are measured from. */
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

  /* How the bladed stance is framed. 1 squares the shoulders to the camera so he
     reads as facing the viewer; 0 turns him until the muzzle points at the
     cursor, leaving him in profile. Anything between is a partial turn. */
  const FACE_FRONT = 1;

  /* GLTFLoader sanitizes node names, so "mixamorig:Hips" arrives as
     "mixamorigHips" and "DEF-spine.003" as "DEF-spine003". */
  const bkey = (s) => String(s).replace(/\s/g, '_').replace(/[.:/[\]]/g, '');

  /* Only these bones are ever touched; the rest keep the exported pose. Used
     when the bonemap is missing a role — covers both rigs this project has had. */
  const GUESSES = {
    hips: ['mixamorig:Hips', 'DEF-spine'],
    chest: ['mixamorig:Spine2', 'DEF-spine.003'],
    neck: ['mixamorig:Neck', 'DEF-spine.004'],
    head: ['mixamorig:Head', 'DEF-spine.006'],
    thighL: ['mixamorig:LeftUpLeg', 'DEF-thigh.L'],
    kneeL: ['mixamorig:LeftLeg', 'DEF-shin.L'],
    thighR: ['mixamorig:RightUpLeg', 'DEF-thigh.R'],
    kneeR: ['mixamorig:RightLeg', 'DEF-shin.R']
  };

  /* Loads the operator, stands him on the floor, and wires up the handful of
     bones the tick may nudge. Calls done(info) when usable, done(null) on
     failure — the hangar renders either way. */
  function loadOperator(T, rig, url, mapPromise, done) {
    Promise.resolve(mapPromise).catch(() => null).then((bm) => {
      new T.GLTFLoader().load(url, (gltf) => {
        const model = gltf.scene;
        const byName = {};
        let skinned = null;
        model.traverse((o) => {
          if (o.name) { byName[o.name] = o; byName[bkey(o.name)] = o; }
          if (o.isSkinnedMesh && !skinned) skinned = o;
          if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; }
        });

        const names = (bm && bm.bones) || {};
        const find = (role) => {
          if (names[role] && byName[bkey(names[role])]) return byName[bkey(names[role])];
          for (const g of (GUESSES[role] || [])) if (byName[bkey(g)]) return byName[bkey(g)];
          return null;
        };

        rig.root.add(model);
        model.updateMatrixWorld(true);

        /* Turn him to face the camera. The export can point anywhere, and this
           has to be baked in rather than left to the aim channel: aim yaw is
           clamped to +-1.1rad, so it can correct a few degrees of framing but
           never a half-turn — that is what left him stuck in profile.

           "Facing front" means the shoulder line runs across the screen. A
           character facing +Z with +Y up has their left hand on +X, so rotate
           until the right-to-left shoulder vector lands there. */
        const shoulderL = find('shoulderL') || find('thighL');
        const shoulderR = find('shoulderR') || find('thighR');
        let bodyYaw = 0;
        if (shoulderL && shoulderR) {
          const across = shoulderL.getWorldPosition(new T.Vector3())
            .sub(shoulderR.getWorldPosition(new T.Vector3()))
            .setY(0).normalize();
          bodyYaw = Math.atan2(across.x, across.z) - Math.PI / 2;
          model.rotation.y -= bodyYaw;
          model.updateMatrixWorld(true);
        }

        /* Stand him on the floor and centre him over the root, so root.position
           is the character's own position and the marker ring lands under him.
           Measured after the turn, or the offset would be rotated out of place. */
        const box = new T.Box3().setFromObject(model);
        const mid = box.getCenter(new T.Vector3());
        model.position.x -= mid.x;
        model.position.z -= mid.z;
        model.position.y -= box.min.y;
        model.updateMatrixWorld(true);

        /* One additive channel per driven bone: the tick writes euler offsets to
           a detached dummy, sync() composes them onto the bone's posed rest. */
        const channels = [];
        const bind = (role, dummy) => {
          const bone = find(role);
          if (bone) channels.push({ bone: bone, dummy: dummy, rest: bone.quaternion.clone() });
        };
        bind('hips', rig.hips);
        bind('chest', rig.chest);
        bind('neck', rig.neck);
        bind('head', rig.head);
        bind('thighL', rig.legs.L.hip);
        bind('kneeL', rig.legs.L.knee);
        bind('thighR', rig.legs.R.hip);
        bind('kneeR', rig.legs.R.knee);

        const q = new T.Quaternion();
        rig.sync = () => {
          for (let i = 0; i < channels.length; i++) {
            const c = channels[i];
            c.bone.quaternion.copy(c.rest).multiply(q.setFromEuler(c.dummy.rotation));
          }
          /* the walk bob rides the whole body rather than the hips bone, so the
             legs keep their posed relationship to the feet */
          rig.root.position.y = rig.hips.position.y - rig.hipsRestY;
        };

        /* The weapon is already parented to a hand in the export. Give it a
           muzzle node whose -Z runs down the barrel, which is what fire() reads. */
        const wp = (bm && bm.weapon) || {};
        const weapon = (wp.node && byName[bkey(wp.node)]) || byName.CZ_Bren || null;
        if (weapon) {
          const tip = (wp.muzzle && byName[bkey(wp.muzzle)]) || byName.MUZZLE || null;
          const wbox = new T.Box3().setFromObject(weapon);
          const wmid = wbox.getCenter(new T.Vector3());
          const tipWorld = tip ? tip.getWorldPosition(new T.Vector3())
            : wmid.clone().addScaledVector(new T.Vector3(0, 0, 1), wbox.getSize(new T.Vector3()).length() * 0.4);
          const dirWorld = tipWorld.clone().sub(wmid).normalize();
          const invWQ = weapon.getWorldQuaternion(new T.Quaternion()).invert();
          const dirLocal = dirWorld.clone().applyQuaternion(invWQ).normalize();

          const muzzle = new T.Object3D();
          weapon.add(muzzle);
          muzzle.position.copy(weapon.worldToLocal(tipWorld.clone()));
          muzzle.quaternion.setFromUnitVectors(new T.Vector3(0, 0, -1), dirLocal);
          rig.muzzle.parent && rig.muzzle.parent.remove(rig.muzzle);
          rig.muzzle = muzzle;

          rig.rifle = weapon;
          rig.rifleBase = { pos: weapon.position.clone(), quat: weapon.quaternion.clone() };
          rig.recoilAxis = dirLocal.clone().applyQuaternion(weapon.quaternion).normalize();
        }

        /* Collect every material once, so the fade-in, the accent swap and the
           wireframe toggle all have something to hold. */
        const mats = {};
        let n = 0;
        model.traverse((o) => {
          if (!o.isMesh) return;
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
            if (!m) return;
            const k = m.name || ('mat' + (n++));
            if (mats[k]) return;
            m.transparent = true;
            m.opacity = 0;
            if (m.map) m.map.encoding = T.sRGBEncoding;
            if ('envMapIntensity' in m) m.envMapIntensity = 0.5;
            mats[k] = m;
          });
        });

        /* The stance is bladed: the barrel does not run down the body's own
           forward, so the two cannot both point at the camera. FACE_FRONT picks
           where on that trade-off to sit — 1 keeps the shoulders square to the
           viewer (what a hero shot wants), 0 swings the body until the muzzle
           tracks the cursor exactly (what a shooter wants). */
        rig.root.updateMatrixWorld(true);
        if (rig.muzzle.parent) {
          const d = new T.Vector3(0, 0, -1)
            .applyQuaternion(rig.muzzle.getWorldQuaternion(new T.Quaternion()));
          rig.aimYawOffset = Math.atan2(d.x, d.z) * (1 - FACE_FRONT);
        }

        rig.ready = true;
        done({ mats: mats, skinned: skinned, weapon: weapon });
      }, undefined, () => done(null));
    });
  }

  class OperatorScene extends HTMLElement {
    static get observedAttributes() { return ['accent', 'motion', 'look']; }

    _applyLook() {
      const M = this._rigMats;
      if (!M) return;
      const wire = (this.getAttribute('look') || 'textured') === 'wireframe';
      Object.keys(M).forEach((k) => {
        const m = M[k];
        if (!m || m.name === 'wpnLens' || m.name === 'glass_lens') return;
        if (m.userData.solidHex === undefined && m.color) m.userData.solidHex = m.color.getHex();
        m.wireframe = wire;
        if (m.color) m.color.setHex(wire ? 0xe9e7e2 : m.userData.solidHex);
        m.userData.fade = wire ? 0.34 : 1;
      });
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

      /* Empty holders so the hangar renders while the model streams in;
         loadOperator fills them and flips `ready`. */
      const rig = {
        root: new T.Group(),
        hips: new T.Object3D(), chest: new T.Object3D(), neck: new T.Object3D(), head: new T.Object3D(),
        legs: { L: { hip: new T.Object3D(), knee: new T.Object3D() }, R: { hip: new T.Object3D(), knee: new T.Object3D() } },
        muzzle: new T.Object3D(),
        rifle: null, rifleBase: null, recoilAxis: new T.Vector3(0, 0, -1),
        hipsRestY: 0, aimYawOffset: 0, sync: null, ready: false
      };
      rig.muzzle.position.set(0, 1.4, 0.5);
      rig.root.add(rig.muzzle);
      scene.add(rig.root);
      this._rig = rig;

      const qKick = new T.Quaternion(), AXIS_X = new T.Vector3(1, 0, 0);
      const allMats = [];
      this._accentMats = this._accentMats || [];

      const bonemapP = fetch(this.getAttribute('bonemap') || 'bonemap.json')
        .then((r) => r.json()).catch(() => null);

      loadOperator(T, rig, this.getAttribute('model') || 'operator-rigged.glb', bonemapP, (info) => {
        if (this._dead || !info) return;
        this._rigMats = info.mats;
        Object.keys(info.mats).forEach((k) => {
          const m = info.mats[k];
          allMats.push(m);
          if (m.name === 'wpnLens' || m.name === 'glass_lens') {
            if (m.emissive) m.emissive.set(accent);
            if (m.color) m.color.set(accent);
            this._accentMats.push(m);
          }
        });
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
      this._accentMats = this._accentMats.concat([shaftMat, flashMat, tracerMat, markMat]);
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
        if ((!deployed && !window.__operatorDeployed) || reloading > 0 || assembleT < 0.8 || !rig.ready) return;
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
        /* aim from a yaw-independent reference (the body pivot in world space),
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

        /* Aim: the root carries most of the turn, the chest adds the rest. Both
           are offsets — the shouldered pose underneath is never rewritten, so the
           weapon stays exactly where the artist put it relative to the hands. */
        const yaw = Math.max(-1.1, Math.min(1.1, aimYaw));
        rig.root.rotation.y = yaw * 0.72;
        rig.chest.rotation.y = yaw * 0.28;
        const pitch = Math.max(-0.34, Math.min(0.34, -aimPitch));
        rig.chest.rotation.x = pitch * 0.65 - recoil * 0.06 + walk * 0.03;
        rig.chest.rotation.z = Math.sin(t * 0.8) * 0.012 + Math.sin(t * 1.6) * 0.005;
        rig.neck.rotation.x = pitch * 0.25;
        rig.head.rotation.y = -yaw * 0.12;

        /* recoil and reload play out as offsets from the weapon's posed transform,
           in the weapon's own axes — the grip itself can never drift */
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

        /* Legs: a shallow swing over the posed stance. Deliberately small — the
           pose is a planted firing stance, and a full stride would fight it. */
        phase += dt * (5.4 + 3 * walk) * (moving > 0.05 ? 1 : 0) * s;
        rig.legs.L.hip.rotation.x = Math.sin(phase) * 0.34 * walk;
        rig.legs.R.hip.rotation.x = Math.sin(phase + Math.PI) * 0.34 * walk;
        rig.legs.L.knee.rotation.x = Math.max(0, -Math.sin(phase + 0.7)) * 0.5 * walk;
        rig.legs.R.knee.rotation.x = Math.max(0, -Math.sin(phase + Math.PI + 0.7)) * 0.5 * walk;
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
