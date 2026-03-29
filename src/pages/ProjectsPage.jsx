import React from 'react';
import { Link } from 'react-router-dom';
import './ProjectsPage.css';
import { projectsData } from '../data/projectsData';

const ProjectsPage = () => {
  return (
    <div className="inner-page-wrapper">
      <section className="inner-hero">
        <div className="container inner-hero-grid">
          <div className="inner-hero-content">
            <h1 className="inner-hero-title">CASE STUDIES</h1>
            <svg width="220" height="20" viewBox="0 0 220 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inner-hero-squiggle">
              <path d="M2.5 13.5C22.5 3.5 37.5 16 57 16C76.5 16 90.5 5.5 110.5 7C130.5 8.5 145 13.5 167 11.5C189 9.5 204.5 12.5 217.5 12.5" stroke="var(--color-yellow)" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="inner-hero-image-wrap">
            <img src="/profile.jpg" alt="Pranav Mahalingam" className="inner-hero-image" />
          </div>
        </div>
      </section>

      <section className="projects-intro section text-center">
        <div className="container">
          <h2 className="projects-intro-title">Creative. Professional. Ethical.</h2>
          <p className="projects-intro-desc">Explore a curated selection of my most impactful engineering and design projects.</p>
        </div>
      </section>

      <section className="projects-gallery section pt-0">
        <div className="container">
          <div className="gallery-layout-2col">
            {projectsData.map((proj) => (
              <Link to={`/projects/${proj.id}`} key={proj.id} className="gallery-card-lg" style={{ textDecoration: 'none' }}>
                <div 
                  className="gallery-img-area"
                  style={proj.image ? { backgroundImage: `url(${proj.image})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: 'transparent' } : {}}
                >
                  <div className="gallery-labels">
                    <span className="g-label-top">{proj.title}</span>
                    <span className="g-label-bottom">{proj.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="load-more-wrap text-center">
            <button className="btn btn-secondary btn-load-more">Load More</button>
          </div>
        </div>
      </section>

      <section className="projects-cta">
        <div className="container text-center projects-cta-container">
          <div className="cta-content-box">
             <h2 className="cta-heading">Have a great idea? Let's talk about your project</h2>
             <Link to="/contact" className="btn btn-primary cta-action-btn">CONTACT ME</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectsPage;
