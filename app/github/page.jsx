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
        {/* Page Hero */}
        <section className="mb-10 sm:mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/25">
              Open Source &amp; DevOps
            </span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-outline-variant/20">
            <div>
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-on-surface">
                GitHub Telemetry
              </h1>
              <p className="mt-2 text-sm sm:text-base text-on-surface-variant max-w-2xl font-body">
                Live engineering activity, 52-week contribution matrices, language distribution across personal and contributed codebases, verified achievements, and organization memberships.
              </p>
            </div>

            <a
              href="https://github.com/Dashintha-Prabashwara"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 hover:border-primary/40 text-on-surface font-headline text-xs font-bold uppercase tracking-wider transition-all self-start md:self-auto shrink-0 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm text-primary">terminal</span>
              <span>GitHub Profile</span>
              <span className="material-symbols-outlined text-xs">arrow_outward</span>
            </a>
          </div>
        </section>

        {/* Live Telemetry Component */}
        <GithubTelemetry />

        {/* Bottom CTA Section */}
        <section className="mt-12 p-8 sm:p-12 rounded-2xl bg-surface-container-low border border-outline-variant/25 text-center relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-primary font-bold">
              <span className="material-symbols-outlined text-base">code</span>
              Collaborate &amp; Build
            </span>
            <h3 className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
              Explore Featured Projects
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant font-body">
              Browse interactive showcases, case studies, and live production deployments powered by modern cloud and DevOps practices.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-headline text-xs font-bold uppercase tracking-wider transition-all shadow-md"
              >
                <span>View Projects</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-headline text-xs font-bold uppercase tracking-wider transition-all"
              >
                <span>Get in Touch</span>
                <span className="material-symbols-outlined text-sm">mail</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
