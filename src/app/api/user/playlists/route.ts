import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from '@/lib/auth';
import {
  createUserPlaylist,
  addTrackToUserPlaylist,
  createSupabasePlaylist,
  addTrackToSupabasePlaylist,
  deleteUserPlaylist,
  removeTrackFromUserPlaylist,
  deleteSupabasePlaylist,
  removeTrackFromSupabasePlaylist
} from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUserFromCookies();
    if (!user) {
      return NextResponse.json({ playlists: [] });
    }

    return NextResponse.json({ playlists: user.playlists });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to create playlists' }, { status: 401 });
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
    const user = await getCurrentUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to edit playlists' }, { status: 401 });
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

export async function DELETE(req: NextRequest) {
  try {
    const user = await getCurrentUserFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Please log in to manage playlists' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const playlistId = searchParams.get('playlistId');
    const trackId = searchParams.get('trackId');

    if (!playlistId) {
      return NextResponse.json({ error: 'playlistId is required' }, { status: 400 });
    }

    // Case 1: Remove track from playlist
    if (trackId) {
      if (isSupabaseConfigured() && user.id.includes('-') && user.id.length > 20) {
        const updated = await removeTrackFromSupabasePlaylist(user.id, playlistId, trackId);
        return NextResponse.json({ success: true, playlist: updated });
      }

      const updated = removeTrackFromUserPlaylist(user.id, playlistId, trackId);
      return NextResponse.json({ success: true, playlist: updated });
    }

    // Case 2: Delete entire playlist
    if (isSupabaseConfigured() && user.id.includes('-') && user.id.length > 20) {
      await deleteSupabasePlaylist(user.id, playlistId);
      return NextResponse.json({ success: true, deletedPlaylistId: playlistId });
    }

    const deleted = deleteUserPlaylist(user.id, playlistId);
    return NextResponse.json({ success: deleted, deletedPlaylistId: playlistId });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
