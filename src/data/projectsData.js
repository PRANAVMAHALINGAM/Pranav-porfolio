// Project slots. Shared by the home loadout, /projects and /projects/:id.
// `repo` is optional — cards only render a SOURCE link when one is present.

export const projectsData = [
  {
    id: 'budgetbruh',
    title: 'BudgetBruh',
    category: 'LLM / Finance App',
    date: 'Feb 2026',
    description: 'Developed an LLM-powered behavioral finance app that recontextualizes spending into labor hours and carbon impact. It features a "Freedom Cost" algorithm to visualize how discretionary purchases delay user-defined milestones.',
    technologies: ['LLM', 'React', 'Python', 'AWS'],
    event: 'TartanHacks 2026 (CMU), Pittsburgh, PA',
    image: '/budgetbruh.png',
    imageFit: 'contain'
  },
  {
    id: 'memhub',
    title: 'MemHub',
    category: 'Agentic AI / Systems',
    date: 'May 2026',
    description: 'Centralized memory-as-a-service for multi-agent systems: a two-tier shared store for AutoGen and LangGraph agent teams, pairing SQLite working memory with a ChromaDB long-term tier, plus automatic eviction, promotion and LLM-based summarisation policies.',
    technologies: ['Python', 'FastAPI', 'ChromaDB', 'AutoGen', 'SQLite'],
    event: 'CSE 585: Advanced Scalable Systems for Agentic AI, University of Michigan',
    repo: 'https://github.com/PRANAVMAHALINGAM/memhub'
  },
  {
    id: 'git-landscaper',
    title: 'RepoRanger',
    category: 'Open Source / GitHub',
    date: 'Jan 2026',
    description: 'A privacy-first GitHub App that pairs AI code review with automated branch hygiene. It runs entirely on your own GitHub Actions runners through a dispatcher-worker relay, so source and secrets never leave your environment.',
    technologies: ['GitHub API', 'Node.js', 'Groq', 'Vercel'],
    event: 'Open Source Innovation, University of Michigan',
    image: '/git-landscaper.png',
    imageFit: 'contain',
    repo: 'https://github.com/PRANAVMAHALINGAM/repo-ranger'
  },
  {
    id: 'git-hired',
    title: 'Git-Hired',
    category: 'Agentic AI Interviewer',
    date: 'Nov 2025',
    description: 'Built an AI-powered virtual interviewer using agentic AI concepts to simulate real interview scenarios within a 24-hour hackathon.',
    technologies: ['Agentic AI', 'LLM', 'Python Core'],
    event: 'Best Project – Claude Builders Club Hackathon',
    image: '/githired.jpg',
    imageFit: 'cover',
    repo: 'https://github.com/PRANAVMAHALINGAM/git-hired'
  },
  {
    id: 'mcq-generation',
    title: 'MCQ Generation System',
    category: 'NLP / Research',
    date: 'Dec 2024',
    description: 'Designed an AI-powered system that automatically generates multiple-choice questions from provided text content using natural language processing techniques.',
    technologies: ['NLP', 'Python', 'Transformer Models', 'PyTorch'],
    event: 'Research Project, SRMIST',
    image: '/MCQgeneration.png',
    imageFit: 'cover'
  },
  {
    id: 'ai-bin',
    title: 'AI Bin: Smart Garbage',
    category: 'CV / IoT',
    date: 'Jun 2024',
    description: 'Developed an automated waste segregation system using computer vision and edge computing to classify and sort garbage in real-time.',
    technologies: ['TensorFlow', 'OpenCV', 'Raspberry Pi', 'Python'],
    event: 'Engineering Design Project, SRMIST',
    image: '/AIbin.png',
    imageFit: 'cover'
  },
  {
    id: 'raksha',
    title: 'RAKSHA - Bike Safety',
    category: 'IoT / Hardware',
    date: 'Dec 2022',
    description: 'Developed an award winning IoT safety device for bikers that detects accidents and sends real-time alerts to emergency contacts.',
    technologies: ['ESP32', 'Firebase', 'IoT', 'C++'],
    event: 'Project Day Winner 2022, SRMIST',
    image: '/RAKSHA.png',
    imageFit: 'cover'
  }
];

/* The home loadout is a highlight reel: only work with public source on it. */
export const openSourceProjects = projectsData.filter((p) => p.repo);

/* The index shows everything, but leads with the projects you can go read. */
export const projectsByRepoFirst = [
  ...projectsData.filter((p) => p.repo),
  ...projectsData.filter((p) => !p.repo)
];
