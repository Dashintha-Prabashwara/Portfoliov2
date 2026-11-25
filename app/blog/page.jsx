import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlogView from '@/components/BlogView';
import { getBlogsDb } from '@/lib/dbData';
import { fetchCategoriesFromTiDB } from '@/lib/tidb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Blog & Technical Articles | Dashintha Jayawardana',
  description:
    'Technical articles, architectural deep dives, DevOps automation guides, and insights by Dashintha Jayawardana.',
};

export default async function BlogPage() {
  let blogs = [];
  let categories = [];
  try {
    [blogs, categories] = await Promise.all([
      getBlogsDb(),
      fetchCategoriesFromTiDB({ includeHidden: false }),
    ]);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching blogs in BlogPage:', err);
    }
  }

  return (
    <>
      <Navigation />
      <main className="pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        {/* Page Hero Header following standard site design principles */}
        <header className="relative mb-12 sm:mb-16 md:mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 sm:mb-6 leading-tight">
                <span className="text-on-surface">Technical</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-tertiary">
                  Articles &amp; Insights.
                </span>
              </h1>
              <p className="max-w-2xl text-on-surface-variant text-sm sm:text-base md:text-lg lg:text-xl font-light leading-relaxed">
                Reflections, production blueprints, and engineering notes on cloud systems, CI/CD automation, serverless computing, and resilient distributed architectures.
              </p>
            </div>
          </div>
        </header>

        {/* Client Interactive Blog Section with Search, Filters, and Left-to-Right Animated Cards */}
        <BlogView initialBlogs={blogs} initialCategories={categories} />
      </main>
      <Footer />
    </>
  );
}
