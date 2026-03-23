import React from 'react';
import './Skills.css';

const skillsData = [
  { id: 1, letter: 'Py', name: 'Python', bgColor: '#3776AB', color: '#FFD43B' },
  { id: 2, letter: 'C++', name: 'C++', bgColor: '#00599C', color: '#FFFFFF' },
  { id: 3, letter: 'Aw', name: 'AWS & Cloud', bgColor: '#232F3E', color: '#FF9900' },
  { id: 4, letter: 'DL', name: 'Deep Learning', bgColor: '#FF6F00', color: '#FFFFFF' },
  { id: 5, letter: 'CV', name: 'Computer Vision', bgColor: '#15AABF', color: '#FFFFFF' },
  { id: 6, letter: 'Dk', name: 'Docker', bgColor: '#0db7ed', color: '#FFFFFF' },
];

const Skills = () => {
  return (
    <section className="skills-section section">
      <div className="container">
        <div className="skills-header">
          <h2 className="section-title">Technical Skills</h2>
          <p className="section-subtitle">A curated set of tools and technologies I specialize in.</p>
        </div>
        
        <div className="skills-grid">
          {skillsData.map((skill) => (
            <div className="skill-card" key={skill.id}>
              <div 
                className="skill-icon" 
                style={{ backgroundColor: skill.bgColor, color: skill.color }}
              >
                {skill.letter}
              </div>
              <h3 className="skill-name">{skill.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
