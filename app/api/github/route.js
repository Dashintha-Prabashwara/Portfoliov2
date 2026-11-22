import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import GithubConfig from '@/models/GithubConfig';
import { fetchAllGithubTelemetry } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let config = null;

    try {
      await connectToDatabase();
      config = await GithubConfig.findOne({}).lean();
    } catch (dbError) {
      console.warn('MongoDB connection issue when loading GitHub config:', dbError.message);
    }

    const username = config?.username || 'Dashintha-Prabashwara';
    const isEnabled = config?.isEnabled !== false;
    const showContributions = config?.showContributions !== false;
    const showAchievements = config?.showAchievements !== false;
    const showOrganizations = config?.showOrganizations !== false;
    const showLanguageStats = config?.showLanguageStats !== false;
    const showProjectBadges = config?.showProjectBadges !== false;

    if (!isEnabled) {
      return NextResponse.json({
        isEnabled: false,
        message: 'GitHub telemetry is currently disabled via CMS.',
      });
    }

    const now = Date.now();
    const lastSynced = config?.lastSyncedAt ? new Date(config.lastSyncedAt).getTime() : 0;
    const isMissingData = !config?.cachedStats?.achievements?.length && !config?.cachedStats?.organizations?.length;
    const isStale = !config?.cachedStats || now - lastSynced > 30 * 60 * 1000 || isMissingData;

    let telemetry = config?.cachedStats;

    if (isStale) {
      try {
        const token = config?.token || process.env.GITHUB_TOKEN || '';
        telemetry = await fetchAllGithubTelemetry(username, token);

        // Update cache in database asynchronously
        if (config?._id) {
          GithubConfig.findByIdAndUpdate(config._id, {
            cachedStats: telemetry,
            lastSyncedAt: new Date(),
          }).catch((err) => console.error('Failed to update GitHub cache:', err));
        } else {
          GithubConfig.create({
            username,
            isEnabled,
            showContributions,
            showAchievements,
            showOrganizations,
            showLanguageStats,
            showProjectBadges,
            cachedStats: telemetry,
            lastSyncedAt: new Date(),
          }).catch((err) => console.error('Failed to create initial GitHub config:', err));
        }
      } catch (fetchError) {
        console.error('Failed fetching fresh GitHub telemetry:', fetchError.message);
        // If fetch fails and no cached telemetry, fall back to minimal payload
        if (!telemetry) {
          telemetry = {
            profile: { login: username, name: username, publicRepos: 0, totalStars: 0, totalForks: 0 },
            languages: [],
            latestRepos: [],
            organizations: [],
            contributions: { totalContributions: 0, weeks: [] },
            achievements: [],
            rateLimit: { limit: 60, remaining: 0 },
          };
        }
      }
    }

    return NextResponse.json({
      isEnabled: true,
      config: {
        username,
        showContributions,
        showAchievements,
        showOrganizations,
        showLanguageStats,
        showProjectBadges,
      },
      data: {
        profile: telemetry?.profile || null,
        languages: showLanguageStats ? telemetry?.languages || [] : [],
        latestRepos: telemetry?.latestRepos || [],
        organizations: showOrganizations ? telemetry?.organizations || [] : [],
        contributions: showContributions ? telemetry?.contributions || null : null,
        achievements: showAchievements ? telemetry?.achievements || [] : [],
        rateLimit: telemetry?.rateLimit || null,
        lastSyncedAt: telemetry?.lastSyncedAt || config?.lastSyncedAt || null,
      },
    });
  } catch (error) {
    console.error('Error in /api/github:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load GitHub telemetry' },
      { status: 500 }
    );
  }
}
