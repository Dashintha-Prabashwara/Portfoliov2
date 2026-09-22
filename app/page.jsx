import Link from 'next/link';
import Image from 'next/image';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

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
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
        <div className="space-y-6 sm:space-y-8">
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
            <Link href="/projects" className="w-full sm:w-auto bg-gradient-to-br from-primary to-secondary text-on-primary px-6 sm:px-8 py-3 sm:py-4 rounded-md font-bold text-sm sm:text-base tracking-tight hover:shadow-[0_0_20px_rgba(164,230,255,0.3)] transition-all flex items-center justify-center sm:justify-start gap-2">
              View Projects
              <span className="material-symbols-outlined text-sm">arrow_outward</span>
            </Link>
            <Link href="/skills" className="w-full sm:w-auto bg-transparent border border-outline-variant/30 hover:bg-surface-container-highest px-6 sm:px-8 py-3 sm:py-4 rounded-md font-bold text-sm sm:text-base tracking-tight transition-all text-on-surface text-center">
              About My Stack
            </Link>
          </div>
        </div>

        {/* Profile image */}
        <div className="hidden md:flex justify-center">
          <div className="aspect-square w-full max-w-md mx-auto relative">
            <Image
              className="profile-photo w-full h-full object-contain"
              alt="Dashintha's profile"
              src="/images/profile.png"
              width={400}
              height={400}
              priority
            />
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
    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12 opacity-70">
      {techStackData.map((tech) => (
        <div key={tech.label} className="flex items-center gap-2 font-headline font-bold text-sm sm:text-base md:text-xl">
          <span className="material-symbols-outlined text-primary text-sm sm:text-base md:text-lg">{tech.icon}</span> {tech.label}
        </div>
      ))}
    </div>
  );
}

// ========== FOOTER SECTION ==========
