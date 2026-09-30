import { getProjectsDb } from '@/lib/dbData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const projects = await getProjectsDb();
    return Response.json(projects, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in /api/projects:', error);
    }
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
