import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getBlogByIdFromTiDB } from '@/lib/tidb';
import { getExperiencesDb, getProjectsDb } from '@/lib/dbData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { id } = await params;
  const blog = await getBlogByIdFromTiDB(id);

  if (!blog || !blog.isVisible) {
    return {
      title: 'Article Not Found | Dashintha Jayawardana',
    };
  }

  return {
    title: `${blog.title} | Dashintha Jayawardana`,
    description: blog.excerpt || blog.title,
  };
}

export default async function SingleBlogPage({ params }) {
  const { id } = await params;
  const blog = await getBlogByIdFromTiDB(id);

  if (!blog || !blog.isVisible) {
    notFound();
  }

  // Resolve linked experience and project
  let experiences = [];
  let projects = [];
  try {
    [experiences, projects] = await Promise.all([
      getExperiencesDb(),
      getProjectsDb(),
    ]);
  } catch {}

  const linkedExp = blog.linkedExperienceId
    ? experiences.find(
        (e) => String(e.id) === String(blog.linkedExperienceId) || String(e._id) === String(blog.linkedExperienceId)
      )
    : null;

  const linkedProj = blog.linkedProjectId
    ? projects.find(
        (p) => String(p.id) === String(blog.linkedProjectId) || String(p._id) === String(blog.linkedProjectId)
      )
    : null;

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
      <Navigation />
      <main className="pt-24 sm:pt-28 md:pt-36 pb-20 px-4 sm:px-6 max-w-4xl mx-auto min-h-screen">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors group"
          >
            <span className="material-symbols-outlined text-base transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span>All Articles</span>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-10 sm:mb-14">
          {/* Linked Experience / Project Pill */}
          {(linkedExp || linkedProj) && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {linkedExp && (
                <Link
                  href="/experience"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-secondary/15 text-secondary border border-secondary/30 hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">work</span>
                  <span>{linkedExp.role} - {linkedExp.company}</span>
                </Link>
              )}
              {linkedProj && (
                <Link
                  href="/projects"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-tertiary/15 text-tertiary border border-tertiary/30 hover:underline"
                >
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  <span>Project: {linkedProj.title}</span>
                </Link>
              )}
            </div>
          )}

          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-on-surface mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-on-surface-variant pb-6 border-b border-outline-variant/20">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-primary">person</span>
              <span>{blog.author || 'Dashintha Jayawardana'}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-primary">calendar_today</span>
              <span>{formatDate(blog.publishedAt)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base text-primary">schedule</span>
              <span>{blog.readTime || '5 min read'}</span>
            </span>
          </div>
        </header>

        {/* Cover Image (if uploaded/present) */}
        {blog.coverImage && (
          <div className="mb-10 sm:mb-14 rounded-2xl overflow-hidden border border-outline-variant/30 shadow-xl bg-surface-container-low max-h-[500px] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-full object-cover max-h-[500px]"
            />
          </div>
        )}

        {/* Excerpt Callout */}
        {blog.excerpt && (
          <div className="p-5 sm:p-7 rounded-2xl bg-surface-container-low border-l-4 border-primary text-sm sm:text-base text-on-surface-variant leading-relaxed mb-10 italic shadow-sm">
            {blog.excerpt}
          </div>
        )}

        {/* Article Body */}
        <article className="prose prose-sm sm:prose lg:prose-lg max-w-none text-on-surface font-light leading-relaxed space-y-6">
          {(blog.content || blog.excerpt)
            .split('\n\n')
            .map((paragraph, pIdx) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;
              if (trimmed.startsWith('# ')) {
                return (
                  <h2 key={pIdx} className="font-headline text-2xl sm:text-3xl font-bold text-on-surface mt-10 mb-4 tracking-tight">
                    {trimmed.replace(/^#\s+/, '')}
                  </h2>
                );
              }
              if (trimmed.startsWith('## ')) {
                return (
                  <h3 key={pIdx} className="font-headline text-xl sm:text-2xl font-bold text-on-surface mt-8 mb-3 tracking-tight">
                    {trimmed.replace(/^##\s+/, '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h4 key={pIdx} className="font-headline text-lg sm:text-xl font-bold text-on-surface mt-6 mb-2">
                    {trimmed.replace(/^###\s+/, '')}
                  </h4>
                );
              }
              if (trimmed.startsWith('```')) {
                const codeContent = trimmed.replace(/^```[a-z]*\n?/, '').replace(/\n?```$/, '');
                return (
                  <pre key={pIdx} className="p-4 sm:p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-xs sm:text-sm font-mono overflow-x-auto text-primary/95 shadow-inner">
                    <code>{codeContent}</code>
                  </pre>
                );
              }
              if (trimmed.startsWith('- ')) {
                const items = trimmed.split('\n- ');
                return (
                  <ul key={pIdx} className="list-disc pl-6 space-y-2 text-sm sm:text-base text-on-surface-variant">
                    {items.map((item, iIdx) => (
                      <li key={iIdx}>{item.replace(/^- /, '')}</li>
                    ))}
                  </ul>
                );
              }
              return (
                <p key={pIdx} className="text-sm sm:text-base text-on-surface leading-relaxed">
                  {trimmed}
                </p>
              );
            })}
        </article>

        {/* Tags */}
        {Array.isArray(blog.tags) && blog.tags.length > 0 && (
          <div className="mt-12 pt-8 border-t border-outline-variant/20 flex flex-wrap gap-2">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-mono px-3 py-1 rounded-lg bg-surface-container-high text-on-surface-variant border border-outline-variant/30"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-12 pt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {linkedExp && (
              <Link
                href="/experience"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary/15 text-secondary border border-secondary/30 text-xs font-headline font-bold uppercase tracking-wider hover:bg-secondary/25 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">work</span>
                <span>View Related Experience</span>
              </Link>
            )}
            {linkedProj && (
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-tertiary/15 text-tertiary border border-tertiary/30 text-xs font-headline font-bold uppercase tracking-wider hover:bg-tertiary/25 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                <span>View Related Project</span>
              </Link>
            )}
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-headline font-bold uppercase tracking-wider transition-colors"
          >
            <span>Back to All Articles</span>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
