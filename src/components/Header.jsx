import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Linkedin, Github, FileDown, Menu, X } from 'lucide-react';
import { profile } from '../data/profileData';
import './Header.css';

const LINKS = [
  { to: '/', num: '01', label: 'HOME' },
  { to: '/about', num: '02', label: 'ABOUT' },
  { to: '/projects', num: '03', label: 'PROJECTS' },
  { to: '/awards', num: '04', label: 'AWARDS' },
  { to: '/blog', num: '05', label: 'BLOG' },
  { to: '/volunteering', num: '06', label: 'FIELD' },
  { to: '/contact', num: '07', label: 'COMMS' }
];

/* The header slides in once the hero is behind you — 0.55 of the same 0.7vh
   ramp the hero furniture fades over, so the two swap in one motion. */
const TRIGGER = 0.55 * 0.7;
const pastHero = () => (window.scrollY || 0) > (window.innerHeight || 1) * TRIGGER;

const Header = () => {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(pastHero);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(pastHero());
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sub-pages have no hero to defer to, so the header is simply always on.
  const shown = !isHome || scrolled;

  return (
    <header className={`site-header${shown ? ' site-header--on' : ''}${menuOpen ? ' site-header--open' : ''}`}>
      <Link to="/" className="site-header__brand" onClick={() => setMenuOpen(false)}>
        <span className="monogram">PM</span>
        <span className="site-header__name">{profile.name.toUpperCase()}</span>
        <span className="dim-slash">/</span>
        <span className="site-header__tag">{profile.tagline}</span>
      </Link>

      <nav className="site-header__nav" aria-label="Site">
        {LINKS.map((l) => (
          <NavLink
            to={l.to}
            key={l.to}
            end={l.to === '/'}
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) => `site-header__link${isActive ? ' is-active' : ''}`}
          >
            <span className="nav-index">{l.num}</span>{l.label}
          </NavLink>
        ))}
      </nav>

      <div className="site-header__actions">
        <div className="site-header__status">
          <span className="pip" aria-hidden="true" />
          {profile.status}
        </div>
        <div className="site-header__socials">
          <a href="https://www.linkedin.com/in/pranav-mahalingam/" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin size={16} /></a>
          <a href="https://github.com/PRANAVMAHALINGAM" aria-label="GitHub" target="_blank" rel="noreferrer"><Github size={16} /></a>
          <a href={profile.resume} aria-label="Resume" target="_blank" rel="noreferrer" download><FileDown size={16} /></a>
        </div>
        <button
          className="site-header__menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
};

export default Header;
