// Texts of the README images, written for GitHub. The facts match
// javimoralesg.com; the layout and the voice are the README's own.

export const site = 'https://javimoralesg.com'

export const intro = {
  first: 'Javier',
  last: 'Morales Galisteo.',
  subtitle: 'Telecom engineering · Language models · Full-stack',
  roles: [
    'Telecom Engineering student @ ETSIT UPM',
    'Training LLMs to write AQL @ ArangoDB',
    'LLM research @ GING · ETSIT UPM',
    'Full-stack: React · Node · Spring Boot · FastAPI',
    '1st prize @ Cabify Product Hackathon',
  ],
}

export const now = [
  ['Now', 'GRPO Studio at ArangoDB'],
  ['Research', 'Language models at GING–UPM'],
  ['Studying', 'Telecom engineering, ETSIT UPM'],
]

export const badges = [
  { id: 'portfolio', label: 'javimoralesg.com', href: site },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/javimoralesg' },
  { id: 'email', label: 'Email', href: 'mailto:contact@javimoralesg.com' },
]

export const work = {
  index: '01',
  title: 'Things I’ve built.',
  list: [
    {
      id: 'atalaya', title: 'Atalaya', meta: 'HackSpain · 2026',
      text: 'A command room for wildfire response. Agents gather the signals and propose actions, and a person approves them.',
      tags: ['Next.js', 'Supabase', 'Leaflet'], href: 'https://atalaya.javimoralesg.com',
    },
    {
      id: 'grpo-studio', title: 'GRPO Studio', meta: 'ArangoDB · since 2025',
      text: 'Trains models that write AQL queries for ArangoDB. In the evaluation, accuracy went from 36.8% to 84.9%.',
      tags: ['Python', 'vLLM', 'LoRA'], href: 'https://grpostudio.javimoralesg.com/',
    },
    {
      id: 'cabify-jarvis', title: 'Cabify Jarvis', meta: 'First prize · Cabify', award: true,
      text: 'A driverless ride with a voice assistant. The phone and the car screen stay in sync for the whole trip.',
      tags: ['React', 'Node.js', 'ElevenLabs'], href: 'https://cabify.javimoralesg.com',
    },
    {
      id: 'urbandesk', title: 'UrbanDesk', meta: 'ETSIT UPM · ActúaUPM',
      text: 'Citizens report incidents by voice or on a map, and operators and technicians follow them up.',
      tags: ['React', 'Spring Boot', 'PostgreSQL'], href: 'https://github.com/javimoralesg/UrbanDesk',
    },
    {
      id: 'weddo', title: 'Weddo', meta: 'Solo project',
      text: 'A wedding in one place: seating plan, shared photos, guest chat and payments.',
      tags: ['React', 'Express', 'Socket.IO'], href: 'https://weddo.javimoralesg.com',
    },
    {
      id: 'optimia', title: 'OptimIA', meta: 'IndesIA Hack · 2025',
      text: 'Picks the model for each question by cost, quality and energy use.',
      tags: ['React', 'Python', 'Firebase'], href: 'https://github.com/javimoralesg/indesIAhack',
    },
  ],
}

export const toolbox = {
  index: '02',
  title: 'Toolbox.',
  groups: [
    ['Languages', ['Python', 'TypeScript', 'JavaScript', 'Java', 'C and C++', 'Swift', 'PHP']],
    ['Web and backend', ['React', 'Next.js', 'Node.js', 'Express', 'Spring Boot', 'FastAPI']],
    ['Data', ['PostgreSQL', 'MySQL', 'SQLite', 'Supabase', 'Firebase', 'ArangoDB']],
    ['Models', ['GRPO', 'LoRA', 'vLLM', 'Hugging Face', 'Jupyter']],
  ],
}

export const activity = { index: '03', title: 'On GitHub.' }

export const closing = {
  title: 'Want the longer version?',
  text: 'My portfolio has every project with its story, the path that led to them and JavIA, an assistant you can ask about my work in English or Spanish.',
  link: 'javimoralesg.com',
  href: site,
}

