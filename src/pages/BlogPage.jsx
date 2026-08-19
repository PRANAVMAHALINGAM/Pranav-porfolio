import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';
import InnerHero from '../components/InnerHero';
import { linkedinPosts } from '../data/linkedinPosts';
import { sectionCopy } from '../data/profileData';

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const BlogPage = () => (
  <div className="inner-page-wrapper">
    <InnerHero
      num="05"
      eyebrow="TRANSMISSIONS · BLOG"
      title="Blog"
      desc={`${sectionCopy.blog.desc} Mirrored from LinkedIn.`}
    />

    <section className="panel panel--flush">
      <div className="section-head">
        <span className="section-head__num">05</span>
        <h2>Latest updates</h2>
        <span className="section-head__gloss">{sectionCopy.blog.plain}</span>
        <span className="section-head__rule" />
        <span className="section-head__aside">{String(linkedinPosts.length).padStart(2, '0')} POSTS</span>
      </div>

      <motion.div
        className="posts"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
      >
        {linkedinPosts.map((post) => (
          <motion.article className="frame post" key={post.id} variants={item}>
            <div className="post__media">
              <img src={post.image} alt="" loading="lazy" />
              {post.category && <span className="post__cat">{post.category.toUpperCase()}</span>}
            </div>
            <div className="post__body">
              <div className="post__date">{post.date}</div>
              <h3 className="post__title">{post.title}</h3>
              <p className="post__snippet">{post.snippet}</p>
              <a className="post__link" href={post.url} target="_blank" rel="noopener noreferrer">
                READ FULL POST <ExternalLink size={14} />
              </a>
            </div>
          </motion.article>
        ))}
      </motion.div>

      <div className="text-center" style={{ marginTop: 64 }}>
        <a
          className="btn btn-secondary"
          href="https://www.linkedin.com/in/pranav-mahalingam/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Follow on LinkedIn <ArrowRight size={16} />
        </a>
      </div>
    </section>
  </div>
);

export default BlogPage;
