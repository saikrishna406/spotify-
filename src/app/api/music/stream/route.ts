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

    // Direct 307 Redirect to high-speed signed CloudFront CDN:
    // Enables browser hardware-accelerated playback, instant range seek, and zero Node stream bottlenecks.
    return NextResponse.redirect(cdnUrl, 307);
  } catch (err: any) {
    console.error('Audio stream error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
