import { NextResponse } from 'next/server';
import { getCvDb } from '@/lib/dbData';
import connectToDatabase from '@/lib/mongodb';
import Cv from '@/models/Cv';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const track = searchParams.get('track') === 'true';

    if (track) {
      try {
        if (process.env.MONGODB_URI) {
          await connectToDatabase();
          await Cv.findOneAndUpdate(
            { isActive: true },
            { $inc: { downloadsCount: 1 } },
            { upsert: false }
          );
        }
      } catch (trackError) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to track CV download count:', trackError);
        }
      }
    }

    const cvData = await getCvDb();

    return NextResponse.json(
      {
        success: true,
        data: cvData,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('CV API Error:', error);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to retrieve CV information.',
      },
      { status: 500 }
    );
  }
}
