import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage = () => {
  const [activeBudget, setActiveBudget] = useState('2-5k');

  return (
    <div className="inner-page-wrapper">
      <section className="inner-hero contact-hero">
        <div className="container inner-hero-grid">
          <div className="inner-hero-content">
            <h1 className="inner-hero-title">CONTACT ME</h1>
            <svg width="220" height="20" viewBox="0 0 220 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inner-hero-squiggle">
              <path d="M2.5 13.5C22.5 3.5 37.5 16 57 16C76.5 16 90.5 5.5 110.5 7C130.5 8.5 145 13.5 167 11.5C189 9.5 204.5 12.5 217.5 12.5" stroke="var(--color-yellow)" strokeWidth="5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="inner-hero-image-wrap">
            <img src="/profile.jpg" alt="Pranav Mahalingam" className="inner-hero-image" />
          </div>
        </div>
      </section>

      <section className="contact-info-form section">
        <div className="container contact-split">
          
          {/* Info Side */}
          <div className="contact-info-side">
            <div className="info-block">
              <div className="info-icon">📍</div>
              <div>
                <h4 className="info-title">Location</h4>
                <p className="info-text">Ann Arbor, MI<br/>United States</p>
              </div>
            </div>
            <div className="info-block" style={{marginTop: '3rem'}}>
              <div className="info-icon">📞</div>
              <div>
                <h4 className="info-title">Phone & Email</h4>
                <p className="info-text">+1 (734) 678-6093<br/>mpranavm@umich.edu</p>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact-form-side">
            <h2 className="form-heading">LET'S TALK ABOUT YOUR PROJECT</h2>
            <p className="form-desc">Fill out the form below and I will get back to you as soon as possible.</p>
            
            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
              <div className="form-group">
                <label>Your Name *</label>
                <input type="text" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Your Email *</label>
                <input type="email" placeholder="john@email.com" required />
              </div>
              <div className="form-group">
                <label>Tell me about your project</label>
                <textarea placeholder="I want a super-duper application..." rows="4"></textarea>
              </div>
              
              <div className="budget-group">
                <label>Project budget (USD)</label>
                <div className="budget-pills">
                  {['1-2k', '2-5k', '5-10k', '< 10k'].map((budget) => (
                    <span 
                      key={budget}
                      className={`budget-pill ${activeBudget === budget ? 'active' : ''}`}
                      onClick={() => setActiveBudget(budget)}
                    >
                      {budget}
                    </span>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary submit-btn">Submit</button>
            </form>
          </div>

        </div>
      </section>
    </div>
  );
};

export default ContactPage;
