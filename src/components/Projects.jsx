import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Projects.css';

const projects = [
  { id: 'budgetbruh', title: 'BudgetBruh (TartanHacks)', category: 'LLM / Finance App', image: '/budgetbruh.png' },
  { id: 'git-landscaper', title: 'Git-Landscaper (UMich)', category: 'Open Source / Git' },
  { id: 'git-hired', title: 'Git-Hired (Claude Builders)', category: 'Agentic AI Interviewer' },
  { id: 'mcq-generation', title: 'MCQ Generation System', category: 'NLP / Research' },
  { id: 'ai-bin', title: 'AI Bin: Smart Garbage', category: 'CV / IoT' },
  { id: 'raksha', title: 'RAKSHA - Bike Safety', category: 'IoT / Hardware' },
];

const Projects = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <section className="projects-section section">
      <div className="container">
        <div className="projects-header">
          <h2 className="section-title text-center">Featured Projects</h2>
        </div>
        
        <motion.div 
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {projects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="project-card-link">
              <motion.div 
                className="project-card" 
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div 
                  className="project-image-placeholder"
                  style={project.image ? { backgroundImage: `url(${project.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  <span className="project-category">{project.category}</span>
                </div>
                <h3 className="project-title">{project.title}</h3>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
