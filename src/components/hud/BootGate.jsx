import { useEffect, useRef, useState } from 'react';

/* Terminal boot sequence over a black plate. Once the lines finish it waits for
   any key or click (or 7s) and then fires 'operator:deploy', which is what tells
   <operator-scene> to assemble the operator. */

const BOOT = [
  { t: 'OMEGA TERMINAL v4.2 — SECURE LINK', s: 'OK' },
  { t: 'AUTHENTICATING OPERATOR', s: 'OK' },
  { t: 'PROFILE: PRANAV MAHALINGAM', s: 'LOADED' },
  { t: 'NEURAL STACK: PYTHON / TORCH / AWS', s: 'MOUNTED' },
  { t: 'MISSION LOG: 4 TOURS, 20+ BUILDS', s: 'SYNCED' },
  { t: 'CONTRACT STATUS', s: 'AVAILABLE' }
];

const STEP_MS = 260;
const AUTO_DEPLOY_MS = 7000;
const FADE_MS = 540;

const BootGate = ({ onDeploy }) => {
  /* The boot sequence is a first-impression, not a toll gate: once the operator
     has deployed this session, coming back to "/" from another route skips
     straight past it instead of replaying the whole thing. */
  const [skipped] = useState(() => !!window.__operatorDeployed);
  const [lines, setLines] = useState([]);
  const [armed, setArmed] = useState(false);
  const [closing, setClosing] = useState(false);
  const [gone, setGone] = useState(skipped);
  const firedRef = useRef(skipped);

  // Type the boot log out one line at a time.
  useEffect(() => {
    if (skipped) return undefined;

    let i = 0;
    const id = setInterval(() => {
      if (i >= BOOT.length) {
        clearInterval(id);
        setArmed(true);
        return;
      }
      const line = BOOT[i++];
      setLines((prev) => prev.concat(line));
    }, STEP_MS);
    return () => clearInterval(id);
  }, [skipped]);

  // Once armed, any input deploys — as does the 7s timeout, so nobody is stuck.
  useEffect(() => {
    if (!armed || skipped) return undefined;

    const go = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      setClosing(true);
      window.__operatorDeployed = true;
      window.dispatchEvent(new CustomEvent('operator:deploy'));
      onDeploy?.();
      setTimeout(() => setGone(true), FADE_MS);
    };

    window.addEventListener('keydown', go);
    window.addEventListener('pointerdown', go);
    const auto = setTimeout(go, AUTO_DEPLOY_MS);

    return () => {
      window.removeEventListener('keydown', go);
      window.removeEventListener('pointerdown', go);
      clearTimeout(auto);
    };
  }, [armed, skipped, onDeploy]);

  if (gone) return null;

  return (
    <div className={`gate${closing ? ' gate--closing' : ''}`}>
      <div className="gate__lines">
        {lines.map((l) => (
          <div className="gate__line" key={l.t}>
            <span className="gate__chevron">&gt;</span>
            <span>{l.t}</span>
            <span className="gate__ok">{l.s}</span>
          </div>
        ))}
        <span className="gate__caret" aria-hidden="true" />
      </div>
      {armed && (
        <div className="gate__prompt">
          <span className="gate__rule" aria-hidden="true" />
          PRESS ANY KEY TO DEPLOY
        </div>
      )}
    </div>
  );
};

export default BootGate;
