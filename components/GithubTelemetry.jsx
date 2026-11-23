'use client';

import React, { useState, useEffect } from 'react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function GithubTelemetry({ initialData = null, initialConfig = null }) {
  const [telemetry, setTelemetry] = useState(initialData);
  const [config, setConfig] = useState(initialConfig);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/github');
        const json = await res.json();
        if (json.isEnabled === false) {
          setConfig({ isEnabled: false });
          return;
        }
        if (json.data) {
          setTelemetry(json.data);
          setConfig(json.config);
        }
      } catch (err) {
        console.error('Failed to load GitHub telemetry:', err);
        setError('Unable to fetch live telemetry');
      } finally {
        setLoading(false);
      }
    }

    if (!initialData) {
      loadData();
    }
  }, [initialData]);

  if (config?.isEnabled === false) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-8 my-12 animate-pulse">
        <div className="h-6 bg-surface-container-high rounded w-48 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-surface-container-high/60 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !telemetry) {
    return null;
  }

  const {
    profile,
    languages = [],
    organizations = [],
    contributions,
    achievements = [],
    highlights = [],
  } = telemetry;
  const username = config?.username || profile?.login || 'Dashintha-Prabashwara';

  // Subcomponent filters based on CMS configuration
  const visibleLanguages = languages.filter(
    (l) => !(config?.hiddenLanguages || []).includes(l.name)
  );
  const visibleOrganizations = organizations.filter(
    (o) =>
      !(config?.hiddenOrganizations || []).includes(o.login) &&
      !(config?.hiddenOrganizations || []).includes(o.name)
  );
  const visibleAchievements = achievements.filter(
    (a) => !(config?.hiddenAchievements || []).includes(a.title)
  );
  const visibleHighlights = highlights.filter(
    (h) => !(config?.hiddenHighlights || []).includes(h.title)
  );

  return (
    <section className="my-16 sm:my-24 relative overflow-hidden">
      <div className="border border-outline-variant/30 bg-surface-container-low/70 backdrop-blur-sm rounded-2xl p-6 sm:p-10 transition-all hover:border-outline-variant/60">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-outline-variant/20 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase bg-primary/10 text-primary border border-primary/25">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Live GitHub Sync
              </span>
              <span className="text-on-surface-variant text-xs font-mono">
                @{username}
              </span>
              <span className="text-[10px] font-mono text-on-surface-variant/70 border-l border-outline-variant/30 pl-2">
                Auto-syncs every 2 hours
              </span>
            </div>
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
              Engineering Telemetry
            </h2>
          </div>

          <a
            href={profile?.htmlUrl || `https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-high border border-outline-variant/30 hover:border-primary/40 text-on-surface text-xs font-bold uppercase tracking-wider transition-all"
          >
            <span className="material-symbols-outlined text-sm text-primary">terminal</span>
            GitHub Profile
            <span className="material-symbols-outlined text-xs transition-transform group-hover:translate-x-0.5">
              arrow_outward
            </span>
          </a>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">
                Repositories
              </span>
              <span className="material-symbols-outlined text-primary text-lg">folder_open</span>
            </div>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
              {profile?.publicRepos ?? 0}
            </div>
            <span className="text-[10px] text-on-surface-variant font-mono">Public codebases</span>
          </div>

          <div className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">
                Total Stars
              </span>
              <span className="material-symbols-outlined text-secondary text-lg">star</span>
            </div>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
              {profile?.totalStars ?? 0}
            </div>
            <span className="text-[10px] text-on-surface-variant font-mono">Stargazers earned</span>
          </div>

          <div className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">
                Forks
              </span>
              <span className="material-symbols-outlined text-tertiary text-lg">call_split</span>
            </div>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
              {profile?.totalForks ?? 0}
            </div>
            <span className="text-[10px] text-on-surface-variant font-mono">Repository forks</span>
          </div>

          <div className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-label uppercase tracking-widest text-on-surface-variant">
                Contributions
              </span>
              <span className="material-symbols-outlined text-primary text-lg">deployed_code</span>
            </div>
            <div className="font-headline text-2xl sm:text-3xl font-bold text-on-surface">
              {contributions?.totalContributions ?? 0}
            </div>
            <span className="text-[10px] text-on-surface-variant font-mono">Annual commits & events</span>
          </div>
        </div>

        {/* Contribution Calendar Graph */}
        {config?.showContributions !== false && contributions?.weeks?.length > 0 && (
          <div className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-5 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
                <h3 className="font-headline text-sm sm:text-base font-bold text-on-surface uppercase tracking-wider">
                  Contribution Activity Graph
                </h3>
              </div>
              <span className="text-xs font-mono text-on-surface-variant">
                {contributions.totalContributions} contributions in the last year
              </span>
            </div>

            {/* Matrix Container with Horizontal Scroll */}
            <div className="overflow-x-auto pb-2 scrollbar-thin">
              <div className="inline-block min-w-[720px] w-full">
                {/* Month labels */}
                <div className="flex pl-8 text-[10px] text-on-surface-variant font-mono mb-1.5 h-3">
                  {contributions.weeks.map((week, wIdx) => {
                    const firstDay = week.contributionDays?.[0]?.date;
                    const prevFirstDay = wIdx > 0 ? contributions.weeks[wIdx - 1]?.contributionDays?.[0]?.date : null;
                    const month = firstDay ? new Date(firstDay).getMonth() : null;
                    const prevMonth = prevFirstDay ? new Date(prevFirstDay).getMonth() : null;
                    const isNewMonth = month !== null && month !== prevMonth;

                    return (
                      <div key={wIdx} className="flex-1 text-left overflow-visible whitespace-nowrap">
                        {isNewMonth && MONTH_NAMES[month]}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  {/* Weekday labels */}
                  <div className="flex flex-col justify-between text-[10px] text-on-surface-variant font-mono pr-1 py-[2px] h-[98px] select-none">
                    <span></span>
                    <span>Mon</span>
                    <span></span>
                    <span>Wed</span>
                    <span></span>
                    <span>Fri</span>
                    <span></span>
                  </div>

                  {/* Weeks grid */}
                  <div className="flex gap-[3px] flex-1">
                    {contributions.weeks.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[3px] flex-1">
                        {week.contributionDays.map((day, dIdx) => {
                          const count = day.contributionCount || 0;
                          let colorClass = 'bg-surface-container-highest/40';
                          if (count > 0 && count <= 2) colorClass = 'bg-[#196127]/60';
                          else if (count > 2 && count <= 5) colorClass = 'bg-[#239a3b]';
                          else if (count > 5 && count <= 8) colorClass = 'bg-[#7bc96f]';
                          else if (count > 8) colorClass = 'bg-[#39d353]';

                          return (
                            <div
                              key={dIdx}
                              title={`${day.date}: ${count} contribution${count === 1 ? '' : 's'}`}
                              className={`w-full aspect-square rounded-[2px] transition-all duration-150 hover:scale-125 hover:z-10 cursor-pointer ${colorClass}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graph Footer Legend */}
                <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-mono mt-3 pt-2 border-t border-outline-variant/10">
                  <span>Learn how GitHub counts contributions</span>
                  <div className="flex items-center gap-1.5">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-surface-container-highest/40"></span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#196127]/60"></span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#239a3b]"></span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#7bc96f]"></span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#39d353]"></span>
                    <span>More</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Language Breakdown */}
        {config?.showLanguageStats !== false && visibleLanguages.length > 0 && (
          <div className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-5 sm:p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-secondary">code</span>
                <h3 className="font-headline text-sm sm:text-base font-bold text-on-surface uppercase tracking-wider">
                  Top Technologies & Languages
                </h3>
              </div>
              <span className="text-xs font-mono text-on-surface-variant">Public &amp; Private Repositories</span>
            </div>

            {/* Segmented Distribution Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-surface-container-highest mb-4">
              {visibleLanguages.map((lang, idx) => {
                const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-primary-container', 'bg-outline'];
                return (
                  <div
                    key={lang.name}
                    style={{ width: `${lang.percentage}%` }}
                    className={`${colors[idx % colors.length]} transition-all`}
                    title={`${lang.name}: ${lang.percentage}%`}
                  />
                );
              })}
            </div>

            {/* Legend Chips */}
            <div className="flex flex-wrap gap-3">
              {visibleLanguages.map((lang, idx) => {
                const dotColors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-primary-container', 'bg-outline'];
                return (
                  <div key={lang.name} className="flex items-center gap-1.5 text-xs font-mono text-on-surface">
                    <span className={`w-2 h-2 rounded-full ${dotColors[idx % dotColors.length]}`}></span>
                    <span>{lang.name}</span>
                    <span className="text-on-surface-variant/70">({lang.percentage}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Highlights, Organizations & Achievements Row */}
        {(config?.showOrganizations !== false && visibleOrganizations.length > 0 ||
          config?.showAchievements !== false && visibleAchievements.length > 0 ||
          config?.showHighlights !== false && visibleHighlights.length > 0) && (
            <div className="space-y-6">
              {/* Profile Highlights Banner if available */}
              {config?.showHighlights !== false && visibleHighlights.length > 0 && (
                <div className="bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-secondary">workspace_premium</span>
                      <h3 className="font-headline text-sm sm:text-base font-bold text-on-surface uppercase tracking-wider">
                        Profile Highlights
                      </h3>
                    </div>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      Official Recognition
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {visibleHighlights.map((hl, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:border-secondary/30 transition-all"
                      >
                        <div className="w-9 h-9 rounded-md bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-base">verified</span>
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-headline text-xs font-bold text-on-surface flex items-center gap-1.5">
                            <span>{hl.title}</span>
                            {hl.badge && (
                              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-secondary/15 text-secondary border border-secondary/30">
                                {hl.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-on-surface-variant font-mono line-clamp-1 mt-0.5">
                            {hl.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizations and Achievements Grid */}
              <div className={`grid grid-cols-1 ${config?.showOrganizations !== false && visibleOrganizations.length > 0 && config?.showAchievements !== false && visibleAchievements.length > 0 ? 'md:grid-cols-2' : ''} gap-6`}>
                {/* Organizations */}
                {config?.showOrganizations !== false && visibleOrganizations.length > 0 && (
                  <div className={`bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-5 sm:p-6 ${config?.showAchievements === false || visibleAchievements.length === 0 ? 'md:col-span-2' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-primary">domain</span>
                        <h3 className="font-headline text-sm sm:text-base font-bold text-on-surface uppercase tracking-wider">
                          Organizations
                        </h3>
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        {visibleOrganizations.length} {visibleOrganizations.length === 1 ? 'Membership' : 'Memberships'}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {visibleOrganizations.map((org) => (
                        <a
                          key={org.login}
                          href={org.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-3 p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-all border border-outline-variant/20 hover:border-primary/30"
                        >
                          <img
                            src={org.avatarUrl}
                            alt={org.name}
                            className="w-9 h-9 rounded-md object-cover border border-outline-variant/20 shrink-0"
                          />
                          <div className="overflow-hidden flex-1">
                            <div className="font-headline text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                              {org.name}
                            </div>
                            <span className="text-[10px] text-on-surface-variant font-mono block truncate">
                              {org.description || 'GitHub Member'}
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-xs text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                            arrow_outward
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Achievements & Badges */}
                {config?.showAchievements !== false && visibleAchievements.length > 0 && (
                  <div className={`bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl p-5 sm:p-6 ${config?.showOrganizations === false || visibleOrganizations.length === 0 ? 'md:col-span-2' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-tertiary">military_tech</span>
                        <h3 className="font-headline text-sm sm:text-base font-bold text-on-surface uppercase tracking-wider">
                          Earned Achievements
                        </h3>
                      </div>
                      <span className="text-[10px] text-on-surface-variant font-mono">
                        Verified Badges
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {visibleAchievements.map((ach, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:border-tertiary/30 transition-all"
                        >
                          <img
                            src={ach.iconUrl}
                            alt={ach.title}
                            className="w-11 h-11 object-contain shrink-0"
                          />
                          <div className="overflow-hidden">
                            <div className="font-headline text-xs font-bold text-on-surface flex items-center gap-1.5 flex-wrap">
                              <span>{ach.title}</span>
                              {ach.tier && (
                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-tertiary/10 text-tertiary border border-tertiary/20">
                                  {ach.tier}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-on-surface-variant font-mono line-clamp-1 mt-0.5">
                              {ach.description || 'GitHub Achievement'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </section>
  );
}
