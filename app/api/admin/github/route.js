import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import GithubConfig from '@/models/GithubConfig';
import { checkAdminAuth } from '@/lib/adminAuth';
import { checkRateLimit } from '@/lib/github';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    let config = await GithubConfig.findOne({}).lean();

    if (!config) {
      config = await GithubConfig.create({
        username: 'Dashintha-Prabashwara',
        isEnabled: true,
        showContributions: true,
        showAchievements: true,
        showOrganizations: true,
        showLanguageStats: true,
        showProjectBadges: true,
      });
      config = config.toObject();
    }

    const effectiveToken = config.token || process.env.GITHUB_TOKEN || '';
    const rateLimit = await checkRateLimit(effectiveToken);

    return NextResponse.json({
      success: true,
      data: {
        ...config,
        hasEnvToken: !!process.env.GITHUB_TOKEN,
        hasDbToken: !!config.token,
        tokenPreview: effectiveToken ? `${effectiveToken.slice(0, 4)}...${effectiveToken.slice(-4)}` : '',
        rateLimit,
      },
    });
  } catch (error) {
    console.error('Error fetching admin GitHub config:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();

    const updateData = {
      username: body.username ? body.username.trim() : 'Dashintha-Prabashwara',
      isEnabled: body.isEnabled !== undefined ? Boolean(body.isEnabled) : true,
      showContributions: body.showContributions !== undefined ? Boolean(body.showContributions) : true,
      showAchievements: body.showAchievements !== undefined ? Boolean(body.showAchievements) : true,
      showOrganizations: body.showOrganizations !== undefined ? Boolean(body.showOrganizations) : true,
      showLanguageStats: body.showLanguageStats !== undefined ? Boolean(body.showLanguageStats) : true,
      showProjectBadges: body.showProjectBadges !== undefined ? Boolean(body.showProjectBadges) : true,
    };

    // If a new token is provided or cleared
    if (body.token !== undefined) {
      updateData.token = body.token.trim();
    }

    let config = await GithubConfig.findOneAndUpdate({}, updateData, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    const effectiveToken = config.token || process.env.GITHUB_TOKEN || '';
    const rateLimit = await checkRateLimit(effectiveToken);

    return NextResponse.json({
      success: true,
      data: {
        ...config.toObject(),
        hasEnvToken: !!process.env.GITHUB_TOKEN,
        hasDbToken: !!config.token,
        tokenPreview: effectiveToken ? `${effectiveToken.slice(0, 4)}...${effectiveToken.slice(-4)}` : '',
        rateLimit,
      },
    });
  } catch (error) {
    console.error('Error updating admin GitHub config:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
