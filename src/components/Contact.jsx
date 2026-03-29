import React from 'react';
import { motion } from 'framer-motion';
import './Contact.css';

const Contact = () => {
  return (
    <footer className="contact-section">
      <motion.div 
        className="contact-circle"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="contact-title">Let's Talk</h2>
        <a href="mailto:mpranavmahalingam@gmail.com" className="btn btn-primary contact-btn">
          mpranavmahalingam@gmail.com
        </a>
      </motion.div>
    </footer>
  );
};

export default Contact;
