import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files (JPEG, PNG, WebP, SVG, GIF) are allowed' },
        { status: 400 }
      );
    }

    // Limit image size to 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Image size exceeds maximum limit of 5MB' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';
    const base64Data = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      fileUrl: dataUri,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error('Error handling blog cover image upload:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
