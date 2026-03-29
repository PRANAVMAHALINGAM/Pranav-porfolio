import React from 'react';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
  return (
    <div className="inner-page-wrapper">
      {/* Hero Section */}
      <section className="inner-hero about-hero">
        <motion.div 
          className="container inner-hero-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inner-hero-content">
            <h1 className="inner-hero-title stroke-text">ABOUT ME</h1>
            <svg width="220" height="20" viewBox="0 0 220 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inner-hero-squiggle">
              <path d="M2.5 13.5C22.5 3.5 37.5 16 57 16C76.5 16 90.5 5.5 110.5 7C130.5 8.5 145 13.5 167 11.5C189 9.5 204.5 12.5 217.5 12.5" stroke="var(--color-yellow)" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="inner-hero-image-wrap">
            <img src="/profile.jpg" alt="Pranav Mahalingam" className="inner-hero-image" />
          </div>
        </motion.div>
      </section>

      {/* Intro Bio Section */}
      <section className="about-bio section">
        <motion.div 
          className="container bio-split"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="bio-left">
            <div className="bio-label">SOFTWARE &amp; AI ENGINEER</div>
            <h2 className="bio-name">PRANAV<br/>MAHALINGAM</h2>
          </div>
          <div className="bio-right">
            <p className="bio-text">
              I am a Software Engineer and AI Engineer with over 3 years of experience building AI/ML, computer vision, and IoT-driven systems. Driven by innovation and problem solving, I have architected scalable AI platforms and deployed production-grade solutions on AWS. I am currently pursuing a Master of Science in Computer Science and Engineering at the University of Michigan.
            </p>
            <p className="bio-text mt-4">
              My previous role at Dhvani Analytic Intelligence involved acting as a Product Owner for the PixIQ AI system, reducing project turnaround time by 15% and increasing operational throughput by 25%.
            </p>
            <a href="/Pranav_Software_Engineer_Resume.pdf" target="_blank" rel="noreferrer" className="btn btn-primary mt-4">
               View Resume
            </a>
          </div>
        </motion.div>
      </section>

      {/* Info Grid */}
      <section className="about-info-grid section pt-0">
        <div className="container">
          <motion.div 
            className="info-grid-3col"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="info-item">
              <span className="info-label">Degree</span>
              <span className="info-value">MS CS &amp; Eng</span>
            </div>
            <div className="info-item">
              <span className="info-label">Location</span>
              <span className="info-value">Ann Arbor, MI</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value text-lowercase">mpranavm@umich.edu</span>
            </div>
            <div className="info-item">
              <span className="info-label">Experience</span>
              <span className="info-value">3+ Years</span>
            </div>
            <div className="info-item">
              <span className="info-label">Roles</span>
              <span className="info-value">AI Engineer, Consultant</span>
            </div>
            <div className="info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">+1 (734) 678-6093</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="about-services section bg-light-section">
        <div className="container text-center">
          <motion.h2 
            className="services-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >MY EXPERTISE</motion.h2>
          <motion.div 
            className="services-grid-3col"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
          >
            <motion.div className="service-card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}>
              <div className="service-icon">🧠</div>
              <h3>AI &amp; Deep Learning</h3>
              <p>Designing scalable AI system architectures for industrial deployment using Python and AWS.</p>
            </motion.div>
            <motion.div className="service-card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}>
              <div className="service-icon">👁️</div>
              <h3>Computer Vision</h3>
              <p>Delivering production-grade computer vision solutions to improve defect detection.</p>
            </motion.div>
            <motion.div className="service-card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}>
              <div className="service-icon">🌐</div>
              <h3>Software Engineering</h3>
              <p>Building high-performance applications, GitHub tools, and full-stack platforms.</p>
            </motion.div>
            <motion.div className="service-card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}>
              <div className="service-icon">🔌</div>
              <h3>IoT &amp; Edge Analytics</h3>
              <p>Prototyping advanced IoT embedded systems with ESP32 and Raspberry Pi.</p>
            </motion.div>
            <motion.div className="service-card" variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } }}>
              <div className="service-icon">🎓</div>
              <h3>Mentorship</h3>
              <p>Training and mentoring over 700+ students through intensive technical bootcamps.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default About;
