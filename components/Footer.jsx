import { SOCIAL_LINKS } from '@/lib/constants';

export default function Footer({ className = '' }) {
  return (
    <footer className={`bg-zinc-950 w-full py-8 sm:py-12 border-t border-zinc-900 ${className}`}>
      <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-zinc-500 font-body text-xs tracking-widest uppercase text-center sm:text-left">
          © 2026 Dashintha Jayawardana. Built for the Cloud | All Rights Reserved
        </div>
        <div className="flex gap-6 sm:gap-8 justify-center sm:justify-end">
          <a className="text-zinc-500 hover:text-primary transition-colors font-body text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200" href={SOCIAL_LINKS.github} rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
          <a className="text-zinc-500 hover:text-primary transition-colors font-body text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200" href={SOCIAL_LINKS.linkedin} rel="noopener noreferrer" target="_blank">
            LinkedIn
          </a>
          <a className="text-zinc-500 hover:text-primary transition-colors font-body text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200" href={`mailto:${SOCIAL_LINKS.email}`}>
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}