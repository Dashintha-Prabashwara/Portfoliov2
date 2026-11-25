import { NextResponse } from 'next/server';
import { fetchCategoriesFromTiDB } from '@/lib/tidb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await fetchCategoriesFromTiDB({ includeHidden: false });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching public blog categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
