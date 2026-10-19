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

    // 1. If Supabase is configured, register via Supabase Auth
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseServerClient();
      if (supabase) {
        const email = username.includes('@') ? username : `${username.toLowerCase().trim()}@musicapp.local`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username.toLowerCase().trim(),
              display_name: displayName || username
            }
          }
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }

        if (data.user) {
          const userProfile = await getSupabaseUser(data.user.id);
          return NextResponse.json({ success: true, user: userProfile });
        }
      }
    }

    // 2. Fallback to local accounts
    const newUser = registerNewUser(username, password, displayName);
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
