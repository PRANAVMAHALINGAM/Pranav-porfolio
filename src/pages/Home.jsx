import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import BootGate from '../components/hud/BootGate';
import HudLayer from '../components/hud/HudLayer';
import OperatorScene from '../components/hud/OperatorScene';
import useClock from '../hooks/useClock';
import useHeroFade from '../hooks/useHeroFade';
import { profile, sectionCopy, socials } from '../data/profileData';
import { openSourceProjects } from '../data/projectsData';
import { awards, education, experience, volunteering } from '../data/careerData';
import { skillGroups, stack } from '../data/skillsData';
import '../styles/hud.css';

const SECTIONS = [
  { id: 'profile', short: 'PROFILE' },
  { id: 'log', short: 'LOG' },
  { id: 'loadout', short: 'LOADOUT' },
  { id: 'stats', short: 'STATS' },
  { id: 'commendations', short: 'AWARDS' },
  { id: 'field', short: 'FIELD' },
  { id: 'comms', short: 'COMMS' }
];

/* Every section carries its callsign, a plain-English gloss of that callsign,
   and a one-line standfirst — the HUD naming should never be the only label. */
const SectionHead = ({ num, title, gloss, desc, aside, tight }) => (
  <>
    <div className={`section-head${desc ? ' section-head--lead' : ''}${tight && !desc ? ' section-head--tight' : ''}`}>
      <span className="section-head__num">{num}</span>
      <h2>{title}</h2>
      {gloss && <span className="section-head__gloss">{gloss}</span>}
      <span className="section-head__rule" />
      {aside && <span className="section-head__aside">{aside}</span>}
    </div>
    {desc && <p className="section-sub">{desc}</p>}
  </>
);

const LogEntry = ({ item, status }) => (
  <article className="entry">
    <div className="entry__when">{item.when}</div>
    <div>
      <div className="entry__title">{item.title}</div>
      <div className="entry__org">{item.org.toUpperCase()}</div>
      {item.desc && <p className="entry__note">{item.desc}</p>}
    </div>
    <div className={`tag${(status || item.status) === 'ACTIVE' ? ' tag--active' : ''}`}>
      {status || item.status}
    </div>
  </article>
);

const Home = () => {
  // Already deployed if we are returning to "/" from another route this session.
  const [deployed, setDeployed] = useState(() => !!window.__operatorDeployed);
  const clock = useClock();
  const heroRef = useHeroFade();

  const onDeploy = useCallback(() => setDeployed(true), []);

  const toTop = useCallback((e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div ref={heroRef}>
      <BootGate onDeploy={onDeploy} />

      <div className="hero-title" data-hero-fade="title">
        <h1>
          <span className="hero-title__first">Pranav</span>
          <span className="hero-title__last">Mahalingam</span>
        </h1>
      </div>

      <div className="scene-layer">
        <OperatorScene />
      </div>

      <HudLayer deployed={deployed} />

      {/* ------------------------------------------------------------- hero */}
      <section className="hero" data-screen-label="Hero">
        <div className="hero__veil" />
        <div className="corner corner--tl" />
        <div className="corner corner--tr" />
        <div className="corner corner--bl" />
        <div className="corner corner--br" />

        <nav className="hero-rail" data-hero-fade aria-label="Page sections">
          {SECTIONS.map((s) => (
            <a href={`#${s.id}`} key={s.id} className="hero-rail__item">
              <span className="hero-rail__tick" />
              {s.short}
            </a>
          ))}
        </nav>

        <div className="hero-eyebrow" data-hero-fade>
          <span className="hero-eyebrow__rule" />
          {profile.role}
          <span className="hero-eyebrow__rule" />
        </div>

        <a className="hero-brand" href="#top" data-hero-fade onClick={toTop}>
          <span className="monogram">PM</span>
          <span className="hero-brand__name">{profile.name}</span>
        </a>

        <div className="hero-status" data-hero-fade>
          <span className="pip" aria-hidden="true" />
          {profile.status}
          <span className="dim-slash">/</span>
          <span className="hero-status__clock">{clock}</span>
        </div>

        <div className="hero-copy" data-hero-fade>
          <p>{profile.heroCopy}</p>
          <div className="hero-copy__stats">
            {profile.counters.map((c) => (
              <div className="hero-copy__stat" key={c.label}>
                <b>{c.value}</b>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-copy__actions">
            <a href="#profile" className="btn btn-primary">
              View operator profile <span aria-hidden="true">&#8594;</span>
            </a>
            <a href={profile.resume} target="_blank" rel="noreferrer" className="btn-ghost">RESUME</a>
          </div>
        </div>

        <div className="hero-scroll" data-hero-fade>
          SCROLL
          <span className="hero-scroll__line" />
        </div>
      </section>

      {/* --------------------------------------------------------- 01 profile */}
      <section id="profile" className="panel panel--flush" data-screen-label="Profile">
        <SectionHead num="01" title="Operator Profile" gloss={sectionCopy.profile.plain} desc={sectionCopy.profile.desc} />
        <div className="profile-grid">
          <div>
            <p className="profile__lede">{profile.lede}</p>
            {profile.bio.map((para) => (
              <p className="profile__body" key={para.slice(0, 32)}>{para}</p>
            ))}
            <div className="profile__actions">
              <Link to="/about" className="btn btn-secondary">Full dossier</Link>
              <a href={profile.resume} target="_blank" rel="noreferrer" className="btn btn-secondary">View resume</a>
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
        </div>
      </section>

      {/* ------------------------------------------------------------- 02 log */}
      <section id="log" className="panel panel--banded" data-screen-label="Mission log">
        <div className="panel__inner">
          <SectionHead
            num="02"
            title="Mission Log"
            gloss={sectionCopy.log.plain}
            desc={sectionCopy.log.desc}
            aside={`${experience.length} TOURS`}
          />
          <div className="stack-list">
            {experience.map((item) => <LogEntry item={item} key={item.id} />)}
          </div>

          <div className="section-head section-head--lead" style={{ marginTop: 72 }}>
            <span className="section-head__num">02.1</span>
            <h2>Training</h2>
            <span className="section-head__gloss">{sectionCopy.training.plain}</span>
            <span className="section-head__rule" />
          </div>
          <p className="section-sub">{sectionCopy.training.desc}</p>
          <div className="stack-list">
            {education.map((item) => <LogEntry item={item} key={item.id} />)}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- 03 loadout */}
      <section id="loadout" className="panel panel--flush" data-screen-label="Loadout">
        <SectionHead
          num="03"
          title="Loadout"
          gloss={sectionCopy.loadout.plain}
          desc={sectionCopy.loadout.desc}
          aside={`${String(openSourceProjects.length).padStart(2, '0')} SLOTS`}
        />
        <div className="loadout">
          {openSourceProjects.map((p, i) => (
            <article className="frame slot" key={p.id}>
              <div className="frame__corner frame__corner--tl" />
              <div className="frame__corner frame__corner--br" />
              <div className="frame__head">
                <span>SLOT {String(i + 1).padStart(2, '0')}</span>
                <span className="frame__class">{p.category.toUpperCase()}</span>
              </div>
              {p.image ? (
                <div
                  className="slot__media"
                  style={{ backgroundImage: `url(${p.image})`, backgroundSize: p.imageFit || 'contain' }}
                  role="img"
                  aria-label={p.title}
                />
              ) : (
                <div className="slot__media slot__media--empty" aria-hidden="true">
                  <span>NO VISUAL FEED</span>
                </div>
              )}
              <h3 className="slot__name">{p.title}</h3>
              <p className="slot__desc">{p.description}</p>
              <div className="slot__event">{p.event} &middot; {p.date}</div>
              <div className="chips">
                {p.technologies.map((t) => <span className="chip" key={t}>{t.toUpperCase()}</span>)}
              </div>
              <div className="slot__links">
                <Link to={`/projects/${p.id}`}>CASE STUDY &#8594;</Link>
                <a href={p.repo} target="_blank" rel="noreferrer" className="link-muted">SOURCE &#8599;</a>
              </div>
            </article>
          ))}
        </div>
        <div className="loadout__more">
          <Link to="/projects" className="btn btn-secondary">View my armory &#8594;</Link>
        </div>
      </section>

      {/* ----------------------------------------------------------- 04 stats */}
      <section id="stats" className="panel panel--banded" data-screen-label="Stat sheet">
        <div className="panel__inner">
          <SectionHead num="04" title="Stat Sheet" gloss={sectionCopy.stats.plain} desc={sectionCopy.stats.desc} />
          <div className="stats-grid">
            {skillGroups.map((group) => (
              <div className="stats__col" key={group.label}>
                <div className="stats__label">{group.label}</div>
                {group.skills.map((s) => (
                  <div className="meter" key={s.name}>
                    <div className="meter__head">
                      <span>{s.name}</span>
                      <span className="meter__val">{s.level}</span>
                    </div>
                    <div className="meter__track">
                      <div className="meter__fill" style={{ width: `${s.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="stack-chips">
            {stack.map((t) => <span key={t}>{t}</span>)}
          </div>
          <div className="counters">
            {profile.counters.map((c) => (
              <div className="counter" key={c.label}>
                <b>{c.value}</b>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- 05 commendations */}
      <section id="commendations" className="panel panel--flush" data-screen-label="Commendations">
        <SectionHead
          num="05"
          title="Commendations"
          gloss={sectionCopy.commendations.plain}
          desc={sectionCopy.commendations.desc}
          aside={`${String(awards.length).padStart(2, '0')} CITATIONS`}
        />
        <div className="awards-grid">
          {awards.map((a) => (
            <article className="frame" key={a.id}>
              <div className="frame__corner frame__corner--tl" />
              <div className="frame__corner frame__corner--br" />
              <div className="frame__head">
                <span>CITATION</span>
                <span className="frame__class">AWARDED</span>
              </div>
              <div className="award__prize">{a.prize.toUpperCase()}</div>
              <h3 className="slot__name">{a.title}</h3>
              <div className="award__issuer">{a.issuer.toUpperCase()}</div>
              <p className="award__desc">{a.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* --------------------------------------------------- 06 field service */}
      <section id="field" className="panel panel--banded" data-screen-label="Field service">
        <div className="panel__inner">
          <SectionHead num="06" title="Field Service" gloss={sectionCopy.field.plain} desc={sectionCopy.field.desc} />
          <div className="stack-list">
            {volunteering.map((item) => <LogEntry item={item} status="SERVED" key={item.id} />)}
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------- 07 comms */}
      <section id="comms" className="panel panel--flush" data-screen-label="Comms">
        <SectionHead num="07" title="Comms" gloss={sectionCopy.comms.plain} desc={sectionCopy.comms.desc} />
        <div className="comms-grid">
          <div>
            <p className="comms__pitch">Got something<br />worth building?</p>
            <a href={`mailto:${profile.email}`} className="comms__mail">
              {profile.email} <span aria-hidden="true">&#8594;</span>
            </a>
            <div className="comms__actions">
              <Link to="/contact" className="btn btn-primary">Open a channel</Link>
              <Link to="/blog" className="btn btn-secondary">Read the blog</Link>
            </div>
          </div>
          <div className="links">
            {socials.map((s) => (
              <a
                className="links__item"
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
              >
                {s.label} <span aria-hidden="true">{s.glyph}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
