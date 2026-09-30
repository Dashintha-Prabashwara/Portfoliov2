import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { checkAdminAuth } from '@/lib/adminAuth';
import connectToDatabase from '@/lib/mongodb';
import Cv from '@/models/Cv';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const targetType = formData.get('type') || 'general'; // 'cv' or 'image' or 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If uploading CV directly, store file in MongoDB
    if (targetType === 'cv') {
      let storedInMongo = false;

      if (process.env.MONGODB_URI) {
        try {
          await connectToDatabase();
          await Cv.findOneAndUpdate(
            { isActive: true },
            {
              fileData: buffer,
              fileSize: buffer.length,
              fileName: file.name || 'cv.pdf',
              contentType: file.type || 'application/pdf',
              fileUrl: '/api/cv/download',
              title: 'Dashintha Jayawardana - CV',
            },
            { upsert: true, new: true }
          );
          storedInMongo = true;
        } catch (dbErr) {
          console.error('Failed to save CV binary to MongoDB:', dbErr);
        }
      }

      // Also save local copy to public/cv.pdf as backup
      try {
        const cvPath = path.join(process.cwd(), 'public', 'cv.pdf');
        await writeFile(cvPath, buffer);
      } catch (fsErr) {
        console.warn('Could not write backup to disk:', fsErr);
      }

      return NextResponse.json({
        success: true,
        fileUrl: '/api/cv/download',
        filename: file.name || 'cv.pdf',
        fileSize: buffer.length,
        storedInMongo,
        message: storedInMongo
          ? 'CV PDF file successfully stored directly in MongoDB!'
          : 'CV uploaded locally (configure MONGODB_URI to store in MongoDB).',
      });
    }

    // General or images upload into public/uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Clean filename
    const originalName = file.name || 'uploaded_file';
    const ext = path.extname(originalName) || '';
    const safeBase = path
      .basename(originalName, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeBase}_${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      fileUrl: `/uploads/${filename}`,
      filename,
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
