import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { findUserById } from './db';
import { User } from '@/types';

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
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  const decoded = verifyUserToken(token);
  if (!decoded) return null;

  const record = findUserById(decoded.id);
  if (!record) return null;

  const { passwordHash, ...safeUser } = record;
  return safeUser;
}
