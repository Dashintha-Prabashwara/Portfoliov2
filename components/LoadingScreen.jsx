export default function LoadingScreen({ label = 'portfolio' }) {
  return (
    <main className="fixed inset-0 z-[100] min-h-screen bg-surface flex items-center justify-center px-6" aria-busy="true" aria-live="polite">
      <div className="text-center">
        <div className="loading-bars" aria-hidden="true">
          <span className="loading-bar loading-bar-1"></span>
          <span className="loading-bar loading-bar-2"></span>
          <span className="loading-bar loading-bar-3"></span>
          <span className="loading-bar loading-bar-4"></span>
          <span className="loading-bar loading-bar-5"></span>
        </div>
        <p className="font-headline text-xs uppercase tracking-[0.25em] text-on-surface-variant">
          Loading {label}
        </p>
      </div>
      <span className="sr-only">Loading page content</span>
    </main>
  );
}