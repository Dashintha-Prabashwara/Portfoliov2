import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getProjectsDb } from '@/lib/dbData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProjectsPage() {
  let projects = [];

  try {
    projects = await getProjectsDb();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching projects:', error);
    }
  }

  return (
    <>
      <Navigation />
      <main className="pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
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
    <div className="relative mb-16 sm:mb-20 md:mb-24">
      <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-6 leading-none">
        <span className="text-on-surface">Building</span>
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
          Real Projects
        </span>
      </h1>
      <p className="max-w-2xl text-on-surface-variant text-sm sm:text-base md:text-lg lg:text-xl font-light leading-relaxed">
        A collection of projects I've worked on - from e-commerce platforms to IoT systems. Each one taught me something new about building and deploying software.
      </p>
    </div>
  );
}

// ========== PROJECTS GRID SECTION ==========
function ProjectsGrid({ projects }) {
  if (projects.length === 0) {
    return (
      <div className="border border-dashed border-outline-variant/30 rounded-xl px-6 py-12 text-center">
        <h2 className="font-headline text-xl sm:text-2xl font-bold mb-2">Projects are being updated</h2>
        <p className="text-on-surface-variant text-sm">Please check back soon for the latest work.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
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
      <div className="h-40 sm:h-48 md:h-64 overflow-hidden relative">
        <Image
          alt={project.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
          src={project.image}
          width={500}
          height={256}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"></div>

        {/* Status Badge */}
        {project.status && statusStyles && (
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <span className={`${statusStyles.bg} ${statusStyles.text} text-[10px] font-bold tracking-[0.2em] px-3 py-1 rounded-full uppercase flex items-center gap-1.5 border ${statusStyles.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusStyles.dot}`}></span>
              {project.status}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-6 md:p-8 flex-grow flex flex-col">
        {/* Accent Bar */}
        <AccentBar barColor={project.barColor} />

        {/* Title */}
        <h3 className="font-headline text-xl sm:text-2xl md:text-3xl font-bold text-on-surface mb-2 sm:mb-3 tracking-tight">
          {project.title}
        </h3>

        {/* Description */}
        <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 font-light">
          {project.description}
        </p>

        {/* Tech Tags */}
        <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
          {project.technologies.map((tech) => (
            <span key={tech} className="bg-surface-container-high text-on-surface text-[10px] font-medium px-2 sm:px-3 py-1.5 rounded-sm uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-tertiary"></span>
              {tech}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-md uppercase tracking-widest hover:shadow-[0px_0px_20px_rgba(164,230,255,0.3)] transition-all active:scale-95 text-center sm:text-left"
            >
              View Project
            </a>
          )}
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center justify-center sm:justify-start gap-2 text-xs font-bold uppercase tracking-widest px-4 sm:px-0"
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
    <section className="mt-24 sm:mt-32 md:mt-40 relative overflow-hidden">
      <div className="glass-panel p-6 sm:p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12 border border-outline-variant/10 rounded-xl">
        <div className="max-w-xl text-center md:text-left">
          <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 sm:mb-6 leading-none text-on-surface">
            Ready to scale your <span className="text-primary italic">infrastructure?</span>
          </h2>
          <p className="text-on-surface-variant font-light mb-6 sm:mb-8 text-sm sm:text-base">
            Let's discuss how we can build resilient systems and beautiful user experiences for your next project.
          </p>
          <Link href="/contact" className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-on-surface text-surface rounded-md font-bold text-xs sm:text-sm uppercase tracking-widest transition-all hover:pr-12 w-full md:w-auto">
            Get In Touch
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 shrink-0">
          <div className="w-full h-full border border-outline-variant/30 rounded-full flex items-center justify-center relative z-10">
            <span className="material-symbols-outlined text-6xl sm:text-8xl text-primary/50">cloud_done</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== FOOTER SECTION ==========
