import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { projectsData } from '../data/projectsData';

const ProjectDetail = () => {
  const { id } = useParams();
  const project = projectsData.find(p => p.id === id);

  if (!project) {
    return (
      <div className="inner-page-wrapper" style={{ paddingTop: '200px', textAlign: 'center' }}>
        <h2 className="cta-heading">Project Not Found</h2>
        <Link to="/projects" className="btn btn-primary">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div className="inner-page-wrapper">
      <section className="inner-hero">
        <motion.div 
          className="container inner-hero-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inner-hero-content">
            <h1 className="inner-hero-title" style={{ fontSize: '3.5rem', lineHeight: '1.2' }}>{project.title.toUpperCase()}</h1>
            <svg width="220" height="20" viewBox="0 0 220 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inner-hero-squiggle">
              <path d="M2.5 13.5C22.5 3.5 37.5 16 57 16C76.5 16 90.5 5.5 110.5 7C130.5 8.5 145 13.5 167 11.5C189 9.5 204.5 12.5 217.5 12.5" stroke="var(--color-yellow)" strokeWidth="5" strokeLinecap="round"/>
            </svg>
            <p className="text-white mt-4" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{project.category}</p>
          </div>
          <div className="inner-hero-image-wrap">
            <img src={project.image || "/profile.jpg"} alt={project.title} className="inner-hero-image" style={{ objectFit: 'cover', objectPosition: 'center' }} />
          </div>
        </motion.div>
      </section>

      <section className="section bg-white text-dark">
        <div className="container">
          <div className="bio-split" style={{ paddingTop: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Overview</h3>
              <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#4B5563' }}>{project.description}</p>
            </div>
            <div>
              <div style={{ marginBottom: '2.5rem' }}>
                <h4 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--color-text-dark)' }}>Timeline / Achievement</h4>
                <p style={{ color: '#6B7280', fontSize: '1.1rem', lineHeight: '1.6' }}><strong>{project.event}</strong><br/>{project.date}</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-dark)' }}>Technologies Used</h4>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {project.technologies.map(tech => (
                    <span key={tech} className="budget-pill" style={{ padding: '8px 18px', fontSize: '0.95rem', cursor: 'default' }}>{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center" style={{ marginTop: '5rem' }}>
            <Link to="/projects" className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>← View All Projects</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetail;
