import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername, verifyUserPassword, getSupabaseUser } from '@/lib/db';
import { signUserToken } from '@/lib/auth';
import { isSupabaseConfigured, createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const trimmedInput = username.trim();

    // 1. If Supabase is configured, authenticate via Supabase Auth
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseServerClient();
      if (supabase) {
        const email = trimmedInput.includes('@')
          ? trimmedInput.toLowerCase()
          : trimmedInput.toLowerCase() + '@musicapp.com';

        const cleanUsername = trimmedInput.includes('@')
          ? trimmedInput.split('@')[0]
          : trimmedInput.toLowerCase();

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (error.message.includes('Email not confirmed')) {
            return NextResponse.json({
              error: 'Please confirm your email address, or disable "Confirm email" in Supabase Dashboard (Authentication -> Providers -> Email -> uncheck "Confirm email").'
            }, { status: 403 });
          }
          console.warn('Supabase login notice:', error.message);
        } else if (data.user) {
          let userProfile = await getSupabaseUser(data.user.id);
          if (!userProfile) {
            userProfile = {
              id: data.user.id,
              username: (data.user.user_metadata?.username as string) || cleanUsername,
              displayName: (data.user.user_metadata?.display_name as string) || cleanUsername,
              avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
              likedSongIds: [],
              likedSongsData: [],
              playlists: []
            };
          }

          const token = signUserToken({ id: userProfile.id, username: userProfile.username });
          const res = NextResponse.json({ success: true, user: userProfile });
          res.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60,
            path: '/'
          });
          return res;
        }
      }
    }

    // 2. Fallback to local accounts
    const user = findUserByUsername(trimmedInput);
    if (!user) {
      return NextResponse.json({ error: 'User not found. Please check your username or sign up for a free account.' }, { status: 404 });
    }

    const isValid = verifyUserPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password. Default password is <username>123' }, { status: 401 });
    }

    const token = signUserToken(user);
    const { passwordHash, ...safeUser } = user;

    const res = NextResponse.json({ success: true, user: safeUser });
    res.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/'
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
