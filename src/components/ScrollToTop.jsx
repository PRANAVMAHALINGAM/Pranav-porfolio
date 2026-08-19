import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* Router navigations keep the scroll offset by default, which lands you
   mid-page on the next route. Reset on every path change, but leave hash
   links alone so in-page anchors still work. */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    // 'instant' overrides the global `scroll-behavior: smooth`, which would
    // otherwise animate a whole page's worth of scroll on every navigation.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
