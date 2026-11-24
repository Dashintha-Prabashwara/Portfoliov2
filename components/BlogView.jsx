'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

export default function BlogView({ initialBlogs = [], initialCategories = [] }) {
  const [blogs] = useState(initialBlogs);
  const [categories] = useState(initialCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories list from CMS or dynamic fallback
  const categoriesList = useMemo(() => {
    if (categories && categories.length > 0) {
      return ['All', ...categories.map((c) => c.name)];
    }
    const set = new Set();
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return ['All', ...Array.from(set)];
  }, [categories, blogs]);

  // Filtered and searched blogs
  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        (blog.category && blog.category.toLowerCase() === selectedCategory.toLowerCase());

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const titleMatch = blog.title?.toLowerCase().includes(q);
      const excerptMatch = blog.excerpt?.toLowerCase().includes(q);
      const contentMatch = blog.content?.toLowerCase().includes(q);
      const categoryMatch = blog.category?.toLowerCase().includes(q);
      const tagsMatch = Array.isArray(blog.tags) && blog.tags.some((t) => t.toLowerCase().includes(q));
      const expMatch = blog.linkedExperienceTitle?.toLowerCase().includes(q);
      const projMatch = blog.linkedProjectTitle?.toLowerCase().includes(q);

      return (
        titleMatch ||
        excerptMatch ||
        contentMatch ||
        categoryMatch ||
        tagsMatch ||
        expMatch ||
        projMatch
      );
    });
  }, [blogs, selectedCategory, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <>
      {/* Search & Category Filter Controls */}
      <section className="mb-10 sm:mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-6 border-b border-outline-variant/15">
          {/* Live Search Input */}
          <div className="relative w-full md:w-80 lg:w-96">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics, experiences..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant/60 font-body text-xs sm:text-sm focus:outline-none focus:border-primary transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                aria-label="Clear search"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Results Summary */}
          <div className="flex items-center gap-2 text-xs font-mono text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>
              Showing <strong className="text-on-surface">{filteredBlogs.length}</strong>{' '}
              {filteredBlogs.length === 1 ? 'article' : 'articles'}
            </span>
          </div>
        </div>

        {/* Category Filter Chips */}
        {categoriesList.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
            {categoriesList.map((category) => {
              const isSelected = selectedCategory.toLowerCase() === category.toLowerCase();
              const count =
                category === 'All'
                  ? blogs.length
                  : blogs.filter((b) => b.category?.toLowerCase() === category.toLowerCase()).length;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-headline font-bold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-primary text-on-primary shadow-sm ring-1 ring-primary'
                      : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/30'
                  }`}
                >
                  <span>{category}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isSelected
                        ? 'bg-black/20 text-on-primary'
                        : 'bg-surface-container-low text-on-surface-variant/70'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Blog Cards Grid */}
      {filteredBlogs.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-outline-variant/30 rounded-2xl bg-surface-container-low/50">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/40 mb-3 block">
            article
          </span>
          <h2 className="font-headline text-lg font-bold text-on-surface mb-1">
            No articles match your search
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-sm mx-auto mb-6">
            Try adjusting your query or resetting the category filter.
          </p>
          {(searchQuery || selectedCategory !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-headline text-xs font-bold uppercase tracking-wider border border-outline-variant/30 transition-colors"
            >
              <span>Reset Filters</span>
              <span className="material-symbols-outlined text-sm">refresh</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredBlogs.map((blog, index) => {
            const barGradient =
              blog.color === 'secondary'
                ? 'from-secondary to-secondary'
                : blog.color === 'tertiary'
                  ? 'from-tertiary to-tertiary'
                  : 'from-primary to-primary';

            return (
              <article
                key={blog._id || blog.id || index}
                style={{ animationDelay: `${index * 70}ms` }}
                className="group relative flex flex-col bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 hover:border-primary/40 rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md animate-slide-in-left"
              >
                {/* Top Accent Strip */}
                <div
                  className={`w-12 h-1 rounded-full mb-5 bg-gradient-to-r ${barGradient} transition-all duration-300 group-hover:w-20`}
                />

                {/* Meta Header: Read Time & Published Date (NO Category) */}
                <div className="flex items-center justify-between gap-2 mb-3.5 text-[11px] font-mono text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">schedule</span>
                    {blog.readTime || '5 min read'}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                    {formatDate(blog.publishedAt)}
                  </span>
                </div>

                {/* Article Title: Links to Standalone Page in New Tab */}
                <Link
                  href={`/blog/${blog.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-headline text-lg sm:text-xl font-bold text-on-surface tracking-tight mb-2.5 hover:text-primary transition-colors leading-snug block"
                >
                  {blog.title}
                </Link>

                {/* Excerpt */}
                <p className="text-on-surface-variant font-light text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                  {blog.excerpt}
                </p>

                {/* Down Position: Linked Experience or Project Badge with Small Icon */}
                {(blog.linkedExperienceId || blog.linkedProjectId) && (
                  <div className="mb-3.5">
                    {blog.linkedExperienceId && (
                      <Link
                        href="/experience"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-secondary/10 text-secondary border border-secondary/25 hover:bg-secondary/20 transition-colors max-w-full"
                        title={blog.linkedExperienceTitle || 'Work Experience'}
                      >
                        <span className="material-symbols-outlined text-[12px] shrink-0 text-secondary">
                          work
                        </span>
                        <span className="truncate">{blog.linkedExperienceTitle || 'Experience'}</span>
                      </Link>
                    )}
                    {blog.linkedProjectId && (
                      <Link
                        href="/projects"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-tertiary/10 text-tertiary border border-tertiary/25 hover:bg-tertiary/20 transition-colors max-w-full"
                        title={blog.linkedProjectTitle || 'Project Story'}
                      >
                        <span className="material-symbols-outlined text-[12px] shrink-0 text-tertiary">
                          rocket_launch
                        </span>
                        <span className="truncate">{blog.linkedProjectTitle || 'Project'}</span>
                      </Link>
                    )}
                  </div>
                )}

                {/* Tags */}
                {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {blog.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-surface-container-high/80 text-on-surface-variant border border-outline-variant/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Card Action: Loads to Seperate Tab (target="_blank") */}
                <div className="pt-4 border-t border-outline-variant/15 flex items-center justify-between mt-auto">
                  <Link
                    href={`/blog/${blog.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-headline font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors group-hover:underline"
                  >
                    <span>Read Article</span>
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </Link>

                  <span className="text-[11px] font-mono text-on-surface-variant/70">
                    {blog.author || 'Dashintha Jayawardana'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Bottom CTA Section */}
      <section className="mt-24 sm:mt-32 md:mt-40 relative overflow-hidden">
        <div className="glass-panel p-6 sm:p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-8 sm:gap-12 border border-outline-variant/10 rounded-xl">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-4 sm:mb-6 leading-none text-on-surface">
              Interested in discussing <span className="text-primary italic">architecture?</span>
            </h2>
            <p className="text-on-surface-variant font-light mb-6 sm:mb-8 text-sm sm:text-base">
              Whether you&apos;d like to collaborate on distributed systems, review cloud architectures, or discuss engineering practices, let&apos;s talk.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface font-headline text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
            >
              <span>Get in Touch</span>
              <span className="material-symbols-outlined text-sm text-primary">mail</span>
            </Link>
          </div>
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 shrink-0 flex items-center justify-center">
            <div className="w-full h-full border border-outline-variant/30 rounded-full flex items-center justify-center relative z-10 overflow-hidden">
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,84,30,0.32)_0%,rgba(217,84,30,0.12)_45%,transparent_75%)] animate-spread-glow pointer-events-none" />
              <div className="absolute inset-2 rounded-full border border-primary/25 animate-ripple-ring pointer-events-none" />
              <div className="absolute inset-2 rounded-full border border-primary/20 animate-ripple-ring pointer-events-none [animation-delay:1.75s]" />
              <span className="material-symbols-outlined text-6xl sm:text-8xl text-primary drop-shadow-[0_0_24px_rgba(217,84,30,0.5)] relative z-20 transition-transform duration-500 hover:scale-110">
                terminal
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
