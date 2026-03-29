import React from 'react';
import { motion } from 'framer-motion';
import './Experience.css';

const educationData = [
  {
    id: 1,
    year: '2025 - Present',
    title: 'Master of Science in Computer Science and Engineering',
    company: 'University of Michigan, Ann Arbor, MI',
    description: ''
  },
  {
    id: 2,
    year: '2018 - 2022',
    title: 'Bachelor of Technology in Computer Science',
    company: 'SRM Institute of Science and Technology, Chennai, India',
    description: ''
  }
];

const Education = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="experience-section section" style={{ backgroundColor: 'var(--color-bg-light)' }}>
      <div className="container">
        <h2 className="section-title text-center">Education</h2>
        
        <motion.div 
          className="timeline"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {educationData.map((item, index) => (
            <motion.div className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} key={item.id} variants={itemVariants}>
              <div className="timeline-content">
                <div className="timeline-year">{item.year}</div>
                <h3 className="timeline-title">{item.title}</h3>
                <h4 className="timeline-company">{item.company}</h4>
                {item.description && <p className="timeline-desc">{item.description}</p>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Education;
