import { motion } from 'framer-motion';
import { profile } from '../data/profileData';

/* Masthead shared by every router sub-page: numbered eyebrow, big title,
   optional standfirst and the portrait in a bracketed frame. */
const InnerHero = ({ num, eyebrow, title, desc, image = profile.portrait }) => (
  <section className="inner-hero">
    <motion.div
      className="inner-hero-grid"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div>
        <div className="inner-hero-eyebrow">
          {num && <span>{num}</span>}
          {eyebrow}
        </div>
        <h1 className="inner-hero-title">{title}</h1>
        {desc && <p className="inner-hero-desc">{desc}</p>}
      </div>
      <div className="inner-hero-image-wrap">
        <img src={image} alt={profile.name} className="inner-hero-image" />
      </div>
    </motion.div>
  </section>
);

export default InnerHero;
