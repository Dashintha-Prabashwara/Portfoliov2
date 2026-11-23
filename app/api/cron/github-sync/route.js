import { NextResponse } from 'next/server';
import { runGithubFullSync } from '@/lib/githubSync';

export const dynamic = 'force-dynamic';

/**
 * Scheduled background sync endpoint (Vercel Cron / Scheduler).
 * Triggers every 2 hours to keep GitHub telemetry and project repositories synced.
 */
export async function GET(request) {
  try {
    // Optional CRON_SECRET check if configured
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const result = await runGithubFullSync(true); // force full update on cron schedule

    return NextResponse.json({
      success: true,
      message: 'Automated 2-hour GitHub synchronization completed',
      lastSyncedAt: result.lastSyncedAt,
      projectsSyncedCount: result.projectsSynced?.length || 0,
    });
  } catch (error) {
    console.error('Automated cron GitHub sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
