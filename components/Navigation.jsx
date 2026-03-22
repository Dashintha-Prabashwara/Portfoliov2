'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CVDownloadButton from './CVDownloadButton';

const NAV_LINKS = [
  { href: '/', label: 'Home', id: 'home' },
  { href: '/skills', label: 'Skills', id: 'skills' },
  { href: '/experience', label: 'Experience', id: 'experience' },
  { href: '/projects', label: 'Projects', id: 'projects' },
  { href: '/contact', label: 'Contact', id: 'contact' },
];

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname.startsWith(href);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-zinc-900/60 backdrop-blur-xl border-b border-zinc-800/50 shadow-2xl shadow-cyan-900/20">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-xl font-bold tracking-tighter text-zinc-100 font-headline hover:text-cyan-400 transition-colors">
          DevOps Architect
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <a
                key={link.id}
                href={link.href}
                className={`font-headline tracking-tight text-sm uppercase transition-colors ${
                  active
                    ? 'text-cyan-400 font-bold border-b-2 border-cyan-400 pb-1'
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {link.label}
              </a>
            );
          })}
          <CVDownloadButton />
        </div>

        <button className="md:hidden text-on-surface">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </nav>
  );
}
