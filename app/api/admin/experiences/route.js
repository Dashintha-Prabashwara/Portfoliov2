import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Experience from '@/models/Experience';
import { checkAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const experiences = await Experience.find({}).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, data: experiences });
  } catch (error) {
    console.error('Error fetching admin experiences:', error);
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

    const experience = await Experience.create(body);
    return NextResponse.json({ success: true, data: experience }, { status: 201 });
  } catch (error) {
    console.error('Error creating experience:', error);
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
    const { id, _id, ...updateData } = body;

    const experienceId = id || _id;
    if (!experienceId) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    const updated = await Experience.findByIdAndUpdate(experienceId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating experience:', error);
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
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    const deleted = await Experience.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
