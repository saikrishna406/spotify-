import { isSupabaseConfigured, createClient as createSupabaseServerClient } from './supabase/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Track, UserPlaylist, UserTasteProfile, ListeningEvent } from '@/types';

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? path.join('/tmp', 'music-data') : path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// In-memory cache fallback for serverless execution
let memoryUsersCache: UserRecord[] | null = null;

// Initial 10 friend accounts with pre-configured profiles
const SEED_USERS = [
  { username: 'sai', name: 'Sai Krishna', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' },
  { username: 'de', name: 'Developer (Admin)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80' },
  { username: 'rahul', name: 'Rahul Sharma', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80' },
  { username: 'priya', name: 'Priya Reddy', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80' },
  { username: 'karthik', name: 'Karthik Raja', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80' },
  { username: 'ananya', name: 'Ananya Iyer', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80' },
  { username: 'vikram', name: 'Vikram Seth', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80' },
  { username: 'sneha', name: 'Sneha Patel', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80' },
  { username: 'suresh', name: 'Suresh Kumar', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80' },
  { username: 'meera', name: 'Meera Nair', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80' }
];

interface UserRecord extends User {
  passwordHash: string;
}

function ensureDbFile(): UserRecord[] {
  if (memoryUsersCache && memoryUsersCache.length > 0) {
    return memoryUsersCache;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(USERS_FILE)) {
      const raw = fs.readFileSync(USERS_FILE, 'utf-8');
      memoryUsersCache = JSON.parse(raw);
      return memoryUsersCache!;
    }
  } catch (e) {
    console.warn('Filesystem access limited, using memory fallback');
  }

  // Generate default friends seed
  const users: UserRecord[] = SEED_USERS.map((u, i) => ({
    id: `usr-${i + 1}`,
    username: u.username,
    displayName: u.name,
    avatarUrl: u.avatar,
    passwordHash: bcrypt.hashSync(`${u.username}123`, 10),
    likedSongIds: [],
    likedSongsData: [],
    playlists: [
      {
        id: `pl-${u.username}-1`,
        name: `${u.name}'s Favorites`,
        description: `Personal favorites created by ${u.name}`,
        trackIds: [],
        tracks: [],
        createdAt: new Date().toISOString()
      }
    ]
  }));

  memoryUsersCache = users;
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (e) {
    // Read-only filesystem on serverless
  }
  return users;
}

function saveUsers(users: UserRecord[]) {
  memoryUsersCache = users;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    // Read-only filesystem on serverless
  }
}

export function getAllUsersSafe(): Omit<User, 'passwordHash'>[] {
  const users = ensureDbFile();
  return users.map(({ passwordHash, ...safe }) => safe);
}

export function findUserByUsername(username: string): UserRecord | null {
  const users = ensureDbFile();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export function findUserById(id: string): UserRecord | null {
  const users = ensureDbFile();
  return users.find(u => u.id === id) || null;
}

export function registerNewUser(username: string, plainPass: string, displayName?: string): UserRecord {
  const users = ensureDbFile();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Username already exists');
  }

  const newUser: UserRecord = {
    id: `usr-${Date.now()}`,
    username: username.toLowerCase().trim(),
    displayName: displayName || username,
    avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80`,
    passwordHash: bcrypt.hashSync(plainPass, 10),
    likedSongIds: [],
    likedSongsData: [],
    playlists: [
      {
        id: `pl-${Date.now()}`,
        name: 'My Playlist #1',
        description: 'New user playlist',
        trackIds: [],
        tracks: [],
        createdAt: new Date().toISOString()
      }
    ]
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function verifyUserPassword(plainPass: string, hash: string): boolean {
  return bcrypt.compareSync(plainPass, hash);
}

export function toggleLikedSong(userId: string, track: Track): { isLiked: boolean; user: User } {
  const users = ensureDbFile();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  const idx = user.likedSongIds.indexOf(track.id);
  let isLiked = false;

  if (idx >= 0) {
    user.likedSongIds.splice(idx, 1);
    user.likedSongsData = user.likedSongsData.filter(t => t.id !== track.id);
    isLiked = false;
  } else {
    user.likedSongIds.unshift(track.id);
    user.likedSongsData.unshift(track);
    isLiked = true;
  }

  saveUsers(users);
  const { passwordHash, ...safeUser } = user;
  return { isLiked, user: safeUser };
}

export function createUserPlaylist(userId: string, name: string, description = ''): UserPlaylist {
  const users = ensureDbFile();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  const newPl: UserPlaylist = {
    id: `pl-${Date.now()}`,
    name: name || `My Playlist #${user.playlists.length + 1}`,
    description: description || 'Created with Spotify India',
    trackIds: [],
    tracks: [],
    createdAt: new Date().toISOString()
  };

  user.playlists.unshift(newPl);
  saveUsers(users);
  return newPl;
}


export function deleteUserPlaylist(userId: string, playlistId: string): boolean {
  const users = ensureDbFile();
  const user = users.find(u => u.id === userId);
  if (!user) return false;

  user.playlists = user.playlists.filter(p => p.id !== playlistId);
  saveUsers(users);
  return true;
}

export function removeTrackFromUserPlaylist(userId: string, playlistId: string, trackId: string): UserPlaylist {
  const users = ensureDbFile();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  const pl = user.playlists.find(p => p.id === playlistId);
  if (!pl) throw new Error('Playlist not found');

  pl.trackIds = pl.trackIds.filter(id => id !== trackId);
  pl.tracks = pl.tracks.filter(t => t.id !== trackId);
  saveUsers(users);
  return pl;
}

export function addTrackToUserPlaylist(userId: string, playlistId: string, track: Track): UserPlaylist {
  const users = ensureDbFile();
  const user = users.find(u => u.id === userId);
  if (!user) throw new Error('User not found');

  const pl = user.playlists.find(p => p.id === playlistId);
  if (!pl) throw new Error('Playlist not found');

  if (!pl.trackIds.includes(track.id)) {
    pl.trackIds.push(track.id);
    pl.tracks.push(track);
    saveUsers(users);
  }
  return pl;
}

// ==========================================
// SUPABASE DATABASE OPERATIONS
// ==========================================

export async function getSupabaseUser(userId: string): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createSupabaseServerClient();
    if (!supabase) return null;

    // 1. Fetch Profile
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileErr || !profile) return null;

    // 2. Fetch Liked Songs
    const { data: likedRows } = await supabase
      .from('liked_songs')
      .select('track_id, track_data')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const likedSongIds = (likedRows || []).map(r => r.track_id);
    const likedSongsData = (likedRows || []).map(r => r.track_data as Track);

    // 3. Fetch Playlists with Tracks
    const { data: playlists } = await supabase
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    const userPlaylists: UserPlaylist[] = [];
    if (playlists) {
      for (const pl of playlists) {
        const { data: trackRows } = await supabase
          .from('playlist_tracks')
          .select('track_id, track_data')
          .eq('playlist_id', pl.id)
          .order('position', { ascending: true });

        userPlaylists.push({
          id: pl.id,
          name: pl.name,
          description: pl.description || '',
          trackIds: (trackRows || []).map(t => t.track_id),
          tracks: (trackRows || []).map(t => t.track_data as Track),
          createdAt: pl.created_at
        });
      }
    }

    return {
      id: profile.id,
      username: profile.username,
      displayName: profile.display_name || profile.username,
      avatarUrl: profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
      likedSongIds,
      likedSongsData,
      playlists: userPlaylists
    };
  } catch (err) {
    console.error('getSupabaseUser error:', err);
    return null;
  }
}

export async function toggleSupabaseLikedSong(userId: string, track: Track): Promise<{ isLiked: boolean; user: User }> {
  const supabase = createSupabaseServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  // Check if already liked
  const { data: existing } = await supabase
    .from('liked_songs')
    .select('id')
    .eq('user_id', userId)
    .eq('track_id', track.id)
    .maybeSingle();

  let isLiked = false;
  if (existing) {
    await supabase.from('liked_songs').delete().eq('id', existing.id);
    isLiked = false;
  } else {
    await supabase.from('liked_songs').insert({
      user_id: userId,
      track_id: track.id,
      track_data: track
    });
    isLiked = true;
  }

  const user = await getSupabaseUser(userId);
  if (!user) throw new Error('Failed to reload user from Supabase');
  return { isLiked, user };
}

export async function createSupabasePlaylist(userId: string, name: string, description = ''): Promise<UserPlaylist> {
  const supabase = createSupabaseServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  const { data: pl, error } = await supabase
    .from('playlists')
    .insert({
      user_id: userId,
      name,
      description
    })
    .select()
    .single();

  if (error || !pl) throw new Error(error?.message || 'Failed to create playlist');

  return {
    id: pl.id,
    name: pl.name,
    description: pl.description || '',
    trackIds: [],
    tracks: [],
    createdAt: pl.created_at
  };
}

export async function addTrackToSupabasePlaylist(userId: string, playlistId: string, track: Track): Promise<UserPlaylist> {
  const supabase = createSupabaseServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  // Add track to playlist_tracks
  await supabase
    .from('playlist_tracks')
    .insert({
      playlist_id: playlistId,
      track_id: track.id,
      track_data: track
    });

  // Re-fetch playlist
  const { data: pl } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', playlistId)
    .single();

  const { data: trackRows } = await supabase
    .from('playlist_tracks')
    .select('track_id, track_data')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true });

  return {
    id: pl.id,
    name: pl.name,
    description: pl.description || '',
    trackIds: (trackRows || []).map(t => t.track_id),
    tracks: (trackRows || []).map(t => t.track_data as Track),
    createdAt: pl.created_at
  };
}


export async function deleteSupabasePlaylist(userId: string, playlistId: string): Promise<boolean> {
  const supabase = createSupabaseServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  // Delete tracks first
  await supabase.from('playlist_tracks').delete().eq('playlist_id', playlistId);
  // Delete playlist
  const { error } = await supabase.from('playlists').delete().eq('id', playlistId).eq('user_id', userId);
  if (error) throw new Error(error.message);
  return true;
}

export async function removeTrackFromSupabasePlaylist(userId: string, playlistId: string, trackId: string): Promise<UserPlaylist> {
  const supabase = createSupabaseServerClient();
  if (!supabase) throw new Error('Supabase client not initialized');

  await supabase
    .from('playlist_tracks')
    .delete()
    .eq('playlist_id', playlistId)
    .eq('track_id', trackId);

  // Re-fetch playlist
  const { data: pl } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', playlistId)
    .single();

  const { data: trackRows } = await supabase
    .from('playlist_tracks')
    .select('track_id, track_data')
    .eq('playlist_id', playlistId)
    .order('position', { ascending: true });

  return {
    id: pl.id,
    name: pl.name,
    description: pl.description || '',
    trackIds: (trackRows || []).map(t => t.track_id),
    tracks: (trackRows || []).map(t => t.track_data as Track),
    createdAt: pl.created_at
  };
}

// ==========================================
// USER LISTENING BEHAVIOR & TASTE PROFILING
// ==========================================

export async function recordListeningEventInDb(
  userId: string,
  track: Track,
  eventType: 'complete' | 'skip' | 'replay' | 'like',
  dwellSeconds = 0
): Promise<void> {
  // 1. Try Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServerClient();
      if (supabase) {
        await supabase.from('listening_events').insert({
          user_id: userId,
          track_id: track.id,
          track_data: track,
          event_type: eventType,
          dwell_seconds: dwellSeconds
        });
        return;
      }
    } catch (e) {
      console.warn('[DB] Supabase listening_events insert failed, falling back to local:', e);
    }
  }

  // 2. Local fallback
  try {
    const users = ensureDbFile();
    const user: any = users.find(u => u.id === userId);
    if (user) {
      if (!user.listeningEvents) user.listeningEvents = [];
      user.listeningEvents.unshift({
        trackId: track.id,
        eventType,
        dwellSeconds,
        createdAt: new Date().toISOString()
      });
      if (user.listeningEvents.length > 100) {
        user.listeningEvents.pop();
      }
      saveUsers(users);
    }
  } catch (err) {
    // Non-fatal
  }
}

export async function getUserTasteProfileFromDb(userId: string): Promise<UserTasteProfile | null> {
  // 1. Try Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServerClient();
      if (supabase) {
        // Fetch recently skipped track IDs
        const { data: skipRows } = await supabase
          .from('listening_events')
          .select('track_id')
          .eq('user_id', userId)
          .eq('event_type', 'skip')
          .order('created_at', { ascending: false })
          .limit(25);

        const recentlySkippedTrackIds = (skipRows || []).map(r => r.track_id);

        // Fetch user preferences
        const { data: pref } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (pref) {
          return {
            preferredLanguages: pref.preferred_languages || [],
            topArtists: pref.top_artists || {},
            topMoods: pref.top_moods || {},
            totalPlays: 0,
            totalCompletions: 0,
            totalSkips: recentlySkippedTrackIds.length,
            recentlySkippedTrackIds
          };
        }
      }
    } catch (e) {
      console.warn('[DB] Supabase getUserTasteProfile error:', e);
    }
  }

  // 2. Local fallback
  const user = findUserById(userId);
  if (!user) return null;

  const topArtists: Record<string, number> = {};
  const preferredLanguages: string[] = [];

  for (const t of user.likedSongsData || []) {
    if (t.artists) {
      for (const a of t.artists.split(',')) {
        const clean = a.trim();
        topArtists[clean] = (topArtists[clean] || 0) + 2;
      }
    }
    if (t.language && !preferredLanguages.includes(t.language.toLowerCase())) {
      preferredLanguages.push(t.language.toLowerCase());
    }
  }

  return {
    preferredLanguages,
    topArtists,
    topMoods: {},
    totalPlays: 0,
    totalCompletions: 0,
    totalSkips: 0,
    recentlySkippedTrackIds: []
  };
}
