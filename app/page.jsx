import CVDownloadButton from '@/components/CVDownloadButton';
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

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="relative pt-24 overflow-hidden">
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
    <section className="relative min-height-[921px] flex items-center px-6 md:px-12 py-20 overflow-hidden">
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
        className="absolute top-1/4 -right-20 w-[600px] h-[600px] -z-10"
        style={{
          background:
            'radial-gradient(circle, rgba(164, 230, 255, 0.15) 0%, rgba(216, 185, 255, 0.05) 50%, rgba(19, 19, 19, 0) 100%)',
        }}
      ></div>

      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          {/* System Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/15">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-[0.2em] font-label text-on-surface-variant">
              System Status: Optimal
            </span>
          </div>

          {/* Hero Title */}
          <div>
            <h2 className="text-on-surface-variant font-headline text-lg md:text-xl tracking-wide uppercase opacity-80">
              DevOps & Cloud Enthusiast
            </h2>
            <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter leading-none mt-2 text-on-surface">
              Dashintha <br />{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-tertiary">
                Jayawardana
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="font-body text-on-surface-variant text-lg md:text-xl max-w-xl leading-relaxed">
            Architecting high-performance, cloud-native infrastructures. I bridge the gap between
            complex code and scalable deployment, ensuring your digital assets are resilient and
            ready for the future.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="bg-gradient-to-br from-primary to-secondary text-on-primary px-8 py-4 rounded-md font-bold tracking-tight hover:shadow-[0_0_20px_rgba(164,230,255,0.3)] transition-all flex items-center gap-2">
              View Projects
              <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </button>
            <button className="bg-transparent border border-outline-variant/30 hover:bg-surface-container-highest px-8 py-4 rounded-md font-bold tracking-tight transition-all text-on-surface">
              About My Stack
            </button>
          </div>
        </div>

        {/* Right Side - Availability Card */}
        <div className="hidden md:block relative">
          <div className="aspect-square w-full max-w-md mx-auto relative">
            <div className="absolute inset-0 bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden">
              <img
                className="w-full h-full object-cover mix-blend-overlay opacity-100"
                alt="Dashintha's profile"
                src="/images/profile.png"
              />
            </div>
            <div className="absolute -top-4 -right-4 p-6 bg-surface-container-high border border-outline-variant/20 rounded-xl shadow-2xl">
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
                <div className="h-full bg-primary w-4/5"></div>
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
    <section className="px-6 md:px-12 py-32 bg-surface-container-low">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl">
            <span className="text-primary font-label text-xs tracking-[0.3em] uppercase">
              Architecture Focus
            </span>
            <h3 className="font-headline text-4xl md:text-5xl font-bold mt-4 tracking-tight">
              Full-Stack Thinking, <br /> DevOps Execution.
            </h3>
          </div>
          <p className="font-body text-on-surface-variant max-w-md pb-2">
            My approach focuses on creating automated, self-healing systems that allow developers to
            focus on features while I handle the invisible strength of the infrastructure.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Automation First Strategy */}
          <div className="md:col-span-2 bg-surface-container rounded-xl p-10 border border-outline-variant/10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 h-[2px] w-24 bg-primary"></div>
            <div className="relative z-10 space-y-4">
              <span className="material-symbols-outlined text-4xl text-primary">
                developer_mode
              </span>
              <h4 className="font-headline text-2xl font-bold">Automation First Strategy</h4>
              <p className="text-on-surface-variant leading-relaxed max-w-lg">
                Specialist in CI/CD pipelines that do more than just build. I integrate security
                scanning, performance auditing, and automated rollback strategies into every
                deployment cycle.
              </p>
            </div>
            <div className="mt-8 flex gap-3 flex-wrap">
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
          <div className="bg-surface-container rounded-xl p-10 border border-outline-variant/10 relative overflow-hidden flex flex-col justify-between group">
            <div className="space-y-4">
              <h4 className="font-headline text-2xl font-bold">Cloud Native</h4>
              <p className="text-on-surface-variant text-sm">
                Designing systems that leverage the full potential of distributed cloud
                environments.
              </p>
            </div>
            <div className="pt-8">
              <img
                className="w-full h-32 object-cover mix-blend-overlay opacity-40 grayscale group-hover:opacity-100 group-hover:grayscale-0 transition-all"
                alt="Digital globe"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ5VQhabgGTqrV1RPiFMj_0TBgNIFbMVAaDpPfTmjzb7RJnlQS8hJln19uSkAJiQpbZx9f-6xFD15Q-pSCF7Adc0Oe08TJzFB8sirKmPXCpFb52a6ItlF_s6wJhm8udxl3vLpvf0iuR_dzaIZPUhHC0kXzx7v-PdvpaiAQUlphCG61K86PssqRbKoAos5EmAoA3F9lsAdZkGDsaIfWAZO3FOMny4ci7cJhMQ5p-LAOa8-c80gHxDTw53HS3kut583P8bJ3ILM4uf1L"
              />
            </div>
          </div>

          {/* Years Experience */}
          <div className="bg-surface-container rounded-xl p-10 border border-outline-variant/10 flex flex-col justify-center items-center text-center">
            <div className="text-5xl font-headline font-bold text-primary mb-2">5+</div>
            <div className="text-xs uppercase font-label tracking-widest text-on-surface-variant">
              Years Experience
            </div>
          </div>

          {/* Scalable Architecture */}
          <div className="md:col-span-2 bg-gradient-to-br from-surface-container to-surface-container-highest rounded-xl p-10 border border-outline-variant/10 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1 space-y-4">
              <h4 className="font-headline text-2xl font-bold">Scalable Architecture</h4>
              <p className="text-on-surface-variant">
                From monolithic migration to microservices, I ensure zero-downtime transitions and
                cost-effective resource allocation.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="w-24 h-24 bg-surface-container-lowest rounded flex items-center justify-center border border-outline-variant/10">
                <span className="material-symbols-outlined text-3xl opacity-50">hub</span>
              </div>
              <div className="w-24 h-24 bg-surface-container-lowest rounded flex items-center justify-center border border-outline-variant/10">
                <span className="material-symbols-outlined text-3xl opacity-50">monitoring</span>
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
    <section className="py-32 px-6 overflow-hidden relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <TechStackHeader />
        <TechStackGrid />
      </div>
      {/* Decorative Background Text */}
      <div className="absolute -bottom-10 left-0 w-full whitespace-nowrap overflow-hidden -z-10 select-none pointer-events-none opacity-[0.03]">
        <span className="text-[20rem] font-headline font-bold leading-none">
          INFRASTRUCTURE INFRASTRUCTURE INFRASTRUCTURE
        </span>
      </div>
    </section>
  );
}

function TechStackHeader() {
  return (
    <div className="flex flex-col items-center text-center mb-16">
      <h2 className="font-headline text-5xl md:text-7xl font-bold tracking-tighter mb-6">
        Built for the <br /> <span className="text-secondary italic">Modern Web.</span>
      </h2>
      <p className="text-on-surface-variant max-w-xl font-body leading-relaxed">
        My stack is selected for speed, reliability, and developer experience. Every tool serves a
        purpose in the delivery pipeline.
      </p>
    </div>
  );
}

function TechStackGrid() {
  return (
    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:opacity-100 transition-all duration-700">
      {techStackData.map((tech) => (
        <div key={tech.label} className="flex items-center gap-2 font-headline font-bold text-xl">
          <span className="material-symbols-outlined text-primary">{tech.icon}</span> {tech.label}
        </div>
      ))}
    </div>
  );
}

// ========== FOOTER SECTION ==========
function Footer() {
  return (
    <footer className="bg-zinc-950 w-full py-12 border-t border-zinc-900">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
        <div className="text-zinc-500 font-['Inter'] text-xs tracking-widest uppercase">
          © 2024 Digital Architect. Built for the Cloud.
        </div>
        <div className="flex gap-8">
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
        <div className="flex items-center gap-2 text-zinc-500 font-['Inter'] text-xs tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
          Status: Deployment Active
        </div>
      </div>
    </footer>
  );
}
