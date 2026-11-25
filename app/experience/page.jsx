'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Experience() {
  const [experiences, setExperiences] = useState([]);
  const [leadership, setLeadership] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [expRes, leadRes] = await Promise.all([
          fetch('/api/experience', { cache: 'no-store' }),
          fetch('/api/leadership', { cache: 'no-store' }),
        ]);
        const expData = await expRes.json();
        const leadData = await leadRes.json();
        if (Array.isArray(expData)) setExperiences(expData);
        if (Array.isArray(leadData)) setLeadership(leadData);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching experience/leadership data:', error);
        }
      } finally {
        setLoading(false);
        window.dispatchEvent(new Event('experience-ready'));
      }
    }

    fetchData();
  }, []);

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
            My background spans IoT research, full-stack development, and working on various technical initiatives. I&apos;m continuously learning about deployment, automation, and how to build better systems.
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
                    ? 'bg-primary'
                    : exp.color === 'secondary'
                      ? 'bg-secondary'
                      : 'bg-tertiary';

                return (
                  <div key={exp.id} className="relative mb-16 sm:mb-20 md:mb-24 md:flex items-center justify-between">
                    <div className={`${isLeft ? 'md:w-[45%]' : 'md:w-[45%] md:order-2'} mb-6 sm:mb-8 md:mb-0`}>
                      <div
                        className={`bg-surface-container-low p-4 sm:p-6 md:p-8 rounded-lg text-sm sm:text-base ${isLeft ? 'border-l-4' : 'border-r-4'} ${borderColor} hover:bg-surface-container transition-colors ${
                          isLeft ? '' : 'text-right'
                        }`}
                      >
                        <span className={`font-label text-[10px] ${textColor} mb-3 block tracking-widest`}>
                          {exp.period}
                        </span>
                        <h3 className="font-headline text-lg sm:text-xl font-bold mb-1 text-on-surface">{exp.role}</h3>
                        <p className="text-on-surface-variant text-xs sm:text-sm font-medium mb-4">{exp.company}</p>
                        {exp.description && (
                          <p className="text-on-surface-variant text-xs sm:text-sm leading-relaxed mb-4">{exp.description}</p>
                        )}
                        {exp.blogUrl && (
                          <div className={`mb-4 ${isLeft ? '' : 'flex justify-end'}`}>
                            {exp.blogUrl.startsWith('/') ? (
                              <Link
                                href={exp.blogUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                              >
                                <span className="material-symbols-outlined text-sm">article</span>
                                <span>Read Experience Story</span>
                              </Link>
                            ) : (
                              <a
                                href={exp.blogUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                              >
                                <span className="material-symbols-outlined text-sm">article</span>
                                <span>Read Experience Story</span>
                              </a>
                            )}
                          </div>
                        )}
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
              <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Leadership &amp; Knowledge Sharing</h2>
            </div>
            <div className="font-body text-on-surface-variant text-xs sm:text-sm italic border-l border-outline-variant/30 pl-4">
              I&apos;ve been fortunate to help others learn and grow through various initiatives.
            </div>
          </div>

          {/* Leadership Grid - Dynamic Cards with Left-to-Right Animation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {leadership.map((item) => {
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
                  className="bg-surface-container-high p-6 sm:p-8 group relative overflow-hidden transition-colors duration-300 flex flex-col justify-between min-h-[300px] sm:min-h-[320px]"
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
            <div className="relative z-10">
              <span
                className="material-symbols-outlined text-5xl sm:text-6xl text-outline-variant/20 absolute -top-10 -left-6"
                aria-hidden="true"
              >
                format_quote
              </span>
              <h3 className="font-headline text-2xl sm:text-3xl md:text-5xl font-bold italic mb-6 sm:mb-8 max-w-3xl">
                &ldquo;I believe knowledge becomes more valuable when shared, and leadership becomes more meaningful when it helps others grow.&rdquo;
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

      <Footer className="mt-0" />
    </>
  );
}
