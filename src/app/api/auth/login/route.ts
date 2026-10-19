import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername, verifyUserPassword, getSupabaseUser } from '@/lib/db';
import { signUserToken } from '@/lib/auth';
import { isSupabaseConfigured, createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    // 1. If Supabase is configured, authenticate via Supabase Auth
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseServerClient();
      if (supabase) {
        // Support email or auto-generated email format for username
        const email = username.includes('@') ? username : `${username.toLowerCase()}@musicapp.local`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (!error && data.user) {
          const userProfile = await getSupabaseUser(data.user.id);
          return NextResponse.json({ success: true, user: userProfile });
        }
      }
    }

    // 2. Fallback to local accounts
    const user = findUserByUsername(username);
    if (!user) {
      return NextResponse.json({ error: 'User not found. Use one of the 10 friend profiles or register.' }, { status: 404 });
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
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
