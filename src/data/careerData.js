// Mission log — roles, schooling, commendations and field service.
// `status` drives the tag on each log entry: ACTIVE | CLEARED | ONGOING.

export const experience = [
  {
    id: 'umich-consultant',
    when: '2026 — PRESENT',
    status: 'ACTIVE',
    title: 'Computer Consultant 1',
    org: 'University of Michigan',
    desc: 'Supported and maintained distributed infrastructure systems across 75+ campus buildings. Managed inventory lifecycle for 10,000+ devices to ensure optimal availability.'
  },
  {
    id: 'dhvani-ai-engineer',
    when: '2024 — 2025',
    status: 'CLEARED',
    title: 'AI Engineer',
    org: 'Dhvani Analytic Intelligence',
    desc: 'Served as Product Owner for PixIQ AI system. Designed scalable AI architectures on AWS for industrial floor deployment, increasing operational throughput by 25%.'
  },
  {
    id: 'dhvani-junior',
    when: '2023 — 2024',
    status: 'CLEARED',
    title: 'Junior AI Engineer',
    org: 'Dhvani Analytic Intelligence',
    desc: 'Delivered production-grade computer vision solutions for enterprise clients like GE Healthcare, significantly improving defect detection precision by 12%.'
  },
  {
    id: 'trainer',
    when: '2019 — 2025',
    status: 'ONGOING',
    title: 'AI & IoT Trainer',
    org: 'Vaayusastra Aerospace / Freelance',
    desc: 'Mentored over 700 students through hands-on AI/IoT workshops and intensive 12-day internship programs covering hardware and software architectures.'
  }
];

export const education = [
  {
    id: 'umich-ms',
    when: '2025 — PRESENT',
    status: 'ACTIVE',
    title: 'MS, Computer Science and Engineering',
    org: 'University of Michigan, Ann Arbor, MI'
  },
  {
    id: 'srm-btech',
    when: '2018 — 2022',
    status: 'CLEARED',
    title: 'B.Tech, Computer Science',
    org: 'SRM Institute of Science and Technology, Chennai, India'
  }
];

export const awards = [
  {
    id: 'pals-innowah',
    title: 'Winner — Best Innovation',
    issuer: 'PALS Innowah, IIT Madras',
    prize: 'Rs. 10,000 Cash Prize',
    desc: 'Awarded for the project "Know Your Baby kit" from PALS Innowah 2022 competition.'
  },
  {
    id: 'project-day-2022',
    title: 'Project Day Winner 2022',
    issuer: 'SRM Institute of Science and Technology',
    prize: 'Rs. 25,000 Cash Prize',
    desc: 'Awarded for the project "Raksha — Bike and Biker safety device".'
  },
  {
    id: 'project-day-2020',
    title: 'Project Day Winner 2020',
    issuer: 'SRM Institute of Science and Technology',
    prize: 'Rs. 10,000 Cash Prize',
    desc: 'Awarded for the project "ConnecLoRa".'
  },
  {
    id: 'best-intern',
    title: 'Best Intern — IoT & ML',
    issuer: 'Experts Hub',
    prize: 'Top 1 of 150 Interns',
    desc: 'Recognized as the best intern among the group for exceptional architectural contribution.'
  }
];

export const volunteering = [
  {
    id: 'campus-life',
    when: '2019 — 2022',
    title: 'President — Campus Life',
    org: 'SRM Institute of Science and Technology',
    desc: 'Led the cultural and social department of 200 members to organize events fostering campus engagement, collaboration, and student development.'
  },
  {
    id: 'art-of-living',
    when: '2009 — PRESENT',
    title: 'Volunteer',
    org: 'The Art of Living',
    desc: 'Engaged in social initiatives, including food distribution during Tamil Nadu floods and participating in environmental cleanup activities.'
  },
  {
    id: 'game-com',
    when: '2020 — 2021',
    title: 'President — Game Com Club',
    org: 'SRM Institute',
    desc: 'Led a technical club dedicated to game technology, overseeing workshops and training sessions on game design and engine fundamentals.'
  },
  {
    id: 'gdsc',
    when: '2020 — 2021',
    title: 'Member — GDSC',
    org: 'Google Developer Student Clubs',
    desc: 'Contributed actively as a team member, organizing events, workshops, and peer-learning sessions that introduced students to Google technologies.'
  }
];
