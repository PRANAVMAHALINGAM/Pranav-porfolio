// Identity, bio and contact details. Single source for the home HUD and /about.

export const profile = {
  name: 'Pranav Mahalingam',
  role: 'AI Software Engineer',
  tagline: 'AI SYSTEMS',
  status: 'OPEN TO WORK',
  location: 'Ann Arbor, MI',
  email: 'mpranavmahalingam@gmail.com',
  emailAlt: 'mpranavm@umich.edu',
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
    { label: 'CLEARANCE', value: 'Open to work' }
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
  { label: 'EMAIL', href: 'mailto:mpranavmahalingam@gmail.com', icon: 'mail', glyph: '↗' },
  { label: 'RESUME PDF', href: '/Pranav_Software_Engineer_Resume.pdf', icon: 'resume', glyph: '↓', download: true }
];
