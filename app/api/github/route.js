import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import GithubConfig from '@/models/GithubConfig';
import { runGithubFullSync, SYNC_INTERVAL_MS } from '@/lib/githubSync';

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
    const showHighlights = config?.showHighlights !== false;
    const showOrganizations = config?.showOrganizations !== false;
    const showLanguageStats = config?.showLanguageStats !== false;
    const showProjectBadges = config?.showProjectBadges !== false;

    const hiddenAchievements = config?.hiddenAchievements || [];
    const hiddenOrganizations = config?.hiddenOrganizations || [];
    const hiddenHighlights = config?.hiddenHighlights || [];
    const hiddenLanguages = config?.hiddenLanguages || [];
    const customContributedRepos = config?.customContributedRepos || [];
    const excludedContributedRepos = config?.excludedContributedRepos || [];

    if (!isEnabled) {
      return NextResponse.json({
        isEnabled: false,
        message: 'GitHub telemetry is currently disabled via CMS.',
      });
    }

    const now = Date.now();
    const lastSynced = config?.lastSyncedAt ? new Date(config.lastSyncedAt).getTime() : 0;
    const isMissingData =
      !config?.cachedStats?.achievements?.length &&
      !config?.cachedStats?.organizations?.length &&
      !config?.cachedStats?.highlights?.length;

    // Auto-update every 2 hours (SYNC_INTERVAL_MS) or if data is missing
    const isStale = !config?.cachedStats || now - lastSynced >= SYNC_INTERVAL_MS || isMissingData;

    let telemetry = config?.cachedStats;

    if (isStale) {
      try {
        const syncResult = await runGithubFullSync(false);
        if (syncResult.synced && syncResult.telemetry) {
          telemetry = syncResult.telemetry;
        }
      } catch (fetchError) {
        console.error('Auto-sync failed in /api/github:', fetchError.message);
        if (!telemetry) {
          telemetry = {
            profile: { login: username, name: username, publicRepos: 0, totalStars: 0, totalForks: 0 },
            languages: [],
            latestRepos: [],
            organizations: [],
            contributions: { totalContributions: 0, weeks: [] },
            achievements: [],
            highlights: [],
            rateLimit: { limit: 60, remaining: 0 },
          };
        }
      }
    }

    // Apply subcomponent filters
    const filteredLanguages = (telemetry?.languages || []).filter(
      (l) => !hiddenLanguages.includes(l.name)
    );
    const filteredOrganizations = (telemetry?.organizations || []).filter(
      (o) => !hiddenOrganizations.includes(o.login) && !hiddenOrganizations.includes(o.name)
    );
    const filteredAchievements = (telemetry?.achievements || []).filter(
      (a) => !hiddenAchievements.includes(a.title)
    );
    const filteredHighlights = (telemetry?.highlights || []).filter(
      (h) => !hiddenHighlights.includes(h.title)
    );

    return NextResponse.json({
      isEnabled: true,
      config: {
        username,
        showContributions,
        showAchievements,
        showHighlights,
        showOrganizations,
        showLanguageStats,
        showProjectBadges,
        hiddenAchievements,
        hiddenOrganizations,
        hiddenHighlights,
        hiddenLanguages,
        customContributedRepos,
        excludedContributedRepos,
      },
      data: {
        profile: telemetry?.profile || null,
        languages: showLanguageStats ? filteredLanguages : [],
        latestRepos: telemetry?.latestRepos || [],
        contributedRepos: telemetry?.contributedRepos || [],
        organizations: showOrganizations ? filteredOrganizations : [],
        contributions: showContributions ? telemetry?.contributions || null : null,
        achievements: showAchievements ? filteredAchievements : [],
        highlights: showHighlights ? filteredHighlights : [],
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
