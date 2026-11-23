import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import { runGithubFullSync } from '@/lib/githubSync';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await runGithubFullSync(true); // force = true for manual admin click

    return NextResponse.json({
      success: true,
      message: `Refreshed GitHub profile metrics and synced ${result.projectsSynced.filter((r) => r.status === 'synced').length} projects`,
      telemetry: result.telemetry,
      projectsSynced: result.projectsSynced,
      lastSyncedAt: result.lastSyncedAt,
    });
  } catch (error) {
    console.error('GitHub sync route error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
