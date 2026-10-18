import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User, Track, UserPlaylist } from '@/types';

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
