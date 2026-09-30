import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Education from '@/models/Education';
import { checkAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const education = await Education.find({}).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, data: education });
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
