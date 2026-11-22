import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import GithubConfig from '@/models/GithubConfig';
import { checkAdminAuth } from '@/lib/adminAuth';
import { fetchRepoDetails } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repoUrl = searchParams.get('url');

    if (!repoUrl) {
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
    }

    await connectToDatabase();
    const config = await GithubConfig.findOne({}).lean();
    const token = config?.token || process.env.GITHUB_TOKEN || '';

    const repoData = await fetchRepoDetails(repoUrl, token);

    return NextResponse.json({
      success: true,
      data: repoData,
    });
  } catch (error) {
    console.error('Error in fetch-repo endpoint:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
