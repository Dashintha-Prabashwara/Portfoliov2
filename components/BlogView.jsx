'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

const CATEGORIES = [
  'All',
  'DevOps & CI/CD',
  'Cloud & Database',
  'Architecture',
  'DevSecOps',
  'IoT & Embedded',
];

export default function BlogView({ initialBlogs = [] }) {
  const [blogs] = useState(initialBlogs);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  // Close reader on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveArticle(null);
      }
    };
    if (activeArticle) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeArticle]);

  // Extract all categories dynamically if needed
  const categoriesList = useMemo(() => {
    const set = new Set();
    blogs.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    const customCats = Array.from(set);
    return ['All', ...Array.from(new Set([...CATEGORIES.slice(1), ...customCats]))];
  }, [blogs]);

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

      return titleMatch || excerptMatch || contentMatch || categoryMatch || tagsMatch;
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
              placeholder="Search articles, topics, tags..."
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
              Showing <strong className="text-on-surface">{filteredBlogs.length}</strong> {filteredBlogs.length === 1 ? 'article' : 'articles'}
            </span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar">
          {categoriesList.map((category) => {
            const isSelected = selectedCategory === category;
            const count =
              category === 'All'
                ? blogs.length
                : blogs.filter((b) => b.category?.toLowerCase() === category.toLowerCase()).length;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-headline tracking-wide transition-all border ${
                  isSelected
                    ? 'bg-primary text-on-primary border-primary shadow-sm font-bold'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface border-outline-variant/20 hover:border-outline-variant/50'
                }`}
              >
                {category}
                <span className={`ml-1.5 text-[10px] opacity-75 font-mono ${isSelected ? 'text-on-primary' : 'text-on-surface-variant'}`}>
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Blog Cards Grid with Left-to-Right Entrance Animation */}
      {filteredBlogs.length === 0 ? (
        <div className="border border-dashed border-outline-variant/30 rounded-2xl p-12 text-center my-8 bg-surface-container-low/40">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/60 mb-3">
            article
          </span>
          <h2 className="font-headline text-lg sm:text-xl font-bold text-on-surface mb-1">
            No articles match your query
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-md mx-auto mb-4">
            Try adjusting your search terms or selecting a different category filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredBlogs.map((blog, index) => {
            const accentGradients = [
              'from-primary to-primary',
              'from-secondary to-secondary',
              'from-tertiary to-tertiary',
            ];
            const barGradient = accentGradients[index % accentGradients.length];

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

                {/* Meta Header: Category & Read Time */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/25">
                    {blog.category || 'Article'}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">schedule</span>
                      {blog.readTime || '5 min read'}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                      {formatDate(blog.publishedAt)}
                    </span>
                  </div>
                </div>

                {/* Article Title */}
                <h2 className="font-headline text-lg sm:text-xl font-bold text-on-surface tracking-tight mb-2.5 group-hover:text-primary transition-colors leading-snug">
                  {blog.title}
                </h2>

                {/* Excerpt */}
                <p className="text-on-surface-variant font-light text-xs sm:text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                  {blog.excerpt}
                </p>

                {/* Tags */}
                {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-6">
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

                {/* Card Action */}
                <div className="pt-4 border-t border-outline-variant/15 flex items-center justify-between">
                  {blog.externalUrl ? (
                    <a
                      href={blog.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-headline font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                    >
                      <span>Read on Publication</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveArticle(blog)}
                      className="inline-flex items-center gap-1.5 text-xs font-headline font-bold uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                    >
                      <span>Read Article</span>
                      <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                        arrow_forward
                      </span>
                    </button>
                  )}

                  <span className="text-[11px] font-mono text-on-surface-variant/70">
                    {blog.author || 'Dashintha Jayawardana'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Article Reader Modal */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] bg-[#F3EEE3] border border-outline-variant/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#111111]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 shrink-0 bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  {activeArticle.category || 'Article'}
                </span>
                <span className="text-xs font-mono text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {activeArticle.readTime || '5 min read'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                aria-label="Close reader"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-8 custom-scrollbar">
              <h1 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#111111]">
                {activeArticle.title}
              </h1>

              <div className="flex items-center gap-4 text-xs font-mono text-on-surface-variant pb-6 mb-6 border-b border-outline-variant/20">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">person</span>
                  {activeArticle.author || 'Dashintha Jayawardana'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
                  {formatDate(activeArticle.publishedAt)}
                </span>
              </div>

              {/* Excerpt callout */}
              <div className="p-4 sm:p-5 rounded-xl bg-surface-container-high/60 border-l-4 border-primary text-xs sm:text-sm text-on-surface-variant leading-relaxed mb-8 italic">
                {activeArticle.excerpt}
              </div>

              {/* Content body formatted */}
              <div className="prose prose-sm sm:prose max-w-none text-on-surface font-light leading-relaxed space-y-4">
                {(activeArticle.content || activeArticle.excerpt)
                  .split('\n\n')
                  .map((paragraph, pIdx) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;
                    if (trimmed.startsWith('# ')) {
                      return (
                        <h2 key={pIdx} className="font-headline text-xl sm:text-2xl font-bold text-on-surface mt-6 mb-2">
                          {trimmed.replace('# ', '')}
                        </h2>
                      );
                    }
                    if (trimmed.startsWith('## ')) {
                      return (
                        <h3 key={pIdx} className="font-headline text-lg sm:text-xl font-bold text-on-surface mt-5 mb-2">
                          {trimmed.replace('## ', '')}
                        </h3>
                      );
                    }
                    if (trimmed.startsWith('### ')) {
                      return (
                        <h4 key={pIdx} className="font-headline text-base sm:text-lg font-bold text-on-surface mt-4 mb-2">
                          {trimmed.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (trimmed.startsWith('- ')) {
                      const items = trimmed.split('\n- ');
                      return (
                        <ul key={pIdx} className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-on-surface-variant">
                          {items.map((item, iIdx) => (
                            <li key={iIdx}>{item.replace(/^- /, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <p key={pIdx} className="text-xs sm:text-sm text-on-surface leading-relaxed">
                        {trimmed}
                      </p>
                    );
                  })}
              </div>

              {/* Tags in reader */}
              {Array.isArray(activeArticle.tags) && activeArticle.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t border-outline-variant/20 flex flex-wrap gap-2">
                  {activeArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono px-3 py-1 rounded-md bg-surface-container-high text-on-surface-variant border border-outline-variant/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-outline-variant/20 bg-surface-container-low flex items-center justify-between">
              {activeArticle.externalUrl ? (
                <a
                  href={activeArticle.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-headline font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  <span>Open Original Source</span>
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              ) : (
                <span className="text-xs font-mono text-on-surface-variant">
                  Published by Dashintha Jayawardana
                </span>
              )}
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-headline font-bold uppercase tracking-wider transition-colors"
              >
                Close
              </button>
            </div>
          </div>
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
              {/* Animated spreading radial glow emanating from center */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(217,84,30,0.32)_0%,rgba(217,84,30,0.12)_45%,transparent_75%)] animate-spread-glow pointer-events-none" />

              {/* Concentric spreading ripple rings */}
              <div className="absolute inset-2 rounded-full border border-primary/25 animate-ripple-ring pointer-events-none" />
              <div className="absolute inset-2 rounded-full border border-primary/20 animate-ripple-ring pointer-events-none [animation-delay:1.75s]" />

              {/* Center cloud_done icon with warm aura */}
              <span className="material-symbols-outlined text-6xl sm:text-8xl text-primary drop-shadow-[0_0_24px_rgba(217,84,30,0.5)] relative z-20 transition-transform duration-500 hover:scale-110">
                cloud_done
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
