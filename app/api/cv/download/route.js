import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Cv from '@/models/Cv';
import { readFile } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceDownload = searchParams.get('download') === 'true';

    let fileBuffer = null;
    let fileName = 'Dashintha_Jayawardana_CV.pdf';
    let contentType = 'application/pdf';

    // 1. Try to fetch PDF directly from MongoDB
    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        const cv = await Cv.findOne({ isActive: true }).select('+fileData');

        if (cv && cv.fileData) {
          fileBuffer = cv.fileData;
          fileName = cv.fileName || fileName;
          contentType = cv.contentType || contentType;

          // Track download count in MongoDB
          await Cv.updateOne({ _id: cv._id }, { $inc: { downloadsCount: 1 } }).catch(() => {});
        } else if (cv) {
          // If cv document exists in MongoDB but fileData is not yet populated,
          // try to hydrate it from public/cv.pdf
          try {
            const localCvPath = path.join(process.cwd(), 'public', 'cv.pdf');
            const localBuffer = await readFile(localCvPath);
            if (localBuffer) {
              fileBuffer = localBuffer;
              // Hydrate MongoDB document with the file data
              await Cv.updateOne(
                { _id: cv._id },
                {
                  fileData: localBuffer,
                  fileSize: localBuffer.length,
                  fileName: 'cv.pdf',
                  contentType: 'application/pdf',
                  $inc: { downloadsCount: 1 },
                }
              ).catch(() => {});
            }
          } catch {
            // Local fallback not available
          }
        }
      } catch (dbErr) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('MongoDB CV download error, falling back to disk:', dbErr);
        }
      }
    }

    // 2. Fallback to local disk if MongoDB is not configured or didn't have data
    if (!fileBuffer) {
      try {
        const localCvPath = path.join(process.cwd(), 'public', 'cv.pdf');
        fileBuffer = await readFile(localCvPath);
      } catch (fsErr) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to read fallback CV file:', fsErr);
        }
      }
    }

    if (!fileBuffer) {
      return NextResponse.json(
        { error: 'CV file not found. Please upload one via the CMS.' },
        { status: 404 }
      );
    }

    const disposition = forceDownload
      ? `attachment; filename="${fileName}"`
      : `inline; filename="${fileName}"`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('CV download handler error:', error);
    }
    return NextResponse.json(
      { error: 'Failed to stream CV file.' },
      { status: 500 }
    );
  }
}
