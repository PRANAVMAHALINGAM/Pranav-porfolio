// Identity, bio and contact details. Single source for the home HUD and /about.

export const profile = {
  name: 'Pranav Mahalingam',
  role: 'AI Software Engineer',
  tagline: 'AI SYSTEMS',
  status: 'OPEN TO WORK',
  workAuth: 'H1B sponsorship required',
  location: 'Ann Arbor, MI',
  email: 'mpranavm@umich.edu',
  emailAlt: 'mpranavmahalingam@gmail.com',
  resume: '/Pranav_Software_Engineer_Resume.pdf',
  portrait: '/profile.jpg',

  heroCopy:
    'Software and AI engineer with 3+ years building AI/ML, computer vision and IoT-driven systems — architecting scalable platforms and shipping production-grade solutions on AWS.',

  lede:
    'I work on the unglamorous half of AI — the retrieval, the evaluation, the latency budget, the part that decides whether a demo becomes a product.',

  bio: [
    'I am a Software Engineer and AI Engineer with over 3 years of experience building AI/ML, computer vision, and IoT-driven systems. Driven by innovation and problem solving, I have architected scalable AI platforms and deployed production-grade solutions on AWS. I am currently pursuing a Master of Science in Computer Science and Engineering at the University of Michigan.',
    'My previous role at Dhvani Analytic Intelligence involved acting as a Product Owner for the PixIQ AI system, reducing project turnaround time by 15% and increasing operational throughput by 25%.'
  ],

  spec: [
    { label: 'PRIMARY', value: 'Python' },
    { label: 'SECONDARY', value: 'C++ / JavaScript' },
    { label: 'DOMAIN', value: 'AI, Vision & IoT' },
    { label: 'EDUCATION', value: 'MS CSE — Michigan' },
    { label: 'LOCATION', value: 'Ann Arbor, MI' },
    { label: 'CLEARANCE', value: 'Open to work (H1B sponsorship required)' }
  ],

  // Rendered as the hero readout and the stat-sheet counters.
  counters: [
    { label: 'YEARS OF EXPERIENCE', value: '3+' },
    { label: 'PROJECTS DONE', value: '20+' },
    { label: 'STUDENTS MENTORED', value: '700+' }
  ],

  expertise: [
    { title: 'AI & Deep Learning', desc: 'Designing scalable AI system architectures for industrial deployment using Python and AWS.' },
    { title: 'Computer Vision', desc: 'Delivering production-grade computer vision solutions to improve defect detection.' },
    { title: 'Software Engineering', desc: 'Building high-performance applications, GitHub tools, and full-stack platforms.' },
    { title: 'IoT & Edge Analytics', desc: 'Prototyping advanced IoT embedded systems with ESP32 and Raspberry Pi.' },
    { title: 'Mentorship', desc: 'Training and mentoring over 700+ students through intensive technical bootcamps.' }
  ]
};

export const socials = [
  { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/pranav-mahalingam/', icon: 'linkedin', glyph: '↗' },
  { label: 'GITHUB', href: 'https://github.com/PRANAVMAHALINGAM', icon: 'github', glyph: '↗' },
  { label: 'EMAIL', href: 'mailto:mpranavm@umich.edu', icon: 'mail', glyph: '↗' },
  { label: 'RESUME PDF', href: '/Pranav_Software_Engineer_Resume.pdf', icon: 'resume', glyph: '↗' }
];

/* Plain-English gloss for every HUD section name, so the callsigns are never
   the only label a reader gets. `plain` is the short translation shown next to
   the section number; `desc` is the one-line standfirst under it. Keyed by the
   home page's section id, and reused as the standfirst on the matching route. */
export const sectionCopy = {
  profile: {
    plain: 'About me',
    desc: 'Who I am, what I build, and the stack I reach for first.'
  },
  log: {
    plain: 'My experience',
    desc: 'Where I have worked and what I shipped there.'
  },
  training: {
    plain: 'Education',
    desc: 'Degrees and the institutions behind them.'
  },
  loadout: {
    plain: 'Projects',
    desc: 'Shipped work — hackathon builds, research systems and hardware. Open a slot for the full brief.'
  },
  stats: {
    plain: 'Technical skills',
    desc: 'Languages, AI and systems work, rated by how often I actually reach for them.'
  },
  commendations: {
    plain: 'Awards',
    desc: 'Competition wins and recognitions picked up along the way.'
  },
  field: {
    plain: 'Volunteering',
    desc: 'Community work — clubs I have led and causes I keep showing up for.'
  },
  comms: {
    plain: 'Contact',
    desc: 'How to reach me, and where else I post.'
  },
  blog: {
    plain: 'Blog',
    desc: 'Field notes from hackathons, the master’s, and whatever I am building this month.'
  }
};
