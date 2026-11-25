import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Leadership from '@/models/Leadership';
import { checkAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const leadership = await Leadership.find({}).sort({ order: 1, createdAt: 1 }).lean();

    return NextResponse.json({ success: true, data: leadership });
  } catch (error) {
    console.error('Error fetching admin leadership items:', error);
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

    const item = await Leadership.create(body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error('Error creating leadership item:', error);
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

    // Support bulk reordering and visibility updates
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
          return Leadership.findByIdAndUpdate(itemId, update);
        })
      );
      const all = await Leadership.find({}).sort({ order: 1, createdAt: 1 }).lean();
      return NextResponse.json({ success: true, data: all });
    }

    const { id, _id, ...updateData } = body;
    const leadershipId = id || _id;

    if (!leadershipId) {
      return NextResponse.json({ error: 'Leadership ID is required' }, { status: 400 });
    }

    const updated = await Leadership.findByIdAndUpdate(leadershipId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Leadership item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating leadership item:', error);
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
      return NextResponse.json({ error: 'Leadership ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await Leadership.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Leadership item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Leadership item deleted successfully' });
  } catch (error) {
    console.error('Error deleting leadership item:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
