import { useEffect, useRef, useState } from 'react';

/* Thin React wrapper around the <operator-scene> custom element.
   The element self-registers when public/scene/operator-scene.js runs, so we
   load that script once and only mount the tag afterwards — otherwise React
   renders an unknown element that never upgrades.

   The scene assembles the operator on window 'operator:deploy' (see BootGate)
   and broadcasts 'operator:hud' each frame (see HudLayer). */

const SRC = '/scene/operator-scene.js';
let scriptPromise = null;

function loadScene() {
  if (window.customElements?.get('operator-scene')) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SRC;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  }).catch(() => {
    // A failed scene is not a failed page — the rest of the site renders fine.
    scriptPromise = null;
  });

  return scriptPromise;
}

const OperatorScene = ({ accent = '#ffb020', motion = 'standard', look = 'textured' }) => {
  const hostRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadScene().then(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, []);

  /* Attributes go on imperatively: operator-scene watches accent/motion/look
     through attributeChangedCallback, and React would otherwise stringify
     nothing useful onto an unknown element. */
  useEffect(() => {
    const node = hostRef.current;
    if (!node) return;
    node.setAttribute('accent', accent);
    node.setAttribute('motion', motion);
    node.setAttribute('look', look);
  }, [ready, accent, motion, look]);

  if (!ready) return null;

  return (
    <operator-scene
      ref={hostRef}
      model="/scene/operator-rigged.glb"
      weapon="/scene/czbren2.glb"
      bonemap="/scene/bonemap.json"
    />
  );
};

export default OperatorScene;
