'use client';

import Navigation from '@/components/Navigation';
import { SOCIAL_LINKS } from '@/lib/constants';
import { useEffect, useState } from 'react';

export default function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExperiences() {
      try {
        const response = await fetch('/api/experience', { cache: 'no-store' });
        const data = await response.json();
        setExperiences(data);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching experiences:', error);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchExperiences();
  }, []);

  // Leadership data remains static for now
  const leadership = [
    {
      icon: 'admin_panel_settings',
      title: 'Project Co-Chairperson – SkillSprint',
      description:
        'Co-Chairperson for Web3Ceylon – Colombo Edition seminar series, featuring industry speakers on blockchain and Web3 technologies. Empowered students to explore real-world applications of decentralized solutions.',
      period: 'August – September 2025',
      category: 'Web3 Initiative',
      color: 'primary',
    },
    {
      icon: 'trending_up',
      title: 'Project Co-Chairperson – Data Storm 6.0',
      description:
        'Co-Chairperson for inter-university data analytics competition with webinars and masterclasses. Delivered industry mentoring for real-world problem-solving using cutting-edge data technologies.',
      period: 'March – June 2025',
      category: 'Data Competition',
      color: 'secondary',
    },
    {
      icon: 'code',
      title: 'Project Co-Chairperson – Devthon 2.0',
      description:
        'Spearheaded three-phase web competition (Ideathon, Designathon, Devthon). Guided students through ideation, UI/UX design, and full-stack development with hands-on skill building.',
      period: 'January – April 2025',
      category: 'Web Competition',
      color: 'tertiary',
    },
    {
      icon: 'school',
      title: 'Project Co-Chairperson – Mora TechConnect',
      description:
        'Led 12-month IT educational initiative with bi-weekly sessions on emerging technologies. Delivered webinars via YouTube and culminated in hands-on robotics workshop for practical learning.',
      period: 'July 2024 – February 2025',
      category: 'Tech Education',
      color: 'primary',
    },
  ];

  return (
    <>
      <Navigation />
      <main className="pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Hero Narrative */}
        <section className="mb-20 sm:mb-24 md:mb-32">
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-6 sm:mb-8 max-w-4xl leading-[0.9] text-on-surface">
            Building <span className="text-primary italic">Infrastructure</span> and Learning Along the Way.
          </h1>
          <p className="font-body text-on-surface-variant text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl leading-relaxed">
            My background spans IoT research, full-stack development, and working on various technical initiatives. I'm continuously learning about deployment, automation, and how to build better systems.
          </p>
        </section>

        {/* Experience Timeline Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 mb-32 sm:mb-40 relative">
          <div className="lg:col-span-4">
            <div className="sticky top-32 sm:top-40">
              <span className="font-label text-primary text-xs tracking-[0.2em] uppercase block mb-4">
                The Evolution
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl font-bold mb-6">Career Journey</h2>
              <p className="text-on-surface-variant text-xs sm:text-sm leading-loose">
                Working on real-world projects in research and production environments. Learning about systems design, developing better practices, and building skills in deployment and infrastructure.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8 relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-secondary to-tertiary opacity-20 hidden md:block transform -translate-x-1/2"></div>

            {/* Experience Items */}
            {loading ? (
              <div className="text-center py-12 text-on-surface-variant">Loading experiences...</div>
            ) : experiences.length === 0 ? (
              <div className="text-center py-12 text-on-surface-variant">No experiences found</div>
            ) : (
              experiences.map((exp, index) => {
                const isLeft = index % 2 === 0;
                const colorClass =
                  exp.color === 'primary'
                    ? 'border-primary text-primary bg-primary/10'
                    : exp.color === 'secondary'
                      ? 'border-secondary text-secondary bg-secondary/10'
                      : 'border-tertiary text-tertiary bg-tertiary/10';
                const [borderColor, textColor] = colorClass.split(' ').slice(0, 2);
                const dotColorClass =
                  exp.color === 'primary'
                    ? 'bg-primary shadow-[0_0_15px_rgba(164,230,255,0.6)]'
                    : exp.color === 'secondary'
                      ? 'bg-secondary shadow-[0_0_15px_rgba(216,185,255,0.6)]'
                      : 'bg-tertiary shadow-[0_0_15px_rgba(0,249,190,0.6)]';

                return (
                  <div key={exp.id} className="relative mb-16 sm:mb-20 md:mb-24 md:flex items-center justify-between">
                    <div className={`${isLeft ? 'md:w-[45%]' : 'md:w-[45%] md:order-2'} mb-6 sm:mb-8 md:mb-0`}>
                      <div
                        className={`surface-container-low p-4 sm:p-6 md:p-8 rounded-lg text-sm sm:text-base ${isLeft ? 'border-l-4' : 'border-r-4'} ${borderColor} hover:bg-surface-container transition-colors ${
                          isLeft ? '' : 'text-right'
                        }`}
                      >
                        <span className={`font-label text-[10px] ${textColor} mb-3 block tracking-widest`}>
                          {exp.period}
                        </span>
                        <h3 className="font-headline text-lg sm:text-xl font-bold mb-1 text-on-surface">{exp.role}</h3>
                        <p className="text-on-surface-variant text-xs sm:text-sm font-medium mb-4">{exp.company}</p>
                        <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-4">{exp.description}</p>
                        <div className={`flex flex-wrap gap-2 ${isLeft ? '' : 'justify-end'}`}>
                          {exp.tags.map((tag) => (
                            <span key={tag} className="bg-surface-container-high px-2 sm:px-3 py-1 text-[10px] font-label text-on-surface flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-tertiary"></span>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className={`absolute left-0 md:left-1/2 w-4 h-4 ${dotColorClass} rounded-full transform -translate-x-1/2 hidden md:block`}></div>
                    <div className={`${isLeft ? 'md:w-[45%]' : 'md:w-[45%] md:order-1'}`}></div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Leadership Ecosystem Section */}
        <section className="mb-20 sm:mb-24 md:mb-32">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 gap-6">
            <div className="max-w-xl">
              <span className="font-label text-primary text-xs tracking-[0.2em] uppercase block mb-4">
                Community &amp; Learning
              </span>
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Teaching &amp; Mentoring</h2>
            </div>
            <div className="font-body text-on-surface-variant text-xs sm:text-sm italic border-l border-outline-variant/30 pl-4">
              I've been fortunate to help others learn and grow through various initiatives.
            </div>
          </div>

          {/* Leadership Grid - Dynamic Cards with Left-to-Right Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {leadership.map((item, index) => {
              const colorClass =
                item.color === 'primary'
                  ? 'bg-primary'
                  : item.color === 'secondary'
                    ? 'bg-secondary'
                    : 'bg-tertiary';
              const textColorClass =
                item.color === 'primary'
                  ? 'text-primary'
                  : item.color === 'secondary'
                    ? 'text-secondary'
                    : 'text-tertiary';

              return (
                <div
                  key={item.title}
                  className="surface-container-high p-6 sm:p-8 group relative overflow-hidden transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between min-h-[300px] sm:min-h-[320px] animate-in slide-in-from-left fade-in-0"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animationDuration: '600ms',
                    animationFillMode: 'both',
                  }}
                >
                  <div className={`absolute top-0 left-0 w-6 h-[2px] ${colorClass}`}></div>

                  <div>
                    {item.icon && (
                      <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center mb-6 border border-outline-variant/10">
                        <span className={`material-symbols-outlined ${textColorClass}`}>{item.icon}</span>
                      </div>
                    )}
                    {item.period && (
                      <span className={`font-label text-[10px] ${textColorClass} mb-2 block tracking-widest`}>
                        {item.period}
                      </span>
                    )}
                    <h4 className="font-headline text-sm sm:text-lg font-bold mb-4">{item.title}</h4>
                    <p className="text-on-surface-variant text-xs sm:text-sm leading-loose">{item.description}</p>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center">
                    <span className="font-label text-[10px] uppercase tracking-tighter opacity-60">{item.category}</span>
                    <span className={`material-symbols-outlined text-xs ${textColorClass}`}>north_east</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quote Section */}
        <section className="mb-8 sm:mb-12">
          <div className="bg-surface-container-low rounded-xl p-8 sm:p-12 md:p-20 relative overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-64 sm:w-80 h-64 sm:h-80 bg-primary/10 blur-[100px] rounded-full"></div>
            <div className="relative z-10">
              <span
                className="material-symbols-outlined text-5xl sm:text-6xl text-outline-variant/20 absolute -top-10 -left-6"
                aria-hidden="true"
              >
                format_quote
              </span>
              <h3 className="font-headline text-2xl sm:text-3xl md:text-5xl font-bold italic mb-6 sm:mb-8 max-w-3xl">
                &ldquo;Good mentors help you learn from their experience so you don&rsquo;t have to make all the same mistakes. I want to be that person for others.&rdquo;
              </h3>
              <div className="flex items-center gap-4">
                <div className="h-[1px] w-12 bg-primary"></div>
                <span className="font-label text-xs sm:text-sm uppercase tracking-widest text-on-surface-variant">
                  Personal Philosophy
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 w-full py-8 sm:py-12 border-t border-zinc-900">
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center px-4 sm:px-8 max-w-7xl mx-auto">
          <div className="text-zinc-500 font-['Inter'] text-xs tracking-widest uppercase text-center sm:text-left">
            © 2026 Dashintha Jayawardana. Built for the Cloud | All Rights Reserved
          </div>
          <div className="flex gap-6 sm:gap-8 justify-center sm:justify-end">
            <a
              className="text-zinc-500 hover:text-purple-400 transition-colors font-['Inter'] text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200"
              href={SOCIAL_LINKS.github}
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            <a
              className="text-zinc-500 hover:text-purple-400 transition-colors font-['Inter'] text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200"
              href={SOCIAL_LINKS.linkedin}
              rel="noopener noreferrer"
              target="_blank"
            >
              LinkedIn
            </a>
            <a
              className="text-zinc-500 hover:text-purple-400 transition-colors font-['Inter'] text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200"
              href={`mailto:${SOCIAL_LINKS.email}`}
            >
              Email
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
