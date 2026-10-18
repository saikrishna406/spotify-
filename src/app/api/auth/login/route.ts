import { NextRequest, NextResponse } from 'next/server';
import { findUserByUsername, verifyUserPassword } from '@/lib/db';
import { signUserToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

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
