'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoadingScreen from './LoadingScreen';

function getLoadingLabel(pathname) {
  if (pathname === '/') return 'portfolio';
  const section = pathname.split('/')[1] || 'portfolio';
  return section.charAt(0).toUpperCase() + section.slice(1);
}

export default function PageLoadingGate({ children }) {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const loadingLabel = getLoadingLabel(pathname);

  useEffect(() => {
    let cancelled = false;
    const revealPage = async () => {
      const dataReady = pathname === '/experience'
        ? new Promise((resolve) => window.addEventListener('experience-ready', resolve, { once: true }))
        : Promise.resolve();

      await (pathname === '/experience'
        ? Promise.race([
            dataReady,
            new Promise((resolve) => window.setTimeout(resolve, 5000)),
          ])
        : new Promise((resolve) => window.setTimeout(resolve, 700)));

      await new Promise((resolve) => requestAnimationFrame(resolve));

      if (!cancelled) {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    revealPage();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <>
      <div style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
        {children}
      </div>
      {isLoading && <LoadingScreen label={loadingLabel} />}
    </>
  );
}