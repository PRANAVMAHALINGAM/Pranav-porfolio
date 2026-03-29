import React from 'react';
import { motion } from 'framer-motion';
import '../pages/About.css'; // Leverage existing 3-col grid logic

const awards = [
  { id: 1, title: 'Winner - Best Innovation', issuer: 'PALS Innowah - IIT Madras', prize: 'Rs. 10,000 Cash Prize', desc: 'Awarded for the project "Know Your Baby kit" from PALS Innowah 2022 competition.' },
  { id: 2, title: 'Project Day Winner 2022', issuer: 'SRM Institute of Science and Technology', prize: 'Rs. 25,000 Cash Prize', desc: 'Awarded for the Project "Raksha - Bike and Biker safety device".' },
  { id: 3, title: 'Project Day Winner 2020', issuer: 'SRM Institute of Science and Technology', prize: 'Rs. 10,000 Cash Prize', desc: 'Awarded for the project "ConnecLoRa".' },
  { id: 4, title: 'Best Intern - IoT & ML', issuer: 'Experts Hub', prize: 'Top 1 of 150 Interns', desc: 'Recognized as the best intern among the group for exceptional architectural contribution.' }
];

const AwardsPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

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
            <h1 className="inner-hero-title">Awards and Recognitions</h1>
            <svg width="220" height="20" viewBox="0 0 220 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inner-hero-squiggle">
              <path d="M2.5 13.5C22.5 3.5 37.5 16 57 16C76.5 16 90.5 5.5 110.5 7C130.5 8.5 145 13.5 167 11.5C189 9.5 204.5 12.5 217.5 12.5" stroke="var(--color-yellow)" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="inner-hero-image-wrap">
            <img src="/profile.jpg" alt="Pranav" className="inner-hero-image" />
          </div>
        </div>
      </section>

      <section className="section bg-white" style={{ padding: '7rem 0' }}>
        <div className="container text-center">
          <h2 className="services-title" style={{ marginBottom: '1rem' }}>Honorable Mentions</h2>
          <p className="projects-intro-desc" style={{ marginBottom: '4rem', fontSize: '1.15rem', color: '#6B7280', maxWidth: '700px', margin: '0 auto 4rem' }}>
            It’s an honor to be acknowledged for my hard work across various technical competitions and internships.
          </p>
          
          <motion.div 
            className="services-grid-3col"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {awards.map(award => (
              <motion.div className="service-card" key={award.id} variants={itemVariants} style={{ border: '1px solid #f3f4f6', backgroundColor: '#F9FAFB' }}>
                <div className="service-icon" style={{ color: 'var(--color-primary)', marginBottom: '1rem', fontSize: '2.5rem' }}>🏆</div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.75rem', lineHeight: '1.3' }}>{award.title}</h3>
                <div style={{ fontWeight: 800, color: '#FFB800', marginBottom: '1rem', fontSize: '1.1rem' }}>{award.prize}</div>
                <p style={{ fontSize: '1rem', lineHeight: '1.6' }}><strong>{award.issuer}</strong><br/><br/>{award.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default AwardsPage;
