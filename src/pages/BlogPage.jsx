import React from 'react';
import { motion } from 'framer-motion';
import { linkedinPosts } from '../data/linkedinPosts';
import { ExternalLink, ArrowRight } from 'lucide-react';
import './BlogPage.css';

const BlogPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15, delayChildren: 0.3 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: "easeOut" } 
    }
  };

  return (
    <div className="inner-page-wrapper">
      {/* Hero Section */}
      <section className="inner-hero">
        <motion.div 
          className="container inner-hero-grid"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="inner-hero-content">
            <h1 className="inner-hero-title stroke-text">BLOG</h1>
            <svg width="220" height="20" viewBox="0 0 220 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inner-hero-squiggle">
              <path d="M2.5 13.5C22.5 3.5 37.5 16 57 16C76.5 16 90.5 5.5 110.5 7C130.5 8.5 145 13.5 167 11.5C189 9.5 204.5 12.5 217.5 12.5" stroke="var(--color-yellow)" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="inner-hero-image-wrap">
            <img src="/profile.jpg" alt="Pranav" className="inner-hero-image" />
          </div>
        </motion.div>
      </section>

      {/* Blog Cards Section */}
      <section className="section blog-section">
        <div className="container">
          <div className="blog-header animate-on-scroll">
            <h2 className="section-title">Latest Updates</h2>
            <p className="section-subtitle">Insights from my LinkedIn and professional journey.</p>
          </div>
          
          <motion.div 
            className="blog-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {linkedinPosts.map((post) => (
              <motion.article 
                className="blog-card" 
                key={post.id}
                variants={itemVariants}
              >
                <div className="blog-card-image-wrap">
                  <img src={post.image} alt={post.title} className="blog-card-image" />
                  {post.category && <span className="blog-card-category">{post.category}</span>}
                </div>
                
                <div className="blog-card-content">
                  <div className="blog-card-date">{post.date}</div>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-snippet">{post.snippet}</p>
                  
                  <div className="blog-card-footer">
                    <a 
                      href={post.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="blog-card-link"
                    >
                      Read full post <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {/* Social Cta */}
          <motion.div 
            className="text-center mt-5"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            style={{ marginTop: '4rem' }}
          >
            <a 
              href="https://www.linkedin.com/in/pranavmahalingam/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn btn-secondary"
            >
              Follow on LinkedIn <ArrowRight size={18} style={{ marginLeft: '10px' }} />
            </a>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
