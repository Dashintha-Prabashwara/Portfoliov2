import { getProjects } from '@/lib/notion';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const projects = await getProjects();
    return Response.json(projects, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error in /api/projects:', error);
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
