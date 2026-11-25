import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Education from '@/models/Education';
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
    let education = await Education.find({}).sort({ order: 1, createdAt: -1 });

    if (education.length === 0 && seedData.education?.length) {
      await Education.insertMany(
        seedData.education.map((item, idx) => ({
          title: item.title,
          institution: item.institution,
          description: item.description || '',
          tags: item.tags || [],
          startDate: item.startDate || '',
          endDate: item.endDate || 'PRESENT',
          order: idx + 1,
        }))
      );
      education = await Education.find({}).sort({ order: 1, createdAt: -1 });
    }

    return NextResponse.json(
      { success: true, data: education },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching admin education:', error);
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

    const entry = await Education.create(body);
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error) {
    console.error('Error creating education entry:', error);
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
      await Promise.all(
        body.map((item, idx) => {
          const itemId = item._id || item.id;
          if (!itemId) return null;
          const update = {
            order: item.order !== undefined ? item.order : idx + 1,
            color: item.color || ['primary', 'secondary', 'tertiary'][idx % 3],
          };
          if (item.isVisible !== undefined) {
            update.isVisible = item.isVisible;
          }
          return Education.findByIdAndUpdate(itemId, update);
        })
      );
      const all = await Education.find({}).sort({ order: 1, createdAt: -1 });
      return NextResponse.json({ success: true, data: all });
    }

    const { id, _id, ...updateData } = body;

    const eduId = id || _id;
    if (!eduId) {
      return NextResponse.json({ error: 'Education ID is required' }, { status: 400 });
    }

    const updated = await Education.findByIdAndUpdate(eduId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Education entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating education entry:', error);
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
      return NextResponse.json({ error: 'Education ID is required' }, { status: 400 });
    }

    const deleted = await Education.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Education entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Education entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting education entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
