import { getSkillsDb } from '@/lib/dbData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const skills = await getSkillsDb(false);
    return Response.json(skills, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in /api/skills:', error);
    }
    return Response.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}
