import Link from 'next/link';

export const metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <h1 className="font-headline text-9xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-tertiary">
            404
          </h1>
        </div>
        <h2 className="font-headline text-3xl font-bold mb-4 text-on-surface">
          Page Not Found
        </h2>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist. Let&apos;s get you back on track.
        </p>
        <Link
          href="/"
          className="inline-block bg-gradient-to-r from-primary to-secondary text-on-primary px-6 py-3 rounded-md font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
