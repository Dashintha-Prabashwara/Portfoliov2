import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getProjectsDb, getGithubConfigDb } from '@/lib/dbData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProjectsPage() {
  let projects = [];
  let githubConfig = null;

  try {
    const [fetchedProjects, fetchedGithubConfig] = await Promise.all([
      getProjectsDb(),
      getGithubConfigDb(),
    ]);
    projects = fetchedProjects;
    githubConfig = fetchedGithubConfig;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching projects data:', error);
    }
  }

  return (
    <>
      <Navigation />
      <main className="pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <HeroSection />
        <ProjectsGrid projects={projects} showProjectBadges={githubConfig?.showProjectBadges !== false} />
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
function ProjectsGrid({ projects, showProjectBadges = true }) {
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
        <ProjectCard key={project.id} project={project} showProjectBadges={showProjectBadges} />
      ))}
    </div>
  );
}

// ========== PROJECT CARD COMPONENT ==========
function ProjectCard({ project, showProjectBadges = true }) {
  const hasGithubStats =
    showProjectBadges &&
    project.githubUrl &&
    (project.githubStars !== undefined || project.githubForks !== undefined || project.githubLanguage);

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
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-6 md:p-8 flex-grow flex flex-col">
        {/* Accent Bar */}
        <AccentBar barColor={project.barColor} />

        {/* Title & Status Badge */}
        <div className="flex flex-wrap items-center gap-3 mb-2 sm:mb-3">
          <h3 className="font-headline text-xl sm:text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
            {project.title}
          </h3>
          {project.status && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase bg-primary/15 text-primary border border-primary/30">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              {project.status}
            </span>
          )}
        </div>

        {/* Live GitHub Repository Metrics Pill */}
        {hasGithubStats && (
          <div className="flex flex-wrap items-center gap-3 py-1.5 px-3 rounded-lg bg-surface-container-high/60 border border-outline-variant/30 mb-3 text-[11px] font-mono text-on-surface-variant">
            <span className="inline-flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[13px]">terminal</span>
              Repo Sync
            </span>
            {project.githubLanguage && (
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                {project.githubLanguage}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-secondary">star</span>
              {project.githubStars || 0} stars
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-tertiary">call_split</span>
              {project.githubForks || 0} forks
            </span>
          </div>
        )}

        {/* Description */}
        {project.description && (
          <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 font-light">
            {project.description}
          </p>
        )}

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
              className="bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-md uppercase tracking-widest hover:shadow-[0px_0px_20px_rgba(217,84,30,0.35)] transition-all active:scale-95 text-center sm:text-left"
            >
              View Project
            </a>
          )}
          {project.blogUrl && (
            <a
              href={project.blogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-on-surface transition-colors flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold uppercase tracking-widest px-4 sm:px-0"
            >
              <span className="material-symbols-outlined text-lg">article</span>
              Story
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
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-headline text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
          >
            <span>Get in Touch</span>
            <span className="material-symbols-outlined text-sm text-primary">mail</span>
          </Link>
        </div>
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 shrink-0 flex items-center justify-center">
          <div className="w-full h-full border border-outline-variant/30 rounded-full flex items-center justify-center relative z-10 overflow-hidden">
            {/* Animated spreading radial glow emanating from center */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,84,30,0.32)_0%,rgba(217,84,30,0.12)_45%,transparent_75%)] animate-spread-glow pointer-events-none" />
            
            {/* Concentric spreading ripple rings */}
            <div className="absolute inset-2 rounded-full border border-primary/25 animate-ripple-ring pointer-events-none" />
            <div className="absolute inset-2 rounded-full border border-primary/20 animate-ripple-ring pointer-events-none [animation-delay:1.75s]" />

            {/* Center cloud_done icon with warm aura */}
            <span className="material-symbols-outlined text-6xl sm:text-8xl text-primary drop-shadow-[0_0_24px_rgba(217,84,30,0.5)] relative z-20 transition-transform duration-500 hover:scale-110">
              cloud_done
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== FOOTER SECTION ==========
