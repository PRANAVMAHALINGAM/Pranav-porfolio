import { motion } from 'framer-motion';
import InnerHero from '../components/InnerHero';
import { awards } from '../data/careerData';

const AwardsPage = () => (
  <div className="inner-page-wrapper">
    <InnerHero
      num="04"
      eyebrow="COMMENDATIONS"
      title="Awards &amp; recognitions"
      desc="Competition wins and recognitions picked up along the way."
    />

    <section className="panel panel--flush">
      <div className="section-head">
        <span className="section-head__num">04</span>
        <h2>Citations</h2>
        <span className="section-head__rule" />
        <span className="section-head__aside">{String(awards.length).padStart(2, '0')} TOTAL</span>
      </div>
      <motion.div
        className="grid-2"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {awards.map((a) => (
          <article className="frame" key={a.id}>
            <div className="frame__corner frame__corner--tl" />
            <div className="frame__corner frame__corner--br" />
            <div className="frame__head">
              <span>CITATION</span>
              <span className="frame__class">AWARDED</span>
            </div>
            <div className="card__meta">{a.prize.toUpperCase()}</div>
            <h3 className="card__title">{a.title}</h3>
            <div className="entry__org" style={{ marginTop: 0, marginBottom: 14 }}>{a.issuer.toUpperCase()}</div>
            <p className="card__text">{a.desc}</p>
          </article>
        ))}
      </motion.div>
    </section>
  </div>
);

export default AwardsPage;
