// src/components/Hero.jsx
import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-container container">
        
        <div className="hero-left">
          <p className="greeting">Hey, my name is</p>
          <h1 className="hero-title">PRANAV<br/>MAHALINGAM</h1>
          <div className="underline-squiggle">
            <svg width="220" height="20" viewBox="0 0 220 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.5 13.5C22.5 3.5 37.5 16 57 16C76.5 16 90.5 5.5 110.5 7C130.5 8.5 145 13.5 167 11.5C189 9.5 204.5 12.5 217.5 12.5" stroke="var(--color-yellow)" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="hero-subtitle">SOFTWARE &amp; AI ENGINEER</p>
        </div>

        <div className="hero-center">
          <div className="portrait-container">
            <img src="/profile.jpg" alt="Pranav" className="portrait-image" />
          </div>
        </div>

        <div className="hero-right">
          <div className="stat-item">
            <span className="stat-label">Years of experience</span>
            <span className="stat-value">3+</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Projects done</span>
            <span className="stat-value">20+</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Students Mentored</span>
            <span className="stat-value">700+</span>
          </div>
        </div>

      </div>
      
      {/* Background decoration lines imitating Beverr aesthetic */}
      <div className="hero-bg-lines"></div>
    </section>
  );
};

export default Hero;
