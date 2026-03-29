import React, { useState } from 'react';
import { Mail, Linkedin, FileDown } from 'lucide-react';
import './ContactPage.css';

const ContactPage = () => {
  const [result, setResult] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    // Replace with your Web3Forms Access Key
    formData.append("access_key", "322c7d8e-d4f9-45f1-ac1c-271199c65006");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("Message sent successfully!");
      event.target.reset();
      setTimeout(() => setResult(''), 5000); // clear after 5 secs
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
  };

  return (
    <div className="inner-page-wrapper">
      <section className="inner-hero contact-hero">
        <div className="container inner-hero-grid">
          <div className="inner-hero-content">
            <h1 className="inner-hero-title">CONTACT ME</h1>
            <svg width="220" height="20" viewBox="0 0 220 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="inner-hero-squiggle">
              <path d="M2.5 13.5C22.5 3.5 37.5 16 57 16C76.5 16 90.5 5.5 110.5 7C130.5 8.5 145 13.5 167 11.5C189 9.5 204.5 12.5 217.5 12.5" stroke="var(--color-yellow)" strokeWidth="5" strokeLinecap="round" />
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
                <p className="info-text">Ann Arbor, MI<br />United States</p>
              </div>
            </div>
            <div className="info-block" style={{ marginTop: '3rem' }}>
              <div className="info-icon">📲</div>
              <div>
                <h4 className="info-title">Contact & Socials</h4>
                <div className="contact-social-icons">
                  <a href="mailto:mpranavm@umich.edu" aria-label="Mail" target="_blank" rel="noreferrer"><Mail size={24} /></a>
                  <a href="https://www.linkedin.com/in/pranav-mahalingam/" aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin size={24} /></a>
                  <a href="/Pranav_Software_Engineer_Resume.pdf" aria-label="Resume" target="_blank" rel="noreferrer" download="Pranav_Software_Engineer_Resume.pdf"><FileDown size={24} /></a>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact-form-side">
            <h2 className="form-heading">LET'S TALK</h2>
            <p className="form-desc">Fill out the form below and I will get back to you as soon as possible.</p>

            <form className="contact-form" onSubmit={onSubmit}>
              <div className="form-group">
                <label>Your Name *</label>
                <input type="text" name="name" placeholder="John Doe" required />
              </div>
              <div className="form-group">
                <label>Your Email *</label>
                <input type="email" name="email" placeholder="john@email.com" required />
              </div>
              <div className="form-group">
                <label>The purpose for contacting me *</label>
                <textarea name="message" placeholder="I would like to discuss..." rows="6" required></textarea>
              </div>

              <button type="submit" className="btn btn-primary submit-btn">Submit</button>

              {result && (
                <div className={`form-result ${result.includes('success') ? 'success' : 'pending'}`}>
                  {result}
                </div>
              )}
            </form>
          </div>

        </div>
      </section>
    </div>
  );
};

export default ContactPage;
