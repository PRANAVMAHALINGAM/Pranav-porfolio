// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Instagram, Menu } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container container">
        <Link to="/" className="logo-area">
          <div className="logo-icon">P</div>
          <span className="logo-text">PRANAV</span>
        </Link>
        
        <nav className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/projects" className="nav-link">Projects</Link>
          <Link to="/volunteering" className="nav-link">Volunteering</Link>
          <Link to="/awards" className="nav-link">Awards</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>

        <div className="header-actions">
          <div className="social-icons">
            <a href="https://bit.ly/mpranavm" aria-label="Website" target="_blank" rel="noreferrer"><Globe size={20} /></a>
            <a href="https://linkedin.com/in/pranavmahalingam" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Instagram size={20} /></a>
          </div>
          <button className="menu-btn" aria-label="Menu">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
