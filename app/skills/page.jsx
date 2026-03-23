'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { SOCIAL_LINKS } from '@/lib/constants';

export default function Skills() {
  return (
    <>
      <Navigation />
      <main className="pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto overflow-hidden">
        <SkillsHero />
        <SkillsBentoGrid />
        <SystemStatusBar />
      </main>
      <Footer />
    </>
  );
}

// ========== HERO SECTION ==========
function SkillsHero() {
  return (
    <section className="mb-12 sm:mb-16 md:mb-20 relative">
      <div className="absolute -top-24 -left-24 w-64 sm:w-96 h-64 sm:h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
      <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 opacity-90 leading-tight">
        Building Things <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">Reliably</span>
        <br />
        and Learning Always.
      </h1>
      <p className="font-body text-on-surface-variant max-w-xl text-sm sm:text-base md:text-lg lg:text-xl">
        Working across full-stack development and cloud infrastructure. Still learning, always improving, and enjoying the process.
      </p>
    </section>
  );
}

// ========== SKILLS BENTO GRID SECTION ==========
function SkillsBentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-stretch mb-12">
      {/* Frontend Ecosystem */}
      <div className="md:col-span-8 bg-surface-container-low p-6 sm:p-8 rounded-lg relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-6 h-[2px] bg-primary"></div>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">terminal</span>
            <h2 className="font-headline text-lg sm:text-xl md:text-2xl font-semibold tracking-tight uppercase">Web & Frontend</h2>
          </div>
          <p className="text-on-surface-variant mb-8 sm:mb-12 max-w-lg text-sm sm:text-base">Learning to build responsive, interactive interfaces with modern frameworks. Comfortable with JavaScript/TypeScript and always improving my skills.</p>
          <div className="flex flex-wrap gap-3 sm:gap-4 mt-auto">
            {['Angular', 'React', 'Next.js', 'TypeScript', 'JavaScript', 'CSS/HTML', 'Tailwind CSS'].map((tech) => (
              <div key={tech} className="bg-surface-container-high px-3 sm:px-4 py-2 sm:py-3 rounded-md flex items-center gap-2 sm:gap-3 hover:bg-surface-container-highest transition-all duration-300 border border-outline-variant/10 text-xs sm:text-sm">
                <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#00f9be]"></span>
                <span className="font-label text-xs sm:text-sm uppercase tracking-widest font-bold">{tech}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
          <span className="material-symbols-outlined text-[100px] sm:text-[200px]">dashboard</span>
        </div>
      </div>

      {/* DevOps & Cloud */}
      <div className="md:col-span-4 bg-surface-container-low p-6 sm:p-8 rounded-lg relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-6 h-[2px] bg-secondary"></div>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="material-symbols-outlined text-secondary text-2xl sm:text-3xl">cloud_done</span>
            <h2 className="font-headline text-lg sm:text-xl md:text-2xl font-semibold tracking-tight uppercase">AWS & Cloud</h2>
          </div>
          <div className="space-y-4">
            {['DynamoDB', 'API Gateway', 'Lambda Functions', 'GitHub Actions'].map((skill) => (
              <div key={skill} className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
                <span className="font-label text-xs sm:text-sm font-semibold tracking-widest uppercase">{skill}</span>
                <span className="material-symbols-outlined text-tertiary text-lg">check_circle</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backend Core */}
      <div className="md:col-span-5 bg-surface-container-low p-6 sm:p-8 rounded-lg relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-6 h-[2px] bg-primary"></div>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">database</span>
            <h2 className="font-headline text-lg sm:text-xl md:text-2xl font-semibold tracking-tight uppercase">Backend & Databases</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {[
              { label: 'Runtime', value: 'Node.js' },
              { label: 'Language', value: 'Java / Python' },
              { label: 'Primary DB', value: 'MongoDB' },
              { label: 'SQL', value: 'MySQL' },
            ].map((item) => (
              <div key={item.label} className="bg-surface-container-lowest p-3 sm:p-4 rounded-md border border-outline-variant/5">
                <p className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">{item.label}</p>
                <p className="font-headline font-bold text-sm sm:text-lg">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Storage & Scale */}
      <div className="md:col-span-7 bg-surface-container-low p-6 sm:p-8 rounded-lg relative overflow-hidden group flex flex-col justify-between">
        <div className="absolute top-0 left-0 w-6 h-[2px] bg-secondary"></div>
        <div>
          <div className="flex items-center gap-3 mb-6 sm:mb-8">
            <span className="material-symbols-outlined text-secondary text-2xl sm:text-3xl">storage</span>
            <h2 className="font-headline text-lg sm:text-xl md:text-2xl font-semibold tracking-tight uppercase">Development & Tools</h2>
          </div>
          <p className="text-on-surface-variant mb-6 sm:mb-8 text-sm sm:text-base">Working with desktop development, real-time systems, and exploring different tools across the development lifecycle.</p>
        </div>
        <div className="flex items-center gap-6 sm:gap-8 md:gap-12 overflow-x-auto pb-4">
          {[
            { name: 'Java', icon: 'code' },
            { name: 'Python', icon: 'smart_toy' },
            { name: 'GitHub', icon: 'hub' },
            { name: 'ESP32 IoT', icon: 'router' },
          ].map((tool) => (
            <div key={tool.name} className="flex flex-col items-center gap-2 min-w-max">
              <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center border border-outline-variant/10 group-hover:border-tertiary/50 transition-colors">
                <span className="material-symbols-outlined text-tertiary">{tool.icon}</span>
              </div>
              <span className="font-label text-[10px] uppercase tracking-widest">{tool.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ========== SYSTEM STATUS BAR SECTION ==========
function SystemStatusBar() {
  return (
    <section className="mt-16 sm:mt-20 bg-surface-container/40 backdrop-blur-md border border-outline-variant/10 rounded-lg p-4 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 sm:gap-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full md:w-auto">
        <div className="flex flex-col">
          <span className="font-label text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">Deployment Readiness</span>
          <span className="font-headline text-lg sm:text-xl font-bold">100% Production Ready</span>
        </div>
        <div className="h-10 w-[1px] bg-outline-variant/20 hidden md:block"></div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-tertiary animate-pulse shadow-[0_0_12px_#00f9be]"></span>
          <span className="font-label text-xs uppercase tracking-widest font-bold text-tertiary">All Systems Operational</span>
        </div>
      </div>
      <div className="flex gap-3 sm:gap-4 w-full md:w-auto">
        <Link href="/experience">
          <button className="flex-1 md:flex-none bg-surface-container-high hover:bg-surface-container-highest px-4 sm:px-6 py-2 rounded-md font-label text-xs uppercase tracking-widest transition-all">
            View Architecture
          </button>
        </Link>
        <Link href="/contact">
          <button className="flex-1 md:flex-none bg-gradient-to-r from-primary to-secondary text-on-primary px-4 sm:px-6 py-2 rounded-md font-label text-xs uppercase tracking-widest font-bold hover:scale-105 active:scale-95 transition-transform">
            Hire for Project
          </button>
        </Link>
      </div>
    </section>
  );
}

// ========== FOOTER SECTION ==========
function Footer() {
  return (
    <footer className="bg-zinc-950 w-full py-8 sm:py-12 border-t border-zinc-900 mt-24 sm:mt-32">
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center px-4 sm:px-8 max-w-7xl mx-auto font-['Inter'] text-xs tracking-widest uppercase">
        <div className="text-zinc-500 opacity-80 text-center sm:text-left">© 2026 Dashintha Jayawardana. Built for the Cloud | All Rights Reserved</div>
        <div className="flex gap-6 sm:gap-8 justify-center sm:justify-end">
          <a className="text-zinc-500 hover:text-purple-400 transition-colors opacity-80 hover:opacity-100 duration-200" href={SOCIAL_LINKS.github} rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
          <a className="text-zinc-500 hover:text-purple-400 transition-colors opacity-80 hover:opacity-100 duration-200" href={SOCIAL_LINKS.linkedin} rel="noopener noreferrer" target="_blank">
            LinkedIn
          </a>
          <a className="text-zinc-500 hover:text-purple-400 transition-colors opacity-80 hover:opacity-100 duration-200" href={`mailto:${SOCIAL_LINKS.email}`}>
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
