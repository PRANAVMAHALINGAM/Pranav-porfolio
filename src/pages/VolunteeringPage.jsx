import React from 'react';
import { motion } from 'framer-motion';
import '../components/Experience.css';

const volunteerData = [
  { id: 1, year: '2019 - 2022', title: 'President - Campus Life', company: 'SRM Institute of Science and Technology', description: 'Led the cultural and social department of 200 members to organize events fostering campus engagement, collaboration, and student development.' },
  { id: 2, year: '2009 - Present', title: 'Volunteer', company: 'The Art of Living', description: 'Engaged in social initiatives, including food distribution during Tamil Nadu floods and participating in environmental cleanup activities.' },
  { id: 3, year: '2020 - 2021', title: 'President - Game Com Club', company: 'SRM Institute', description: 'Led a technical club dedicated to game technology, overseeing workshops and training sessions on game design and engine fundamentals.' },
  { id: 4, year: '2020 - 2021', title: 'Member - GDSC', company: 'Google Developer Student Clubs', description: 'Contributed actively as a team member, organizing events, workshops, and peer-learning sessions that introduced students to Google technologies.' }
];

const VolunteeringPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="inner-page-wrapper">
      <section className="inner-hero">
        <div className="container inner-hero-grid">
          <div className="inner-hero-content">
            <h1 className="inner-hero-title stroke-text">VOLUNTEERING</h1>
            <svg width="220" height="20" viewBox="0 0 220 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inner-hero-squiggle">
              <path d="M2.5 13.5C22.5 3.5 37.5 16 57 16C76.5 16 90.5 5.5 110.5 7C130.5 8.5 145 13.5 167 11.5C189 9.5 204.5 12.5 217.5 12.5" stroke="var(--color-yellow)" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="inner-hero-image-wrap">
            <img src="/profile.jpg" alt="Pranav" className="inner-hero-image" />
          </div>
        </div>
      </section>

      <section className="section bg-light-section" style={{ padding: '6rem 0' }}>
        <div className="container">
          <div className="projects-intro text-center" style={{ marginBottom: '5rem' }}>
            <h2 className="projects-intro-title" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--color-primary)' }}>Giving Back to the Community</h2>
            <p className="projects-intro-desc" style={{ fontSize: '1.25rem', color: '#6B7280', maxWidth: '700px', margin: '1rem auto 0' }}>Volunteering is not only an important part of my life, but also plays a big role in my personal philosophy.</p>
          </div>
          
          <motion.div 
            className="timeline"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {volunteerData.map((item, index) => (
              <motion.div className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} key={item.id} variants={itemVariants}>
                <div className="timeline-content">
                  <div className="timeline-year" style={{ color: 'var(--color-primary)', fontWeight: 800, marginBottom: '0.5rem' }}>{item.year}</div>
                  <h3 className="timeline-title" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-dark)' }}>{item.title}</h3>
                  <h4 className="timeline-company" style={{ fontSize: '1.05rem', color: '#6B7280', marginBottom: '1rem' }}>{item.company}</h4>
                  <p className="timeline-desc" style={{ lineHeight: '1.6', color: 'var(--color-text-dark)', opacity: 0.8 }}>{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default VolunteeringPage;
