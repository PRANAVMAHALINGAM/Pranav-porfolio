import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import InnerHero from '../components/InnerHero';
import { projectsData } from '../data/projectsData';

const ProjectDetail = () => {
  const { id } = useParams();
  const project = projectsData.find((p) => p.id === id);
  const index = projectsData.findIndex((p) => p.id === id);

  if (!project) {
    return (
      <div className="inner-page-wrapper">
        <div className="empty-state">
          <div className="section-head" style={{ justifyContent: 'center', marginBottom: 24 }}>
            <span className="section-head__num">404</span>
            <h2>Slot not found</h2>
          </div>
          <p className="card__text" style={{ marginBottom: 32 }}>No project is filed under that ID.</p>
          <Link to="/projects" className="btn btn-primary">Back to loadout</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="inner-page-wrapper">
      <InnerHero
        num={`SLOT ${String(index + 1).padStart(2, '0')}`}
        eyebrow={project.category.toUpperCase()}
        title={project.title}
        desc={project.event}
        image={project.image}
      />

      <section className="panel panel--flush">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="brief__figure">
            <img src={project.image} alt={project.title} style={{ objectFit: project.imageFit || 'contain' }} />
          </div>

          <div className="brief">
            <div>
              <div className="section-head">
                <span className="section-head__num">01</span>
                <h2>Overview</h2>
                <span className="section-head__rule" />
              </div>
              <p className="brief__body">{project.description}</p>
            </div>

            <dl className="spec">
              <div className="spec__title">BRIEF</div>
              <div className="spec__row"><dt>SLOT</dt><dd>{String(index + 1).padStart(2, '0')}</dd></div>
              <div className="spec__row"><dt>CLASS</dt><dd>{project.category}</dd></div>
              <div className="spec__row"><dt>DATE</dt><dd>{project.date}</dd></div>
              <div className="spec__row"><dt>CONTEXT</dt><dd>{project.event}</dd></div>
              <div className="spec__row" style={{ display: 'block' }}>
                <dt style={{ marginBottom: 12 }}>STACK</dt>
                <dd style={{ textAlign: 'left' }}>
                  <div className="chips">
                    {project.technologies.map((t) => <span className="chip" key={t}>{t.toUpperCase()}</span>)}
                  </div>
                </dd>
              </div>
            </dl>
          </div>

          <div style={{ marginTop: 72, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link to="/projects" className="btn btn-secondary">&#8592; All slots</Link>
            <Link to="/contact" className="btn btn-primary">Ask about this build</Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ProjectDetail;
