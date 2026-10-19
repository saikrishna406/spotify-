export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getCurrentUserFromCookies } from '@/lib/auth';
import { getAllUsersSafe, findUserByUsername } from '@/lib/db';

export async function GET() {
  try {
    let user = await getCurrentUserFromCookies();
    const allFriends = getAllUsersSafe();

    // Default to 'sai' if no user session yet so app is immediately usable
    if (!user && allFriends.length > 0) {
      const defaultUser = findUserByUsername('sai');
      if (defaultUser) {
        const { passwordHash, ...safe } = defaultUser;
        user = safe;
      }
    }

    return NextResponse.json({
      user,
      allFriends
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
