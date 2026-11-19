import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('url');

    if (!target) {
      return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    let fullUrl = target.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`;
    }

    // Always target the landing page of the site
    try {
      const parsed = new URL(fullUrl);
      fullUrl = parsed.origin;
    } catch {
      // keep fullUrl
    }

    // Live webpage landing page screenshot preview via WordPress mshots
    // Free, reliable, and handles client-side rendering without paid account restrictions
    const screenshotUrl = `https://s0.wp.com/mshots/v1/${encodeURIComponent(fullUrl)}?w=1200`;

    return NextResponse.json({
      success: true,
      previewUrl: screenshotUrl,
      landingPage: fullUrl,
      source: 'screenshot',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
