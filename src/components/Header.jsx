// src/components/Header.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Github, FileDown, Menu } from 'lucide-react';
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
            <a href="https://www.linkedin.com/in/pranav-mahalingam/" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin size={20} /></a>
            <a href="https://github.com/PRANAVMAHALINGAM" aria-label="GitHub" target="_blank" rel="noreferrer"><Github size={20} /></a>
            <a href="/Pranav_Software_Engineer_Resume.pdf" aria-label="Resume" target="_blank" rel="noreferrer" download="Pranav_Software_Engineer_Resume.pdf"><FileDown size={20} /></a>
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
