import { NextRequest, NextResponse } from 'next/server';
import { registerNewUser } from '@/lib/db';
import { signUserToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password, displayName } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ error: 'Password must be at least 4 characters' }, { status: 400 });
    }

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
