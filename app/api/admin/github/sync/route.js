import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import GithubConfig from '@/models/GithubConfig';
import Project from '@/models/Project';
import { checkAdminAuth } from '@/lib/adminAuth';
import { fetchAllGithubTelemetry, fetchRepoDetails } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let config = await GithubConfig.findOne({});
    const username = config?.username || 'Dashintha-Prabashwara';
    const token = config?.token || process.env.GITHUB_TOKEN || '';

    // 1. Refresh full profile telemetry
    const telemetry = await fetchAllGithubTelemetry(username, token);

    if (config) {
      config.cachedStats = telemetry;
      config.lastSyncedAt = new Date();
      await config.save();
    } else {
      config = await GithubConfig.create({
        username,
        cachedStats: telemetry,
        lastSyncedAt: new Date(),
      });
    }

    // 2. Sync all projects that have a GitHub URL
    const projects = await Project.find({ githubUrl: { $exists: true, $ne: '' } });
    const syncResults = [];

    for (const project of projects) {
      try {
        const repoData = await fetchRepoDetails(project.githubUrl, token);
        project.githubStars = repoData.stars || 0;
        project.githubForks = repoData.forks || 0;
        project.githubLanguage = repoData.language || project.githubLanguage || '';
        project.githubLastPushed = repoData.lastPushed || '';
        project.githubSyncedAt = new Date();
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

    return NextResponse.json({
      success: true,
      message: `Refreshed GitHub profile metrics and synced ${syncResults.filter((r) => r.status === 'synced').length} projects`,
      telemetry,
      projectsSynced: syncResults,
    });
  } catch (error) {
    console.error('Error in GitHub sync endpoint:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
