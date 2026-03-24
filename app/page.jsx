import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import { SOCIAL_LINKS } from '@/lib/constants';

// ========== DATA SECTION ==========
const techStackData = [
  { icon: 'terminal', label: 'Node.js' },
  { icon: 'code', label: 'JavaScript' },
  { icon: 'settings_ethernet', label: 'GitHub Actions' },
  { icon: 'layers', label: 'React' },
  { icon: 'database', label: 'MongoDB' },
  { icon: 'hub', label: 'Angular' },
];

export default async function Home() {
  return (
    <>
      <Navigation />
      <main className="relative pt-20 sm:pt-24 md:pt-24 overflow-hidden">
        <HeroSection />
        <SkillsSection />
        <TechStackSection />
      </main>
      <Footer />
    </>
  );
}

// ========== HERO SECTION ==========
function HeroSection() {
  return (
    <section className="relative flex items-center px-4 sm:px-6 md:px-12 py-16 sm:py-24 md:min-h-[calc(100vh-80px)] md:py-0 overflow-hidden">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 bg-gradient-to-br opacity-5 -z-10"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(133, 147, 153, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(133, 147, 153, 0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      ></div>
      <div
        className="absolute top-1/4 -right-32 sm:-right-20 w-96 sm:w-[600px] h-96 sm:h-[600px] -z-10"
        style={{
          background:
            'radial-gradient(circle, rgba(164, 230, 255, 0.15) 0%, rgba(216, 185, 255, 0.05) 50%, rgba(19, 19, 19, 0) 100%)',
        }}
      ></div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="space-y-6 sm:space-y-8">
          {/* System Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/15">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-label text-on-surface-variant">
              System Status: Optimal
            </span>
          </div>

          {/* Hero Title */}
          <div>
            <h2 className="text-on-surface-variant font-headline text-sm sm:text-base md:text-lg lg:text-xl tracking-wide uppercase opacity-80">
              DevOps & Cloud Enthusiast
            </h2>
            <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tighter leading-none mt-2 text-on-surface">
              Dashintha <br />{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-tertiary">
                Jayawardana
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="font-body text-on-surface-variant text-sm sm:text-base md:text-lg lg:text-xl max-w-xl leading-relaxed">
            I enjoy building and learning about cloud infrastructure, automation, and deployment pipelines. I'm driven by making systems reliable and helping teams ship faster.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-4 sm:pt-6">
            <Link href="/projects">
              <button className="w-full sm:w-auto bg-gradient-to-br from-primary to-secondary text-on-primary px-6 sm:px-8 py-3 sm:py-4 rounded-md font-bold text-sm sm:text-base tracking-tight hover:shadow-[0_0_20px_rgba(164,230,255,0.3)] transition-all flex items-center justify-center sm:justify-start gap-2">
                View Projects
                <span className="material-symbols-outlined text-sm">arrow_outward</span>
              </button>
            </Link>
            <Link href="/skills">
              <button className="w-full sm:w-auto bg-transparent border border-outline-variant/30 hover:bg-surface-container-highest px-6 sm:px-8 py-3 sm:py-4 rounded-md font-bold text-sm sm:text-base tracking-tight transition-all text-on-surface">
                About My Stack
              </button>
            </Link>
          </div>
        </div>

        {/* Right Side - Availability Card */}
        <div className="hidden md:block relative">
          <div className="aspect-square w-full max-w-md mx-auto relative">
            <div className="absolute inset-0 bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
              <Image
                className="w-full h-full object-cover mix-blend-overlay opacity-100"
                alt="Dashintha's profile"
                src="/images/profile.png"
                width={400}
                height={400}
              />
            </div>
            <div className="absolute -top-4 -right-4 p-4 sm:p-6 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-2xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">cloud_done</span>
                </div>
                <div>
                  <div className="text-[10px] text-on-surface-variant uppercase font-label">
                    Availability
                  </div>
                  <div className="text-lg font-headline font-bold text-on-surface">99.99%</div>
                </div>
              </div>
              <div className="h-1 w-32 bg-surface-container-lowest rounded-full overflow-hidden">
                <div className="h-full bg-primary w-5/5"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== SKILLS SECTION ==========
function SkillsSection() {
  return (
    <section className="px-4 sm:px-6 md:px-12 py-16 sm:py-24 md:py-32 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 sm:mb-16 md:mb-20">
          <div className="max-w-2xl">
            <span className="text-primary font-label text-xs tracking-[0.3em] uppercase">
              Architecture Focus
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mt-4 tracking-tight">
              Full-Stack Learning, <br /> DevOps Building.
            </h3>
          </div>
          <p className="font-body text-on-surface-variant max-w-md pb-0 md:pb-2 text-sm sm:text-base">
            I focus on building reliable automation and systems that make developers' lives easier. Still learning new approaches and improving continuously.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Automation First Strategy */}
          <div className="md:col-span-2 bg-surface-container rounded-xl p-6 sm:p-8 md:p-10 border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-[2px] w-24 bg-primary"></div>
            <div className="relative z-10 space-y-4">
              <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary">
                developer_mode
              </span>
              <h4 className="font-headline text-xl sm:text-2xl font-bold">Building Strong CI/CD Pipelines</h4>
              <p className="text-on-surface-variant leading-relaxed max-w-lg text-sm sm:text-base">
                I'm learning to build pipelines that handle testing, building, and deployment smoothly. I'm working on understanding how to incorporate better security scanning and automated testing into the process.
              </p>
            </div>
            <div className="mt-6 sm:mt-8 flex gap-2 sm:gap-3 flex-wrap">
              <span className="px-3 py-1 bg-surface-container-high rounded text-xs font-label uppercase flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-tertiary"></span> GitHub Actions
              </span>
              <span className="px-3 py-1 bg-surface-container-high rounded text-xs font-label uppercase flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-tertiary"></span> AWS Lambda
              </span>
              <span className="px-3 py-1 bg-surface-container-high rounded text-xs font-label uppercase flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-tertiary"></span> Node.js
              </span>
            </div>
          </div>

          {/* Cloud Native */}
          <div className="bg-surface-container rounded-xl p-6 sm:p-8 md:p-10 border border-outline-variant/10 relative overflow-hidden flex flex-col justify-between group">
            <div className="space-y-4">
              <h4 className="font-headline text-xl sm:text-2xl font-bold">Cloud Infrastructure</h4>
              <p className="text-on-surface-variant text-sm">
                Exploring different cloud environments and learning how to build systems that work well at scale.
              </p>
            </div>
            <div className="pt-6 sm:pt-8">
              <img
                className="w-full h-24 sm:h-32 object-cover mix-blend-overlay opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all"
                alt="Digital globe"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ5VQhabgGTqrV1RPiFMj_0TBgNIFbMVAaDpPfTmjzb7RJnlQS8hJln19uSkAJiQpbZx9f-6xFD15Q-pSCF7Adc0Oe08TJzFB8sirKmPXCpFb52a6ItlF_s6wJhm8udxl3vLpvf0iuR_dzaIZPUhHC0kXzx7v-PdvpaiAQUlphCG61K86PssqRbKoAos5EmAoA3F9lsAdZkGDsaIfWAZO3FOMny4ci7cJhMQ5p-LAOa8-c80gHxDTw53HS3kut583P8bJ3ILM4uf1L"
              />
            </div>
          </div>

          {/* Years Experience */}
          <div className="bg-surface-container rounded-xl p-6 sm:p-8 md:p-10 border border-outline-variant/10 flex flex-col justify-center items-center text-center">
            <div className="text-4xl sm:text-5xl font-headline font-bold text-primary mb-2">0.8+</div>
            <div className="text-xs uppercase font-label tracking-widest text-on-surface-variant">
              Years Experience
            </div>
          </div>

          {/* Scalable Architecture */}
          <div className="md:col-span-2 bg-gradient-to-br from-surface-container to-surface-container-highest rounded-xl p-6 sm:p-8 md:p-10 border border-outline-variant/10 flex flex-col md:flex-row gap-6 sm:gap-8 items-start md:items-center">
            <div className="flex-1 space-y-4">
              <h4 className="font-headline text-xl sm:text-2xl font-bold">Working with Infrastructure Changes</h4>
              <p className="text-on-surface-variant text-sm sm:text-base">
                I'm learning about how to migrate between different architecture patterns and working on keeping deployments smooth and efficient.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 flex-shrink-0">
              <div className="w-20 sm:w-24 h-20 sm:h-24 bg-surface-container-lowest rounded flex items-center justify-center border border-outline-variant/10">
                <span className="material-symbols-outlined text-2xl sm:text-3xl opacity-50">hub</span>
              </div>
              <div className="w-20 sm:w-24 h-20 sm:h-24 bg-surface-container-lowest rounded flex items-center justify-center border border-outline-variant/10">
                <span className="material-symbols-outlined text-2xl sm:text-3xl opacity-50">monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ========== TECH STACK SECTION ==========
function TechStackSection() {
  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 overflow-hidden relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <TechStackHeader />
        <TechStackGrid />
      </div>
      {/* Decorative Background Text */}
      <div className="absolute -bottom-10 left-0 w-full whitespace-nowrap overflow-hidden -z-10 select-none pointer-events-none opacity-[0.03]">
        <span className="text-8xl sm:text-[12rem] md:text-[20rem] font-headline font-bold leading-none">
          INFRASTRUCTURE INFRASTRUCTURE INFRASTRUCTURE
        </span>
      </div>
    </section>
  );
}

function TechStackHeader() {
  return (
    <div className="flex flex-col items-center text-center mb-12 sm:mb-16">
      <h2 className="font-headline text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-4 sm:mb-6">
        Built for the <br /> <span className="text-secondary italic">Modern Web.</span>
      </h2>
      <p className="text-on-surface-variant max-w-xl font-body text-sm sm:text-base leading-relaxed">
        My toolkit focuses on reliability and getting things done. These are the technologies I use regularly and continue to learn more about.
      </p>
    </div>
  );
}

function TechStackGrid() {
  return (
    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 opacity-50 grayscale hover:opacity-100 transition-all duration-700">
      {techStackData.map((tech) => (
        <div key={tech.label} className="flex items-center gap-2 font-headline font-bold text-sm sm:text-base md:text-xl">
          <span className="material-symbols-outlined text-primary text-sm sm:text-base md:text-lg">{tech.icon}</span> {tech.label}
        </div>
      ))}
    </div>
  );
}

// ========== FOOTER SECTION ==========
function Footer() {
  return (
    <footer className="bg-zinc-950 w-full py-8 sm:py-12 border-t border-zinc-900">
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-zinc-500 font-['Inter'] text-xs tracking-widest uppercase text-center sm:text-left">
          © 2026 Dashintha Jayawardana. Built for the Cloud | All Rights Reserved
        </div>
        <div className="flex gap-6 sm:gap-8 justify-center sm:justify-end">
          <a
            className="text-zinc-500 hover:text-purple-400 transition-colors font-['Inter'] text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200"
            href={SOCIAL_LINKS.github}
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <a
            className="text-zinc-500 hover:text-purple-400 transition-colors font-['Inter'] text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200"
            href={SOCIAL_LINKS.linkedin}
            rel="noopener noreferrer"
            target="_blank"
          >
            LinkedIn
          </a>
          <a
            className="text-zinc-500 hover:text-purple-400 transition-colors font-['Inter'] text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200"
            href={`mailto:${SOCIAL_LINKS.email}`}
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
