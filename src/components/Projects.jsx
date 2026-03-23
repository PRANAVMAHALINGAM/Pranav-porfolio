import React from 'react';
import './Projects.css';

const projects = [
  { id: 1, title: 'BudgetBruh (TartanHacks)', category: 'LLM / Finance App' },
  { id: 2, title: 'Git-Landscaper (UMich)', category: 'Open Source / Git' },
  { id: 3, title: 'Git-Hired (Claude Builders)', category: 'Agentic AI Interviewer' },
  { id: 4, title: 'MCQ Generation System', category: 'NLP / Research' },
  { id: 5, title: 'AI Bin: Smart Garbage', category: 'CV / IoT' },
  { id: 6, title: 'RAKSHA - Bike Safety', category: 'IoT / Hardware' },
];

const Projects = () => {
  return (
    <section className="projects-section section">
      <div className="container">
        <div className="projects-header">
          <h2 className="section-title text-center">Featured Projects</h2>
        </div>
        
        <div className="projects-grid">
          {projects.map((project) => (
            <div className="project-card" key={project.id}>
              <div className="project-image-placeholder">
                <span className="project-category">{project.category}</span>
              </div>
              <h3 className="project-title">{project.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
