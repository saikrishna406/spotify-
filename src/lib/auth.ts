import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { findUserById, getSupabaseUser } from './db';
import { User } from '@/types';
import { isSupabaseConfigured, createClient as createSupabaseServerClient } from './supabase/server';

const JWT_SECRET = process.env.JWT_SECRET || 'spotify-telugu-tamil-hindi-super-secret-key-2026';

export function signUserToken(user: { id: string; username: string }): string {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: '30d'
  });
}

export function verifyUserToken(token: string): { id: string; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; username: string };
  } catch (err) {
    return null;
  }
}

export async function getCurrentUserFromCookies(): Promise<User | null> {
  // 1. If Supabase is configured, check Supabase Auth session first
  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseServerClient();
      if (supabase) {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (authUser && !error) {
          const userDetails = await getSupabaseUser(authUser.id);
          if (userDetails) return userDetails;

          return {
            id: authUser.id,
            username: (authUser.user_metadata?.username as string) || authUser.email?.split('@')[0] || 'user',
            displayName: (authUser.user_metadata?.display_name as string) || authUser.email?.split('@')[0] || 'User',
            avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
            likedSongIds: [],
            likedSongsData: [],
            playlists: []
          };
        }
      }
    } catch (e) {
      console.warn('Supabase session check error, falling back:', e);
    }
  }

  // 2. Fallback to local JWT cookie session
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  const decoded = verifyUserToken(token);
  if (!decoded) return null;

  // If Supabase has this user id, fetch profile from Supabase
  if (isSupabaseConfigured()) {
    try {
      const supaUser = await getSupabaseUser(decoded.id);
      if (supaUser) return supaUser;
    } catch (e) {}
  }

  const record = findUserById(decoded.id);
  if (!record) return null;

  const { passwordHash, ...safeUser } = record;
  return safeUser;
}
