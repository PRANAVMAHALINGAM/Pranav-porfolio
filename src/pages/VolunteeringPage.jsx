import { motion } from 'framer-motion';
import InnerHero from '../components/InnerHero';
import { volunteering } from '../data/careerData';

const VolunteeringPage = () => (
  <div className="inner-page-wrapper">
    <InnerHero
      num="06"
      eyebrow="FIELD SERVICE"
      title="Volunteering"
      desc="Volunteering is not only an important part of my life, it also plays a big role in my personal philosophy."
    />

    <section className="panel panel--flush">
      <div className="section-head">
        <span className="section-head__num">06</span>
        <h2>Service record</h2>
        <span className="section-head__rule" />
      </div>
      <motion.div
        className="stack-list"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {volunteering.map((item) => (
          <article className="entry" key={item.id}>
            <div className="entry__when">{item.when}</div>
            <div>
              <div className="entry__title">{item.title}</div>
              <div className="entry__org">{item.org.toUpperCase()}</div>
              <p className="entry__note">{item.desc}</p>
            </div>
            <div className="tag">SERVED</div>
          </article>
        ))}
      </motion.div>
    </section>
  </div>
);

export default VolunteeringPage;
