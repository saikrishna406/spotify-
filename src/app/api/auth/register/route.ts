import { NextRequest, NextResponse } from 'next/server';
import { registerNewUser, getSupabaseUser } from '@/lib/db';
import { signUserToken } from '@/lib/auth';
import { isSupabaseConfigured, createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password, displayName } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }

    const trimmedInput = username.trim();

    // 1. If Supabase is configured, register via Supabase Auth
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseServerClient();
      if (supabase) {
        const email = trimmedInput.includes('@')
          ? trimmedInput.toLowerCase()
          : `${trimmedInput.toLowerCase()}@musicapp.com`;

        const cleanUsername = trimmedInput.includes('@')
          ? trimmedInput.split('@')[0]
          : trimmedInput.toLowerCase();

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: cleanUsername,
              display_name: displayName || cleanUsername
            }
          }
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (data.user) {
          // Wait briefly for trigger execution if needed
          let userProfile = await getSupabaseUser(data.user.id);
          if (!userProfile) {
            await new Promise(r => setTimeout(r, 400));
            userProfile = await getSupabaseUser(data.user.id);
          }

          if (userProfile) {
            const token = signUserToken({ id: userProfile.id, username: userProfile.username });
            const res = NextResponse.json({
              success: true,
              user: userProfile,
              sessionActive: !!data.session
            });
            res.cookies.set('auth_token', token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 30 * 24 * 60 * 60,
              path: '/'
            });
            return res;
          }

          return NextResponse.json({
            success: true,
            user: {
              id: data.user.id,
              username: cleanUsername,
              displayName: displayName || cleanUsername,
              avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
              likedSongIds: [],
              likedSongsData: [],
              playlists: []
            },
            sessionActive: !!data.session
          });
        }
      }
    }

    // 2. Fallback to local accounts
    const newUser = registerNewUser(trimmedInput, password, displayName);
    const token = signUserToken(newUser);
    const { passwordHash, ...safeUser } = newUser;

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
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 400 });
  }
}
