import { getExperience } from '@/lib/notion';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    const experiences = await getExperience();
    return Response.json(experiences);
  } catch (error) {
    console.error('Error in /api/experience:', error);
    return Response.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}
