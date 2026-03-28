import { NextResponse } from 'next/server';
import { getPortfolioContext } from '@/lib/chatbot';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const context = await getPortfolioContext();
    return NextResponse.json({ context }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
  } catch (error) {
    console.error('[context] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio context' },
      { status: 500 }
    );
  }
}
