import { NextResponse } from 'next/server';
import { getBlogByIdFromTiDB } from '@/lib/tidb';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    const blog = await getBlogByIdFromTiDB(id);

    if (!blog || !blog.isVisible) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching single blog post from TiDB:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
