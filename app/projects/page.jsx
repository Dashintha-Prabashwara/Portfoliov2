import Navigation from '@/components/Navigation';
import CVDownloadButton from '@/components/CVDownloadButton';
import { SOCIAL_LINKS } from '@/lib/constants';
import { getProjects } from '@/lib/notion';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  let projects = [];

  try {
    projects = await getProjects();
  } catch (error) {
    console.error('Error fetching projects:', error);
  }

  return (
    <>
      <Navigation />
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <HeroSection />
        <ProjectsGrid projects={projects} />
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
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold px-6 py-3 rounded-md uppercase tracking-widest hover:shadow-[0px_0px_20px_rgba(164,230,255,0.3)] transition-all active:scale-95"
            >
              View Project
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4"
            >
              <span className="material-symbols-outlined text-lg">code</span>
              GitHub
            </a>
          )}
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
