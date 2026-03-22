'use client';

import Navigation from '@/components/Navigation';
import CVDownloadButton from '@/components/CVDownloadButton';
import { SOCIAL_LINKS } from '@/lib/constants';

// ========== DATA SECTION ==========
const projectsData = [
  {
    id: 'airlux',
    title: 'AirLux',
    status: 'Production',
    statusColor: 'tertiary',
    barColor: 'from-primary to-primary',
    description: 'E-commerce and service management platform for air conditioning products. Features AC sales, installation, service scheduling, warranty tracking, and role-based access control.',
    technologies: ['Angular', 'Node.js', 'MongoDB'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9QlbtkrnTzTc0IbBSOJ6NRTwiQ05RDxXM8KIY9842oOE4aFWvIauPqMSmQhzIQTV3iPe16wxZVqFVzJHVHKOpkpfUaaIdp8U0jbbpIGeEwQ7jfkcOd6Osmzvx6_6jA-hNzVQbcJnW4-YVmgSimZ92xjaiWgbg3osiCf6eLT1D0pK6gVoKpPWIv4OaWoWYa_vYzBBdf2TZuqF__7eM6Mi8iqdPqHgdYU5GLVDGYZoljPysNrI0fqxWH7qOdL1ALZI-eS2l9M3I3voN',
  },
  {
    id: 'player-dashboard',
    title: 'Player Dashboard – IoT Cricket Training System',
    status: 'Active',
    statusColor: 'primary',
    barColor: 'from-secondary to-secondary',
    description: 'Web platform integrated with ESP32 sensors for cricket training analytics. Features real-time player performance tracking, automated player ID generation, and interactive analytics dashboard.',
    technologies: ['React', 'Node.js', 'ESP32'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAi1XGWX4TA6GQ8eTZ8Yi1XH_lL0FNwBp0SQUlaQYBeW5-EqVGD7H278W0j_Yx-X9BSYk_qr5BTFg8H4E6bIscWIo0g_v5eDgfWvSiiMxSjuub9cl_Ps3pph9LV5h_VrCSzukqTh0rN45Rnd5kHlO0tvcQ6wiiQx4FNz9o-ltakcCEcZfGamhHSA9E25gaxwxzPe9jEn8ekxNA40t_KJxwrVp6Mx7sSN6KsEBgdggJyYdGpY9hd4DLL1kmNQs4prh8F3VADy6hCyD1k',
  },
  {
    id: 'lms',
    title: 'Learning Management System',
    status: null,
    statusColor: null,
    barColor: 'from-tertiary to-tertiary',
    description: 'Desktop application built with Java Swing and MySQL. Features authentication, email activation, comprehensive logging with Log4j, and XML data handling for educational management.',
    technologies: ['Java', 'MySQL', 'Log4j'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMrzt_sf4-Qqj1Anc8XF9RBcGYkhFvn2daxhVdTp8P5SkkH96IAJNI5QoVuikELwLLLMbod3_ICgT1jYVwRERwh9pqZSuVXq9q0OXkWsiJHijUgnnmo3OtsXHrrWI48efTney7N2S2sPQoAMExgOjWsw5R_uRaqVWjao2YhM0DMaa_gQ0oBNTwxwO3PB6XQSFb-hdnQ8CIls_ydE6Plcp6XoUFhZW2-SY8C6WT2HyIC3QQF79lcR0WMX4qP598db_j3sogaQd46DIz',
  },
  {
    id: 'portfolio',
    title: 'Personal Portfolio Website',
    status: null,
    statusColor: null,
    barColor: 'from-primary to-primary',
    description: 'Modern portfolio website showcasing DevOps expertise, cloud architecture, and full-stack development. Built with Next.js 15, Tailwind CSS, and deployed on Vercel with automated CI/CD.',
    technologies: ['Next.js', 'Tailwind CSS', 'Vercel'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBB1rkafEkndSyDtgv_AFxfzNqtFzWeq6lTPcQlQSf9f7THMdIZfkh4mgc3FKRH4cqFUEt1FYW4lqp9uPM47nhMuJ_ur_8dihu1FSGIN1UPqRE8Futdj_-nkRisCB4zBMyKQLaWaKrv01rbbfxRhfzbsm_ZghAZYpQIwyzy6jSkbKGsFC9sDnV9Jb93ijta6wHSbzJOY0sZd1yWG7jWNufL6tBs0dPOWjz0c2JcrgqZiR8lWkBF_5eVjbmYJHtT2jUIrSYHtqBZKRfm',
  },
];

export default function ProjectsPage() {
  return (
    <>
      <Navigation />
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <HeroSection />
        <ProjectsGrid projects={projectsData} />
        <ContactCTASection />
      </main>
      <Footer />
    </>
  );
}

// ========== HERO SECTION ==========
function HeroSection() {
  return (
    <div className="relative mb-24">
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px]"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]"></div>
      <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-none">
        <span className="text-on-surface">Architecting</span>
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
          Scalable Solutions
        </span>
      </h1>
      <p className="max-w-2xl text-on-surface-variant text-lg md:text-xl font-light leading-relaxed">
        A selection of high-performance cloud infrastructures, automated pipelines, and full-stack ecosystems designed for the modern web.
      </p>
    </div>
  );
}

// ========== PROJECTS GRID SECTION ==========
function ProjectsGrid({ projects }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}

// ========== PROJECT CARD COMPONENT ==========
function ProjectCard({ project }) {
  const getStatusStyles = (color) => {
    const colorMap = {
      tertiary: { bg: 'bg-tertiary/10', text: 'text-tertiary', dot: 'bg-tertiary', border: 'border-tertiary/20' },
      primary: { bg: 'bg-primary/10', text: 'text-primary', dot: 'bg-primary', border: 'border-primary/20' },
    };
    return colorMap[color] || colorMap.primary;
  };

  const statusStyles = project.status ? getStatusStyles(project.statusColor) : null;

  return (
    <div className="group relative flex flex-col bg-surface-container-low rounded-xl overflow-hidden transition-all duration-500 hover:translate-y-[-4px]">
      {/* Image Section */}
      <div className="h-64 overflow-hidden relative">
        <img
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
          src={project.image}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"></div>

        {/* Status Badge */}
        {project.status && statusStyles && (
          <div className="absolute top-4 left-4">
            <span className={`${statusStyles.bg} ${statusStyles.text} text-[10px] font-bold tracking-[0.2em] px-3 py-1 rounded-full uppercase flex items-center gap-1.5 border ${statusStyles.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot} animate-pulse`}></span>
              {project.status}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-8 flex-grow flex flex-col">
        {/* Accent Bar */}
        <AccentBar barColor={project.barColor} />

        {/* Title */}
        <h3 className="font-headline text-3xl font-bold text-on-surface mb-3 tracking-tight">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-on-surface-variant text-sm leading-relaxed mb-6 font-light">
          {project.description}
        </p>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {project.technologies.map((tech) => (
            <span key={tech} className="bg-surface-container-high text-on-surface text-[10px] font-medium px-3 py-1.5 rounded-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-tertiary"></span>
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex items-center gap-4">
          <button className="bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold px-6 py-3 rounded-md uppercase tracking-widest hover:shadow-[0px_0px_20px_rgba(164,230,255,0.3)] transition-all active:scale-95">
            View Project
          </button>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4">
            <span className="material-symbols-outlined text-lg">code</span>
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

// ========== ACCENT BAR COMPONENT ==========
function AccentBar({ barColor }) {
  const barStyles = {
    'from-primary to-primary': 'from-primary to-primary',
    'from-secondary to-secondary': 'from-secondary to-secondary',
    'from-tertiary to-tertiary': 'from-tertiary to-tertiary',
  };

  const bgGradient = barStyles[barColor] || 'from-primary to-primary';

  return <div className={`w-12 h-[2px] mb-6 transition-all duration-500 group-hover:w-24 bg-gradient-to-r ${bgGradient}`}></div>;
}

// ========== CONTACT CTA SECTION ==========
function ContactCTASection() {
  return (
    <section className="mt-32 relative overflow-hidden">
      <div className="glass-panel p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 border border-outline-variant/10 rounded-xl">
        <div className="max-w-xl text-center md:text-left">
          <h2 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-6 leading-none text-on-surface">
            Ready to scale your <span className="text-primary italic">infrastructure?</span>
          </h2>
          <p className="text-on-surface-variant font-light mb-8">
            Let's discuss how we can build resilient systems and beautiful user experiences for your next project.
          </p>
          <button className="group relative px-8 py-4 bg-on-surface text-surface rounded-md font-bold text-sm uppercase tracking-widest transition-all hover:pr-12">
            Get In Touch
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
              arrow_forward
            </span>
          </button>
        </div>
        <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-[60px] animate-pulse"></div>
          <div className="w-full h-full border border-outline-variant/30 rounded-full flex items-center justify-center relative z-10">
            <span className="material-symbols-outlined text-8xl text-primary/50">cloud_done</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== FOOTER SECTION ==========
function Footer() {
  return (
    <footer className="bg-zinc-950 w-full py-12 border-t border-zinc-900">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
        <div className="font-['Inter'] text-xs tracking-widest uppercase text-zinc-500">
          © 2024 Digital Architect. Built for the Cloud.
        </div>
        <div className="flex gap-8">
          <a className="text-zinc-500 hover:text-purple-400 transition-colors opacity-80 hover:opacity-100 duration-200 font-['Inter'] text-xs tracking-widest uppercase" href={SOCIAL_LINKS.github} rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
          <a className="text-zinc-500 hover:text-purple-400 transition-colors opacity-80 hover:opacity-100 duration-200 font-['Inter'] text-xs tracking-widest uppercase" href={SOCIAL_LINKS.linkedin} rel="noopener noreferrer" target="_blank">
            LinkedIn
          </a>
          <a className="text-zinc-500 hover:text-purple-400 transition-colors opacity-80 hover:opacity-100 duration-200 font-['Inter'] text-xs tracking-widest uppercase" href={`mailto:${SOCIAL_LINKS.email}`}>
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
