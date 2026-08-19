import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import InnerHero from '../components/InnerHero';
import { projectsByRepoFirst, projectsData } from '../data/projectsData';
import { sectionCopy } from '../data/profileData';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } }
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const ProjectsPage = () => (
  <div className="inner-page-wrapper">
    <InnerHero
      num="03"
      eyebrow="LOADOUT · PROJECTS"
      title="Projects"
      desc={sectionCopy.loadout.desc}
    />

    <section className="panel panel--flush">
      <div className="section-head">
        <span className="section-head__num">03</span>
        <h2>All slots</h2>
        <span className="section-head__gloss">Every project</span>
        <span className="section-head__rule" />
        <span className="section-head__aside">{String(projectsData.length).padStart(2, '0')} TOTAL</span>
      </div>

      <motion.div
        className="grid-2"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {projectsByRepoFirst.map((p, i) => (
          <motion.article className="frame project-card" key={p.id} variants={item}>
            <div className="frame__corner frame__corner--tl" />
            <div className="frame__corner frame__corner--br" />
            <div className="frame__head">
              <span>SLOT {String(i + 1).padStart(2, '0')}</span>
              <span className="frame__class">{p.category.toUpperCase()}</span>
            </div>
            {p.image ? (
              <div
                className="project-card__media"
                style={{ backgroundImage: `url(${p.image})`, backgroundSize: p.imageFit || 'contain' }}
                role="img"
                aria-label={p.title}
              />
            ) : (
              <div className="project-card__media slot__media--empty" aria-hidden="true">
                <span>NO VISUAL FEED</span>
              </div>
            )}
            <h3 className="card__title">{p.title}</h3>
            <div className="card__meta">{p.event} &middot; {p.date}</div>
            <p className="card__text">{p.description}</p>
            <div className="chips" style={{ marginTop: 22 }}>
              {p.technologies.map((t) => <span className="chip" key={t}>{t.toUpperCase()}</span>)}
            </div>
            <div className="project-card__foot">
              <Link to={`/projects/${p.id}`}>CASE STUDY &#8594;</Link>
              {p.repo && (
                <a href={p.repo} target="_blank" rel="noreferrer" className="link-muted">SOURCE &#8599;</a>
              )}
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>

    <section className="panel panel--banded">
      <div className="panel__inner text-center">
        <p className="comms__pitch" style={{ marginBottom: 28 }}>Have a build in mind?</p>
        <Link to="/contact" className="btn btn-primary">Open a channel</Link>
      </div>
    </section>
  </div>
);

export default ProjectsPage;
