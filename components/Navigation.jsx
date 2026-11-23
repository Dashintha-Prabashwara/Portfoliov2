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
  { href: '/github', label: 'GitHub', id: 'github' },
  { href: '/certifications', label: 'Certifications', id: 'certifications' },
  {
    href: process.env.NEXT_PUBLIC_BLOG_URL || 'https://blog.dashijay.dev',
    label: 'Blog',
    id: 'blog',
    external: true,
  },
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
    <nav className="fixed top-0 w-full z-50 bg-[#F3EEE3]/90 backdrop-blur-md border-b border-[#111111]/10">
      <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto w-full">
        <Link href="/" className="text-lg sm:text-xl font-bold tracking-tighter text-[#111111] font-headline hover:text-[#D9541E] transition-colors">
          Dashintha
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <a
                key={link.id}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                className={`font-headline tracking-tight text-xs sm:text-sm uppercase transition-colors ${
                  active
                    ? 'text-[#D9541E] font-bold border-b-2 border-[#D9541E] pb-1'
                    : 'text-[#555550] hover:text-[#111111]'
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
          className="md:hidden text-[#111111] hover:text-[#D9541E] transition-colors"
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
        <div id="mobile-navigation" className="md:hidden bg-[#F3EEE3]/98 border-t border-[#111111]/10 px-4 sm:px-6 py-4 shadow-lg">
          <div className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <a
                  key={link.id}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  onClick={closeMobileMenu}
                  className={`font-headline tracking-tight text-sm uppercase transition-colors ${
                    active
                      ? 'text-[#D9541E] font-bold'
                      : 'text-[#555550] hover:text-[#111111]'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
            <div className="pt-4 border-t border-[#111111]/10">
              <CVDownloadButton />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
