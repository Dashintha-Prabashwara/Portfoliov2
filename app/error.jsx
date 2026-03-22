'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service like Sentry
      console.error('App Error:', error);
    } else {
      console.error('Error:', error);
    }
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="material-symbols-outlined text-7xl text-error opacity-40">
            error_outline
          </span>
        </div>
        <h1 className="font-headline text-4xl font-bold mb-4 text-on-surface">
          Something went wrong
        </h1>
        <p className="text-on-surface-variant mb-8 leading-relaxed">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>
        <button
          onClick={() => reset()}
          className="bg-gradient-to-r from-primary to-secondary text-on-primary px-6 py-3 rounded-md font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
