import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Skill from '@/models/Skill';
import { checkAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const skills = await Skill.find({}).sort({ order: 1, createdAt: 1 }).lean();

    return NextResponse.json({ success: true, data: skills });
  } catch (error) {
    console.error('Error fetching admin skills:', error);
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

    const skill = await Skill.create(body);
    return NextResponse.json({ success: true, data: skill }, { status: 201 });
  } catch (error) {
    console.error('Error creating skill:', error);
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
          return Skill.findByIdAndUpdate(itemId, update);
        })
      );
      const all = await Skill.find({}).sort({ order: 1, createdAt: 1 }).lean();
      return NextResponse.json({ success: true, data: all });
    }

    const { id, _id, ...updateData } = body;
    const skillId = id || _id;

    if (!skillId) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    const updated = await Skill.findByIdAndUpdate(skillId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating skill:', error);
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
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const deleted = await Skill.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Error deleting skill:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
