export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from '@/lib/auth';
import { createUserPlaylist, addTrackToUserPlaylist, createSupabasePlaylist, addTrackToSupabasePlaylist, findUserByUsername } from '@/lib/db';
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

    return NextResponse.json({ playlists: user.playlists });
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

    const { name, description } = await req.json();

    if (isSupabaseConfigured() && user.id.includes('-') && user.id.length > 20) {
      const playlist = await createSupabasePlaylist(user.id, name, description);
      return NextResponse.json({ success: true, playlist });
    }

    const playlist = createUserPlaylist(user.id, name, description);
    return NextResponse.json({ success: true, playlist });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
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

    const { playlistId, track } = await req.json();
    if (!playlistId || !track) {
      return NextResponse.json({ error: 'playlistId and track required' }, { status: 400 });
    }

    if (isSupabaseConfigured() && user.id.includes('-') && user.id.length > 20) {
      const updated = await addTrackToSupabasePlaylist(user.id, playlistId, track);
      return NextResponse.json({ success: true, playlist: updated });
    }

    const updated = addTrackToUserPlaylist(user.id, playlistId, track);
    return NextResponse.json({ success: true, playlist: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
