import { getProjects } from '@/lib/notion';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    const projects = await getProjects();
    return Response.json(projects);
  } catch (error) {
    console.error('Error in /api/projects:', error);
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
