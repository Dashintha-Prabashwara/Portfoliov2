import { getEducation } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const education = await getEducation();
    return Response.json(education, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in /api/education:', error);
    }
    return Response.json({ error: 'Failed to fetch education' }, { status: 500 });
  }
}
