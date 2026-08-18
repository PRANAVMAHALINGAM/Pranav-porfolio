import { useState } from 'react';
import { motion } from 'framer-motion';
import InnerHero from '../components/InnerHero';
import { profile, socials } from '../data/profileData';

const ACCESS_KEY = '322c7d8e-d4f9-45f1-ac1c-271199c65006';

const ContactPage = () => {
  const [result, setResult] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult('Sending....');

    const formData = new FormData(event.target);
    formData.append('access_key', ACCESS_KEY);

    try {
      const response = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        setResult('Message sent successfully!');
        event.target.reset();
        setTimeout(() => setResult(''), 5000);
      } else {
        setResult(data.message || 'Something went wrong. Try email instead.');
      }
    } catch {
      setResult('Network error. Try email instead.');
    }
  };

  return (
    <div className="inner-page-wrapper">
      <InnerHero
        num="07"
        eyebrow="COMMS"
        title="Contact me"
        desc="Open a channel — hiring, collaboration, or just to compare notes on shipping AI."
      />

      <section className="panel panel--flush">
        <motion.div
          className="comms-split"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div>
            <div className="section-head">
              <span className="section-head__num">07.1</span>
              <h2>Channels</h2>
              <span className="section-head__rule" />
            </div>

            <div className="channel">
              <span className="channel__label">LOCATION</span>
              <span className="channel__value">{profile.location}, United States</span>
            </div>
            <div className="channel">
              <span className="channel__label">PRIMARY</span>
              <a className="channel__value" href={`mailto:${profile.email}`}>{profile.email}</a>
            </div>
            <div className="channel">
              <span className="channel__label">ACADEMIC</span>
              <a className="channel__value" href={`mailto:${profile.emailAlt}`}>{profile.emailAlt}</a>
            </div>
            <div className="channel">
              <span className="channel__label">STATUS</span>
              <span className="channel__value" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="pip" aria-hidden="true" /> {profile.status}
              </span>
            </div>

            <div className="links" style={{ marginTop: 34 }}>
              {socials.map((s) => (
                <a
                  className="links__item"
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  {...(s.download ? { download: true } : {})}
                >
                  {s.label} <span aria-hidden="true">{s.glyph}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <div className="section-head">
              <span className="section-head__num">07.2</span>
              <h2>Send a message</h2>
              <span className="section-head__rule" />
            </div>

            <form onSubmit={onSubmit}>
              <div className="field">
                <label htmlFor="name">Your name *</label>
                <input id="name" type="text" name="name" placeholder="John Doe" required />
              </div>
              <div className="field">
                <label htmlFor="email">Your email *</label>
                <input id="email" type="email" name="email" placeholder="john@email.com" required />
              </div>
              <div className="field">
                <label htmlFor="message">Purpose for contacting me *</label>
                <textarea id="message" name="message" rows="6" placeholder="I would like to discuss..." required />
              </div>

              <button type="submit" className="btn btn-primary">Transmit</button>

              {result && (
                <div className={`form-result ${result.includes('success') ? 'success' : 'pending'}`} role="status">
                  {result}
                </div>
              )}
            </form>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ContactPage;
