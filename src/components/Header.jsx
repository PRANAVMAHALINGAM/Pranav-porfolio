// src/components/Header.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Github, FileDown, Menu, X } from 'lucide-react';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header">
      <div className="header-container container">
        <Link to="/" className="logo-area" onClick={closeMenu}>
          <div className="logo-icon">P</div>
          <span className="logo-text">PRANAV</span>
        </Link>
        
        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/about" className="nav-link" onClick={closeMenu}>About</Link>
          <Link to="/projects" className="nav-link" onClick={closeMenu}>Projects</Link>
          <Link to="/volunteering" className="nav-link" onClick={closeMenu}>Volunteering</Link>
          <Link to="/awards" className="nav-link" onClick={closeMenu}>Awards</Link>
          <Link to="/contact" className="nav-link" onClick={closeMenu}>Contact</Link>
        </nav>

        <div className="header-actions">
          <div className="social-icons">
            <a href="https://www.linkedin.com/in/pranav-mahalingam/" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin size={20} /></a>
            <a href="https://github.com/PRANAVMAHALINGAM" aria-label="GitHub" target="_blank" rel="noreferrer"><Github size={20} /></a>
            <a href="/Pranav_Software_Engineer_Resume.pdf" aria-label="Resume" target="_blank" rel="noreferrer" download="Pranav_Software_Engineer_Resume.pdf"><FileDown size={20} /></a>
          </div>
          <button className="menu-btn" aria-label="Menu" onClick={toggleMenu} style={{ zIndex: 101 }}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
