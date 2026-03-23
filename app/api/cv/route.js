import { NextResponse } from 'next/server';

export async function GET(_request) {
  try {
    return NextResponse.json(
      {
        success: true,
        data: {
          title: 'Dashintha Jayawardana - CV',
          fileUrl: '/cv.pdf',
          description: 'Professional CV and Resume',
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
        error: 'Failed to retrieve CV information.',
      },
      { status: 500 }
    );
  }
}
