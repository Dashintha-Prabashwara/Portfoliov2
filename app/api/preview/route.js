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

    // Default screenshot preview URL
    const screenshotFallback = `https://api.microlink.io?url=${encodeURIComponent(
      fullUrl
    )}&screenshot=true&embed=screenshot.url`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(fullUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          Accept: 'text/html,application/xhtml+xml',
        },
      });
      clearTimeout(timeout);

      const html = await res.text();

      // Look for og:image or twitter:image
      const ogMatch =
        html.match(/<meta[^>]*property=["']og:image(?::url)?["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image(?::url)?["']/i) ||
        html.match(/<meta[^>]*name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i);

      if (ogMatch && ogMatch[1]) {
        let ogUrl = ogMatch[1].trim();
        if (ogUrl.startsWith('//')) {
          ogUrl = `https:${ogUrl}`;
        } else if (ogUrl.startsWith('/')) {
          const origin = new URL(fullUrl).origin;
          ogUrl = `${origin}${ogUrl}`;
        }
        return NextResponse.json({
          success: true,
          previewUrl: ogUrl,
          source: 'opengraph',
        });
      }
    } catch {
      // If fetching fails or times out, fall through to screenshot preview
    }

    return NextResponse.json({
      success: true,
      previewUrl: screenshotFallback,
      source: 'screenshot',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
