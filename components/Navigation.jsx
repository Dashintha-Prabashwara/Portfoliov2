'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import CVDownloadButton from './CVDownloadButton';

const NAV_LINKS = [
  { href: '/', label: 'Home', id: 'home' },
  { href: '/skills', label: 'Skills', id: 'skills' },
  { href: '/experience', label: 'Experience', id: 'experience' },
  { href: '/projects', label: 'Projects', id: 'projects' },
  { href: '/certifications', label: 'Certifications', id: 'certifications' },
  { href: '/contact', label: 'Contact', id: 'contact' },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    if (href.startsWith('/#')) return false;
    return pathname.startsWith(href);
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 w-full z-50 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800/50">
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-lg sm:text-xl font-bold tracking-tighter text-zinc-100 font-headline hover:text-cyan-400 transition-colors">
          Dashintha
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <a
                key={link.id}
                href={link.href}
                className={`font-headline tracking-tight text-xs sm:text-sm uppercase transition-colors ${
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

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-on-surface hover:text-primary transition-colors"
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          <span className="material-symbols-outlined text-xl sm:text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="md:hidden bg-zinc-900/95 border-t border-zinc-800/50 px-4 sm:px-6 py-4">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={closeMobileMenu}
                  className={`font-headline tracking-tight text-sm uppercase transition-colors ${
                    active
                      ? 'text-cyan-400 font-bold'
                      : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="pt-4 border-t border-zinc-800/50">
              <CVDownloadButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
