import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/* Router navigations keep the scroll offset by default, which lands you
   mid-page on the next route. Reset on every path change, but leave hash
   links alone so in-page anchors still work. */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
