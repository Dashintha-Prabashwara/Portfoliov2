import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import { checkAdminAuth } from '@/lib/adminAuth';
import { syncBlogsFromTiDB } from '@/lib/dbData';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Auto-sync new posts from TiDB Cloud blog database
    try {
      await syncBlogsFromTiDB();
    } catch (syncErr) {
      console.warn('Non-fatal: TiDB sync error in admin GET blogs:', syncErr.message);
    }

    const blogs = await BlogPost.find({}).sort({ order: 1, publishedAt: -1 }).lean();

    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    console.error('Error fetching admin blogs:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    // Handle manual sync action from CMS
    if (body.action === 'sync') {
      const syncResult = await syncBlogsFromTiDB();
      const blogs = await BlogPost.find({}).sort({ order: 1, publishedAt: -1 }).lean();
      return NextResponse.json({
        success: true,
        message: `Synced ${syncResult.synced || 0} new posts from blog database`,
        data: blogs,
        syncResult,
      });
    }

    if (!body.title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const blog = await BlogPost.create(body);
    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    // Support bulk reordering
    if (Array.isArray(body)) {
      await Promise.all(
        body.map((item, index) =>
          BlogPost.findByIdAndUpdate(item._id || item.id, {
            order: index + 1,
            isVisible: item.isVisible !== false,
          })
        )
      );
      const blogs = await BlogPost.find({}).sort({ order: 1, publishedAt: -1 }).lean();
      return NextResponse.json({ success: true, data: blogs });
    }

    const { _id, id, ...updateData } = body;
    const blogId = _id || id;

    if (!blogId) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    const updated = await BlogPost.findByIdAndUpdate(blogId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await BlogPost.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
