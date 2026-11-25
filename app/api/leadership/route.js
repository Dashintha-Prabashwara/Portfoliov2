import { getLeadershipDb } from '@/lib/dbData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const leadership = await getLeadershipDb(false);
    return Response.json(leadership, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in /api/leadership:', error);
    }
    return Response.json({ error: 'Failed to fetch leadership items' }, { status: 500 });
  }
}
