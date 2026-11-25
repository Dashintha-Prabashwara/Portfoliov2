import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import {
  fetchBlogPostsFromTiDB,
  createBlogInTiDB,
  updateBlogInTiDB,
  deleteBlogInTiDB,
  reorderBlogsInTiDB,
  getBlogByIdFromTiDB,
} from '@/lib/tidb';
import connectToDatabase from '@/lib/mongodb';
import Experience from '@/models/Experience';
import Project from '@/models/Project';

export const dynamic = 'force-dynamic';

/**
 * Helper to update linked Experience in MongoDB
 */
async function syncExperienceLink(blogId, newExpId, oldExpId = null) {
  try {
    await connectToDatabase();
    const blogUrl = `/blog/${blogId}`;

    if (oldExpId && oldExpId !== newExpId && oldExpId !== 'none') {
      await Experience.findByIdAndUpdate(oldExpId, {
        $set: { blogUrl: '' },
      }).catch(() => {});
    }

    if (newExpId && newExpId !== 'none') {
      await Experience.findByIdAndUpdate(newExpId, {
        $set: { blogUrl },
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Non-fatal: Could not sync linked experience in MongoDB:', err.message);
  }
}

/**
 * Helper to update linked Project in MongoDB
 */
async function syncProjectLink(blogId, newProjId, oldProjId = null) {
  try {
    await connectToDatabase();
    const blogUrl = `/blog/${blogId}`;

    if (oldProjId && oldProjId !== newProjId && oldProjId !== 'none') {
      await Project.findByIdAndUpdate(oldProjId, {
        $set: { blogUrl: '' },
      }).catch(() => {});
    }

    if (newProjId && newProjId !== 'none') {
      await Project.findByIdAndUpdate(newProjId, {
        $set: { blogUrl },
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('Non-fatal: Could not sync linked project in MongoDB:', err.message);
  }
}

export async function GET(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const blogs = await fetchBlogPostsFromTiDB({ includeHidden: true });
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    console.error('Error fetching admin blogs from TiDB:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const blog = await createBlogInTiDB(body);

    // If linked to experience or project, update their blogUrl
    if (body.linkedExperienceId && body.linkedExperienceId !== 'none') {
      await syncExperienceLink(blog.id, body.linkedExperienceId);
    }
    if (body.linkedProjectId && body.linkedProjectId !== 'none') {
      await syncProjectLink(blog.id, body.linkedProjectId);
    }

    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post in TiDB:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Support bulk reordering and visibility updates
    if (Array.isArray(body)) {
      const updatedBlogs = await reorderBlogsInTiDB(body);
      return NextResponse.json({ success: true, data: updatedBlogs });
    }

    const { _id, id, blogPostId, ...updateData } = body;
    const targetId = id || _id || blogPostId;

    if (!targetId) {
      return NextResponse.json({ error: 'Blog ID is required' }, { status: 400 });
    }

    // Get existing blog to check previously linked experience or project
    const existing = await getBlogByIdFromTiDB(targetId);

    const updated = await updateBlogInTiDB(targetId, updateData);

    if (!updated) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Sync experience link if changed
    if (updateData.linkedExperienceId !== undefined) {
      await syncExperienceLink(
        targetId,
        updateData.linkedExperienceId,
        existing?.linkedExperienceId
      );
    }

    // Sync project link if changed
    if (updateData.linkedProjectId !== undefined) {
      await syncProjectLink(
        targetId,
        updateData.linkedProjectId,
        existing?.linkedProjectId
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating blog post in TiDB:', error);
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

    const { success, deletedBlog } = await deleteBlogInTiDB(id);

    if (!success) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // If it was linked to an experience or project, clear their link
    if (deletedBlog?.linkedExperienceId) {
      await syncExperienceLink(id, null, deletedBlog.linkedExperienceId);
    }
    if (deletedBlog?.linkedProjectId) {
      await syncProjectLink(id, null, deletedBlog.linkedProjectId);
    }

    return NextResponse.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post in TiDB:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
