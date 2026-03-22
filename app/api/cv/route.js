import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import CV from '@/models/CV';

/**
 * GET /api/cv
 * Retrieve the latest active CV information
 */
export async function GET(request) {
  try {
    // Connect to database
    await connectToDatabase();

    // Get the latest active CV
    const cv = await CV.getLatest();

    // Check if CV exists
    if (!cv) {
      return NextResponse.json(
        {
          success: false,
          error: 'No CV available at the moment. Please check back later.',
        },
        { status: 404 }
      );
    }

    // Increment download count (optional - track analytics)
    // This can be moved to a separate /api/cv/download endpoint if preferred
    const trackDownload = request.nextUrl.searchParams.get('track') === 'true';
    if (trackDownload) {
      await cv.incrementDownload();
    }

    // Return CV information
    return NextResponse.json(
      {
        success: true,
        data: {
          id: cv._id,
          title: cv.title,
          fileUrl: cv.fileUrl,
          version: cv.version,
          description: cv.description,
          uploadedAt: cv.uploadedAt,
          downloadCount: cv.downloadCount,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
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
        error: 'Failed to retrieve CV. Please try again later.',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cv
 * Upload a new CV (admin only - add auth in production)
 */
export async function POST(request) {
  try {
    // NOTE: In production, add authentication here
    // For now, this endpoint is disabled for security

    return NextResponse.json(
      {
        success: false,
        error: 'Endpoint not available. Use admin panel to upload CV.',
      },
      { status: 403 }
    );

    // Example implementation (uncomment with auth):
    // const body = await request.json();
    // await connectToDatabase();
    //
    // // Deactivate all existing CVs
    // await CV.updateMany({}, { isActive: false });
    //
    // // Create new CV
    // const cv = await CV.create({
    //   title: body.title,
    //   fileUrl: body.fileUrl,
    //   version: body.version,
    //   description: body.description,
    // });
    //
    // return NextResponse.json({ success: true, data: cv }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('CV POST Error:', error);
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
