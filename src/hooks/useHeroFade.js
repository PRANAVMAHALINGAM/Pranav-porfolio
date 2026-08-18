import { useEffect, useRef } from 'react';

/* Fades and lifts the hero furniture as you scroll off it, so the page trades
   the "game menu" state for the document state. Written straight to style
   because it runs on every scroll frame and must not queue React renders.

   Attach the returned ref to a container; every descendant carrying
   data-hero-fade is faded, and data-hero-fade="title" also gets the parallax. */

export default function useHeroFade() {
  const ref = useRef(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const nodes = Array.from(root.querySelectorAll('[data-hero-fade]'));

    const onScroll = () => {
      const h = window.innerHeight || 1;
      const p = Math.min(1, (window.scrollY || 0) / (h * 0.7));
      const opacity = String(1 - Math.min(1, p * 1.5));

      nodes.forEach((node) => {
        node.style.opacity = opacity;
        if (node.dataset.heroFade === 'title') node.style.transform = `translateY(${-p * 42}px)`;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return ref;
}
