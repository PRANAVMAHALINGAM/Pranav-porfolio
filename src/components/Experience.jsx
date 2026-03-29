import React from 'react';
import { motion } from 'framer-motion';
import './Experience.css';

const experienceData = [
  {
    id: 1,
    year: '2026 - Present',
    title: 'Computer Consultant 1',
    company: 'University of Michigan',
    description: 'Supported and maintained distributed infrastructure systems across 75+ campus buildings. Managed inventory lifecycle for 10,000+ devices to ensure optimal availability.'
  },
  {
    id: 2,
    year: '2024 - 2025',
    title: 'AI Engineer',
    company: 'Dhvani Analytic Intelligence',
    description: 'Served as Product Owner for PixIQ AI system. Designed scalable AI architectures on AWS for industrial floor deployment, increasing operational throughput by 25%.'
  },
  {
    id: 3,
    year: '2023 - 2024',
    title: 'Junior AI Engineer',
    company: 'Dhvani Analytic Intelligence',
    description: 'Delivered production-grade computer vision solutions for enterprise clients like GE Healthcare, significantly improving defect detection precision by 12%.'
  },
  {
    id: 4,
    year: '2019 - 2025',
    title: 'AI & IoT Trainer',
    company: 'Vaayusastra Aerospace / Freelance',
    description: 'Mentored over 700 students through hands-on AI/IoT workshops and intensive 12-day internship programs covering hardware and software architectures.'
  }
];

const Experience = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="experience-section section">
      <div className="container">
        <h2 className="section-title text-center">Experience &amp; Education</h2>
        
        <motion.div 
          className="timeline"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {experienceData.map((item, index) => (
            <motion.div className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} key={item.id} variants={itemVariants}>
              <div className="timeline-content">
                <div className="timeline-year">{item.year}</div>
                <h3 className="timeline-title">{item.title}</h3>
                <h4 className="timeline-company">{item.company}</h4>
                <p className="timeline-desc">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
