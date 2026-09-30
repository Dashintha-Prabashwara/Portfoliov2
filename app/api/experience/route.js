import { getExperiencesDb } from '@/lib/dbData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const experiences = await getExperiencesDb();
    return Response.json(experiences, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in /api/experience:', error);
    }
    return Response.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}
