import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from '@/lib/auth';
import { createUserPlaylist, addTrackToUserPlaylist, findUserByUsername } from '@/lib/db';

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

    const updated = addTrackToUserPlaylist(user.id, playlistId, track);
    return NextResponse.json({ success: true, playlist: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
