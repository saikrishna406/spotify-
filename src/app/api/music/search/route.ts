import { NextRequest, NextResponse } from 'next/server';
import { searchSongs } from '@/lib/saavn';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || 'telugu';
    const page = parseInt(searchParams.get('p') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const songs = await searchSongs(query, page, limit);
    return NextResponse.json({
      query,
      count: songs.length,
      songs
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
