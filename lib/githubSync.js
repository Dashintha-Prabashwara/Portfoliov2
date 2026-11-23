import connectToDatabase from '@/lib/mongodb';
import GithubConfig from '@/models/GithubConfig';
import Project from '@/models/Project';
import { fetchAllGithubTelemetry, fetchRepoDetails } from '@/lib/github';

export const SYNC_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

/**
 * Executes a full synchronization of GitHub telemetry and project repositories.
 * @param {boolean} force - If true, bypasses the 2-hour interval check.
 */
export async function runGithubFullSync(force = false) {
  await connectToDatabase();
  let config = await GithubConfig.findOne({});

  const now = Date.now();
  const lastSynced = config?.lastSyncedAt ? new Date(config.lastSyncedAt).getTime() : 0;
  const isMissingData =
    !config?.cachedStats?.achievements?.length &&
    !config?.cachedStats?.organizations?.length &&
    !config?.cachedStats?.highlights?.length;

  const isDue = !config?.cachedStats || now - lastSynced >= SYNC_INTERVAL_MS || isMissingData;

  if (!force && !isDue) {
    return {
      synced: false,
      reason: 'Cache still fresh (updates every 2 hours)',
      lastSyncedAt: config?.lastSyncedAt,
      nextSyncInMs: Math.max(0, SYNC_INTERVAL_MS - (now - lastSynced)),
      telemetry: config?.cachedStats,
    };
  }

  const username = config?.username || 'Dashintha-Prabashwara';
  const token = config?.token || process.env.GITHUB_TOKEN || '';

  const options = {
    customContributedRepos: config?.customContributedRepos || [],
    excludedContributedRepos: config?.excludedContributedRepos || [],
  };

  // 1. Fetch complete telemetry
  const telemetry = await fetchAllGithubTelemetry(username, token, options);

  // 2. Update config & cached stats in MongoDB
  const updatedTime = new Date();
  if (config) {
    config.cachedStats = telemetry;
    config.lastSyncedAt = updatedTime;
    await config.save();
  } else {
    config = await GithubConfig.create({
      username,
      cachedStats: telemetry,
      lastSyncedAt: updatedTime,
    });
  }

  // 3. Sync all projects that have a GitHub URL
  const projects = await Project.find({ githubUrl: { $exists: true, $ne: '' } });
  const syncResults = [];

  for (const project of projects) {
    try {
      const repoData = await fetchRepoDetails(project.githubUrl, token);
      project.githubStars = repoData.stars || 0;
      project.githubForks = repoData.forks || 0;
      project.githubLanguage = repoData.language || project.githubLanguage || '';
      project.githubLastPushed = repoData.lastPushed || '';
      project.githubSyncedAt = updatedTime;
      await project.save();

      syncResults.push({
        id: project._id,
        title: project.title,
        stars: project.githubStars,
        forks: project.githubForks,
        status: 'synced',
      });
    } catch (err) {
      console.warn(`Failed syncing repo for ${project.title}:`, err.message);
      syncResults.push({
        id: project._id,
        title: project.title,
        status: 'failed',
        error: err.message,
      });
    }
  }

  return {
    synced: true,
    lastSyncedAt: updatedTime,
    telemetry,
    projectsSynced: syncResults,
  };
}
