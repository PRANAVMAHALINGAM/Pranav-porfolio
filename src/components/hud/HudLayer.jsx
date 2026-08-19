import { useCallback, useEffect, useRef, useState } from 'react';

/* Every fixed overlay on the home page: CRT scanlines, vignette, film grain,
   the objective feed, the crosshair and the ammo readout.

   Reads 'operator:hud' from <operator-scene>. The numeric parts drive React
   state; the recoil punch and hit marker are written straight to the DOM
   because they fire on single frames and must not queue a re-render. */

const FEED_TTL_MS = 4200;
const FEED_MAX = 4;
const BAR_COUNT = 10;

const HudLayer = ({ deployed }) => {
  const [ammo, setAmmo] = useState({ ammo: 30, mag: 30, reloading: false, shots: 0 });
  const [feed, setFeed] = useState([]);
  const [inHero, setInHero] = useState(true);

  const reticleRef = useRef(null);
  const reticleInnerRef = useRef(null);
  const hitMarkRef = useRef(null);
  const ammoRef = useRef(30);
  const pointerSeenRef = useRef(false);
  const timersRef = useRef({});

  const notify = useCallback((tag, text) => {
    const id = `${Date.now()}-${Math.random()}`;
    setFeed((prev) => prev.concat({ id, tag, text }).slice(-FEED_MAX));
    setTimeout(() => setFeed((prev) => prev.filter((n) => n.id !== id)), FEED_TTL_MS);
  }, []);

  /* ------------------------------------------------------------- hud events */

  useEffect(() => {
    const timers = timersRef.current;

    const onHud = (e) => {
      const d = e.detail || {};

      // Punch the crosshair whenever a round actually left the barrel.
      if (d.ammo < ammoRef.current && reticleInnerRef.current) {
        const inner = reticleInnerRef.current;
        inner.style.transform = 'scale(1.85)';
        clearTimeout(timers.punch);
        timers.punch = setTimeout(() => { inner.style.transform = 'scale(1)'; }, 70);
      }

      if (d.hit && hitMarkRef.current) {
        const hm = hitMarkRef.current;
        hm.style.opacity = '1';
        clearTimeout(timers.hit);
        timers.hit = setTimeout(() => { hm.style.opacity = '0'; }, 110);
      }

      ammoRef.current = d.ammo;
      setAmmo({ ammo: d.ammo, mag: d.mag, reloading: !!d.reloading, shots: d.shots || 0 });
    };

    window.addEventListener('operator:hud', onHud);
    return () => {
      window.removeEventListener('operator:hud', onHud);
      clearTimeout(timers.punch);
      clearTimeout(timers.hit);
    };
  }, []);

  /* --------------------------------------------------- pointer + hero scope */

  useEffect(() => {
    const heroBound = () => (window.scrollY || 0) < window.innerHeight * 0.75;

    const onScroll = () => setInHero(heroBound());

    const onMove = (e) => {
      if (e.pointerType !== 'touch') pointerSeenRef.current = true;
      const node = reticleRef.current;
      if (!node) return;
      node.style.opacity = heroBound() ? '1' : '0';
      node.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  /* Only swap the system cursor for the crosshair once a pointer has actually
     moved, so keyboard and touch visitors never lose their cursor. */
  useEffect(() => {
    document.documentElement.style.cursor = inHero && pointerSeenRef.current ? 'none' : '';
    return () => { document.documentElement.style.cursor = ''; };
  }, [inHero]);

  /* ---------------------------------------------------- objective callouts */

  useEffect(() => {
    if (!deployed) return undefined;

    const status = setTimeout(() => notify('STATUS', 'OPERATOR AVAILABLE FOR CONTRACT'), 900);
    if (!('IntersectionObserver' in window)) return () => clearTimeout(status);

    const seen = {};
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const label = e.target.getAttribute('data-screen-label') || '';
        if (!e.isIntersecting || seen[label] || /hero/i.test(label)) return;
        seen[label] = 1;
        notify('OBJECTIVE', label.toUpperCase());
      });
    }, { threshold: 0.45 });

    document.querySelectorAll('[data-screen-label]').forEach((node) => io.observe(node));

    return () => { clearTimeout(status); io.disconnect(); };
  }, [deployed, notify]);

  /* ------------------------------------------------------------------ view */

  const filled = Math.ceil((ammo.ammo / ammo.mag) * BAR_COUNT);
  const hudStyle = { opacity: inHero ? 1 : 0, transition: 'opacity 220ms ease' };

  return (
    <>
      <div className="scanlines" />
      <div className="vignette-global" />
      <div className="grain" />

      <div className="feed" role="status" aria-live="polite">
        {feed.map((n) => (
          <div className="feed__item" key={n.id}>
            <span className="feed__tag">{n.tag}</span>
            <span className="feed__text">{n.text}</span>
          </div>
        ))}
      </div>

      <div className="hud-hint" style={hudStyle}>
        WASD MOVE &middot; MOUSE AIM &middot; CLICK FIRE &middot; [R] RELOAD
      </div>

      <div className="hud-ammo" style={hudStyle}>
        <div className="hud-ammo__readout">
          <div className="hud-ammo__meta">
            <span>5.56 &times; 45</span>
            <span className="hud-ammo__shots">SHOTS {ammo.shots}</span>
          </div>
          <div className="hud-ammo__count">
            <span className="hud-ammo__current">{ammo.ammo}</span>
            <span className="hud-ammo__mag">/ {ammo.mag}</span>
          </div>
        </div>
        <div className="hud-ammo__bars" aria-hidden="true">
          {Array.from({ length: BAR_COUNT }, (_, i) => (
            <span key={i} className={`hud-ammo__bar${i < filled ? ' hud-ammo__bar--on' : ''}`} />
          ))}
        </div>
      </div>

      {ammo.reloading && inHero && <div className="reload-flag">RELOADING</div>}

      <div className="reticle" ref={reticleRef} aria-hidden="true">
        <div className="reticle__inner" ref={reticleInnerRef}>
          <span className="reticle__arm reticle__arm--n" />
          <span className="reticle__arm reticle__arm--s" />
          <span className="reticle__arm reticle__arm--w" />
          <span className="reticle__arm reticle__arm--e" />
          <span className="reticle__dot" />
          <span className="hitmark" ref={hitMarkRef}>
            <span className="hitmark__tick hitmark__tick--nw" />
            <span className="hitmark__tick hitmark__tick--ne" />
            <span className="hitmark__tick hitmark__tick--sw" />
            <span className="hitmark__tick hitmark__tick--se" />
          </span>
        </div>
      </div>
    </>
  );
};

export default HudLayer;
