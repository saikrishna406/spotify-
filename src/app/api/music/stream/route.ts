import { NextRequest, NextResponse } from 'next/server';
import { getStreamUrl, getSongDetails } from '@/lib/saavn';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const encryptedUrl = searchParams.get('url');
    const songId = searchParams.get('id');
    const format = searchParams.get('format');

    let cdnUrl: string | null = null;

    if (encryptedUrl) {
      cdnUrl = await getStreamUrl(encryptedUrl, '160');
    } else if (songId) {
      const details = await getSongDetails(songId);
      if (details?.encryptedMediaUrl) {
        cdnUrl = await getStreamUrl(details.encryptedMediaUrl, '160');
      }
    }

    if (!cdnUrl) {
      return NextResponse.json({ error: 'Unable to resolve stream URL' }, { status: 404 });
    }

    // If client specifically requested JSON metadata
    if (format === 'json') {
      return NextResponse.json({ streamUrl: cdnUrl });
    }

    // Direct audio streaming proxy: passes verified Referer and User-Agent to bypass Akamai/CloudFront CDN 403
    const incomingRange = req.headers.get('range');
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.jiosaavn.com/',
      'Origin': 'https://www.jiosaavn.com'
    };

    if (incomingRange) {
      fetchHeaders['Range'] = incomingRange;
    }

    const cdnRes = await fetch(cdnUrl, {
      headers: fetchHeaders
    });

    if (!cdnRes.ok && cdnRes.status !== 206) {
      console.warn('CDN returned non-200 status:', cdnRes.status);
      return NextResponse.json({ error: 'CDN access denied', status: cdnRes.status }, { status: cdnRes.status });
    }

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', cdnRes.headers.get('content-type') || 'audio/mp4');
    responseHeaders.set('Accept-Ranges', 'bytes');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Cache-Control', 'public, max-age=86400');

    const contentRange = cdnRes.headers.get('content-range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }
    const contentLength = cdnRes.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    return new Response(cdnRes.body, {
      status: cdnRes.status,
      headers: responseHeaders
    });
  } catch (err: any) {
    console.error('Audio stream proxy error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
