import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import { checkAdminAuth } from '@/lib/adminAuth';
import seedData from '@/lib/seedData.json';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let projects = await Project.find({}).sort({ order: 1, createdAt: -1 });

    if (projects.length === 0 && seedData.projects?.length) {
      await Project.insertMany(
        seedData.projects.map((item, idx) => ({
          title: item.title,
          status: item.status || 'Active',
          statusColor: item.statusColor || 'primary',
          barColor: item.barColor || 'from-primary to-primary',
          description: item.description,
          technologies: item.technologies || [],
          image: item.image,
          githubUrl: item.githubUrl || '',
          liveUrl: item.liveUrl || '',
          order: idx + 1,
        }))
      );
      projects = await Project.find({}).sort({ order: 1, createdAt: -1 });
    }

    return NextResponse.json(
      { success: true, data: projects },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching admin projects:', error);
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

    const project = await Project.create(body);
    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
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

    // Support bulk reordering and color updates
    if (Array.isArray(body)) {
      const defaultBarColors = [
        'from-primary to-primary',
        'from-secondary to-secondary',
        'from-tertiary to-tertiary',
      ];
      await Promise.all(
        body.map((item, idx) => {
          const itemId = item._id || item.id;
          if (!itemId) return null;
          const update = {
            order: item.order !== undefined ? item.order : idx + 1,
            statusColor: item.statusColor || ['primary', 'secondary', 'tertiary'][idx % 3],
            barColor: item.barColor || defaultBarColors[idx % 3],
          };
          if (item.isVisible !== undefined) {
            update.isVisible = item.isVisible;
          }
          return Project.findByIdAndUpdate(itemId, update);
        })
      );
      const all = await Project.find({}).sort({ order: 1, createdAt: -1 });
      return NextResponse.json({ success: true, data: all });
    }

    const { id, _id, ...updateData } = body;

    const projectId = id || _id;
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const updated = await Project.findByIdAndUpdate(projectId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const deleted = await Project.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
