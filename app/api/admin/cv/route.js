import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cv from '@/models/Cv';
import { checkAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let cv = await Cv.findOne({ isActive: true }).sort({ updatedAt: -1 });

    if (!cv) {
      cv = await Cv.create({
        title: 'Dashintha Jayawardana - CV',
        fileUrl: '/cv.pdf',
        description: 'Professional CV and Resume',
        downloadsCount: 0,
        isActive: true,
      });
    }

    return NextResponse.json({ success: true, data: cv });
  } catch (error) {
    console.error('Error fetching admin CV:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    let cv;
    const cvId = id || _id;

    if (cvId) {
      cv = await Cv.findByIdAndUpdate(cvId, updateData, {
        new: true,
        runValidators: true,
      });
    } else {
      cv = await Cv.findOneAndUpdate({ isActive: true }, updateData, {
        new: true,
        upsert: true,
        runValidators: true,
      });
    }

    return NextResponse.json({ success: true, data: cv });
  } catch (error) {
    console.error('Error updating CV:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
