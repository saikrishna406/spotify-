import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from '@/lib/auth';
import { toggleLikedSong, toggleSupabaseLikedSong, findUserByUsername } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export async function GET() {
  try {
    let user = await getCurrentUserFromCookies();
    if (!user) {
      const defaultUser = findUserByUsername('sai');
      if (defaultUser) {
        const { passwordHash, ...safe } = defaultUser;
        user = safe;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      likedSongIds: user.likedSongIds,
      likedSongsData: user.likedSongsData
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let user = await getCurrentUserFromCookies();
    if (!user) {
      const defaultUser = findUserByUsername('sai');
      if (defaultUser) {
        const { passwordHash, ...safe } = defaultUser;
        user = safe;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { track } = await req.json();
    if (!track || !track.id) {
      return NextResponse.json({ error: 'Track required' }, { status: 400 });
    }

    if (isSupabaseConfigured() && user.id.includes('-') && user.id.length > 20) {
      const result = await toggleSupabaseLikedSong(user.id, track);
      return NextResponse.json(result);
    }

    const result = toggleLikedSong(user.id, track);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
