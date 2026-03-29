import React from 'react';
import { motion } from 'framer-motion';

const BlogPage = () => {
  return (
    <motion.div 
      className="inner-page-wrapper"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <section className="inner-hero">
        <div className="container inner-hero-grid">
          <div className="inner-hero-content">
            <h1 className="inner-hero-title">BLOG</h1>
            <svg width="220" height="20" viewBox="0 0 220 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inner-hero-squiggle">
              <path d="M2.5 13.5C22.5 3.5 37.5 16 57 16C76.5 16 90.5 5.5 110.5 7C130.5 8.5 145 13.5 167 11.5C189 9.5 204.5 12.5 217.5 12.5" stroke="var(--color-yellow)" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="inner-hero-image-wrap">
            <img src="/profile.jpg" alt="Pranav" className="inner-hero-image" />
          </div>
        </div>
      </section>

      <section className="section bg-white" style={{ padding: '7rem 0', minHeight: '40vh' }}>
        <div className="container text-center">
          <h2 className="services-title" style={{ marginBottom: '1rem' }}>Coming Soon</h2>
          <p className="projects-intro-desc" style={{ marginBottom: '4rem', fontSize: '1.15rem', color: '#6B7280', maxWidth: '700px', margin: '0 auto 4rem' }}>
            Blog content will be added here soon. Stay tuned!
          </p>
        </div>
      </section>
    </motion.div>
  );
};

export default BlogPage;
