import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import GithubTelemetry from '@/components/GithubTelemetry';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'GitHub Telemetry | Dashintha Jayawardana',
  description:
    'Live GitHub engineering telemetry, 52-week contribution activity, language distribution, earned achievements, and organizations for Dashintha Jayawardana.',
};

export default function GithubPage() {
  return (
    <>
      <Navigation />
      <main className="pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Page Hero matching other section design principles */}
        <header className="relative mb-12 sm:mb-16 md:mb-20">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 sm:mb-6 leading-tight">
            <span className="text-on-surface">Engineering</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
              Telemetry &amp; Activity.
            </span>
          </h1>
          <p className="max-w-2xl text-on-surface-variant text-sm sm:text-base md:text-lg lg:text-xl font-light leading-relaxed">
            A real-time overview of open source contributions, 52-week activity matrices, language distribution across personal and contributed repositories, verified badges, and organizations.
          </p>
        </header>

        {/* Live Telemetry Component */}
        <GithubTelemetry />

        {/* Bottom CTA Section */}
        <section className="mt-20 sm:mt-24 md:mt-32 relative overflow-hidden">
          <div className="glass-panel p-6 sm:p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12 border border-outline-variant/10 rounded-xl">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 sm:mb-6 leading-none text-on-surface">
                Ready to build <span className="text-primary italic">together?</span>
              </h2>
              <p className="text-on-surface-variant font-light mb-6 sm:mb-8 text-sm sm:text-base">
                Explore interactive project showcases or reach out directly to discuss infrastructure, deployments, and full-stack software.
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-headline text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                >
                  <span>View Projects</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-headline text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <span>Get in Touch</span>
                  <span className="material-symbols-outlined text-sm text-primary">mail</span>
                </Link>
              </div>
            </div>
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 shrink-0 flex items-center justify-center">
              <div className="w-full h-full border border-outline-variant/30 rounded-full flex items-center justify-center relative z-10 bg-[radial-gradient(circle_at_center,rgba(217,84,30,0.18)_0%,rgba(217,84,30,0.06)_45%,transparent_72%)]">
                <span className="material-symbols-outlined text-6xl sm:text-8xl text-primary/70 drop-shadow-[0_0_20px_rgba(217,84,30,0.35)]">
                  terminal
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
