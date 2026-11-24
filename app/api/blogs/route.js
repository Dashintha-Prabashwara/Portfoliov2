import { NextResponse } from 'next/server';
import { getBlogsDb } from '@/lib/dbData';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim().toLowerCase() || '';
    const category = searchParams.get('category')?.trim() || '';

    let blogs = await getBlogsDb(false);

    if (category && category.toLowerCase() !== 'all') {
      blogs = blogs.filter(
        (b) => b.category?.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      blogs = blogs.filter((b) => {
        const titleMatch = b.title?.toLowerCase().includes(search);
        const excerptMatch = b.excerpt?.toLowerCase().includes(search);
        const contentMatch = b.content?.toLowerCase().includes(search);
        const tagsMatch = (b.tags || []).some((t) => t.toLowerCase().includes(search));
        const categoryMatch = b.category?.toLowerCase().includes(search);
        return titleMatch || excerptMatch || contentMatch || tagsMatch || categoryMatch;
      });
    }

    return NextResponse.json({
      success: true,
      data: blogs,
      total: blogs.length,
    });
  } catch (error) {
    console.error('Error in /api/blogs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
