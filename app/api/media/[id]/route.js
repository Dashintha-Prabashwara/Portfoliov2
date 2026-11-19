import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Media from '@/models/Media';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    // Explicitly select fileData since select: false on schema
    const media = await Media.findById(id).select('+fileData');

    if (!media || !media.fileData) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const contentType = media.contentType || 'image/png';
    const buffer = Buffer.isBuffer(media.fileData)
      ? media.fileData
      : Buffer.from(media.fileData);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Failed to retrieve media from MongoDB:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve media' },
      { status: 500 }
    );
  }
}
