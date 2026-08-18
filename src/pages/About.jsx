import { motion } from 'framer-motion';
import InnerHero from '../components/InnerHero';
import { profile } from '../data/profileData';
import { education } from '../data/careerData';

const fade = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.6, ease: 'easeOut' }
};

const About = () => (
  <div className="inner-page-wrapper">
    <InnerHero num="02" eyebrow="DOSSIER" title="About me" desc={profile.lede} />

    <section className="panel panel--flush">
      <motion.div className="dossier" {...fade}>
        <div>
          <p className="dossier__lede">{profile.role} &middot; {profile.location}</p>
          {profile.bio.map((para) => (
            <p className="dossier__body" key={para.slice(0, 32)}>{para}</p>
          ))}
          <div className="dossier__actions">
            <a href={profile.resume} target="_blank" rel="noreferrer" className="btn btn-primary">View resume</a>
            <a href={profile.resume} download className="btn btn-secondary">Download resume</a>
          </div>
        </div>
        <dl className="spec">
          <div className="spec__title">SPECIFICATION</div>
          {profile.spec.map((row) => (
            <div className="spec__row" key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </motion.div>
    </section>

    <section className="panel panel--banded">
      <div className="panel__inner">
        <div className="section-head">
          <span className="section-head__num">02.1</span>
          <h2>Expertise</h2>
          <span className="section-head__rule" />
        </div>
        <motion.div className="grid-3" {...fade}>
          {profile.expertise.map((s) => (
            <article className="frame" key={s.title}>
              <div className="frame__corner frame__corner--tl" />
              <div className="frame__corner frame__corner--br" />
              <h3 className="card__title">{s.title}</h3>
              <p className="card__text">{s.desc}</p>
            </article>
          ))}
        </motion.div>
      </div>
    </section>

    <section className="panel panel--flush">
      <div className="section-head">
        <span className="section-head__num">02.2</span>
        <h2>Training</h2>
        <span className="section-head__rule" />
      </div>
      <motion.div className="stack-list" {...fade}>
        {education.map((item) => (
          <article className="entry" key={item.id}>
            <div className="entry__when">{item.when}</div>
            <div>
              <div className="entry__title">{item.title}</div>
              <div className="entry__org">{item.org.toUpperCase()}</div>
            </div>
            <div className={`tag${item.status === 'ACTIVE' ? ' tag--active' : ''}`}>{item.status}</div>
          </article>
        ))}
      </motion.div>
    </section>
  </div>
);

export default About;
