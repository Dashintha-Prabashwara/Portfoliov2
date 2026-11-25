import Link from 'next/link';
import { SOCIAL_LINKS } from '@/lib/constants';

export default function Footer({ className = '' }) {
  return (
    <footer className={`bg-[#111111] text-[#F3EEE3] w-full py-8 sm:py-12 border-t border-[#111111] ${className}`}>
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-[#F3EEE3]/60 font-body text-xs tracking-widest uppercase text-center sm:text-left">
          © 2026 Dashintha Jayawardana. Built for the Cloud | All Rights Reserved
        </div>
        <div className="flex flex-wrap gap-6 sm:gap-8 justify-center sm:justify-end">
          <Link className="text-[#F3EEE3]/80 hover:text-[#D9541E] transition-colors font-body text-xs tracking-widest uppercase duration-200" href="/github">
            Telemetry
          </Link>
          <Link className="text-[#F3EEE3]/80 hover:text-[#D9541E] transition-colors font-body text-xs tracking-widest uppercase duration-200" href="/blog">
            Blog
          </Link>
          <a className="text-[#F3EEE3]/80 hover:text-[#D9541E] transition-colors font-body text-xs tracking-widest uppercase duration-200" href={SOCIAL_LINKS.github} rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
          <a className="text-[#F3EEE3]/80 hover:text-[#D9541E] transition-colors font-body text-xs tracking-widest uppercase duration-200" href={SOCIAL_LINKS.linkedin} rel="noopener noreferrer" target="_blank">
            LinkedIn
          </a>
          <a className="text-[#F3EEE3]/80 hover:text-[#D9541E] transition-colors font-body text-xs tracking-widest uppercase duration-200" href={`mailto:${SOCIAL_LINKS.email}`}>
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}