import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface LyricLine {
  time: number;
  text: string;
}

function parseLrc(lrcText: string): LyricLine[] {
  const lines: LyricLine[] = [];
  const rawLines = lrcText.split('\n');
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;

  for (const raw of rawLines) {
    const match = raw.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const ms = parseFloat('0.' + match[3]);
      const time = minutes * 60 + seconds + ms;
      const text = match[4].trim();
      if (text) {
        lines.push({ time, text });
      }
    }
  }

  return lines;
}

function cleanTitle(str: string): string {
  return str
    .replace(/\(From\s+".*?"\)/gi, '')
    .replace(/\(Original.*?\)/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/- Single/gi, '')
    .replace(/- Part \d+/gi, '')
    .trim();
}

function cleanArtist(str: string): string {
  return str.split(',')[0].split('&')[0].trim();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const trackName = searchParams.get('title') || '';
    const artistName = searchParams.get('artist') || '';
    const trackId = searchParams.get('id') || '';
    const duration = parseInt(searchParams.get('duration') || '210', 10);

    const titleClean = cleanTitle(trackName);
    const artistClean = cleanArtist(artistName);

    // 1. Try LRCLIB for real-time synchronized timestamped lyrics
    try {
      const lrclibUrl = `https://lrclib.net/api/get?track_name=${encodeURIComponent(titleClean)}&artist_name=${encodeURIComponent(artistClean)}`;
      const res = await fetch(lrclibUrl, {
        headers: { 'User-Agent': 'MusicApp/1.0' },
        next: { revalidate: 3600 }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.syncedLyrics) {
          const lines = parseLrc(data.syncedLyrics);
          if (lines.length > 0) {
            return NextResponse.json({
              synced: true,
              lines,
              source: 'lrclib'
            });
          }
        } else if (data.plainLyrics) {
          const rawLines = data.plainLyrics
            .split('\n')
            .map((l: string) => l.trim())
            .filter((l: string) => l.length > 0);

          const stepTime = duration > 0 ? duration / (rawLines.length + 1) : 4;
          const lines: LyricLine[] = rawLines.map((text: string, i: number) => ({
            time: Math.round(i * stepTime * 10) / 10,
            text
          }));

          return NextResponse.json({
            synced: false,
            lines,
            source: 'lrclib-plain'
          });
        }
      }
    } catch (e) {
      console.warn('LRCLIB fetch error:', e);
    }

    // 2. Try JioSaavn official lyrics endpoint
    if (trackId) {
      try {
        const saavnUrl = `https://www.jiosaavn.com/api.php?__call=lyrics.getLyrics&lyrics_id=${encodeURIComponent(trackId)}&ctx=web6dot0&_format=json`;
        const res = await fetch(saavnUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 3600 }
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.lyrics) {
            const rawLines = data.lyrics
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/&amp;/g, '&')
              .replace(/&#039;/g, "'")
              .replace(/&quot;/g, '"')
              .split('\n')
              .map((l: string) => l.trim())
              .filter((l: string) => l.length > 0);

            const stepTime = duration > 0 ? duration / (rawLines.length + 1) : 4;
            const lines: LyricLine[] = rawLines.map((text: string, i: number) => ({
              time: Math.round(i * stepTime * 10) / 10,
              text
            }));

            return NextResponse.json({
              synced: false,
              lines,
              source: 'jiosaavn'
            });
          }
        }
      } catch (e) {
        console.warn('Saavn lyrics fetch error:', e);
      }
    }

    // 3. Fallback when lyrics not found
    return NextResponse.json({
      synced: false,
      lines: [
        { time: 0, text: `♪ Listening to "${trackName}"` },
        { time: 2, text: `♪ By ${artistName}` },
        { time: 5, text: "Lyrics aren't available for this track yet." }
      ],
      source: 'fallback'
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
