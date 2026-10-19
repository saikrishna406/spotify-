import { NextResponse } from 'next/server';
import { isSupabaseConfigured, createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    if (isSupabaseConfigured()) {
      const supabase = createSupabaseServerClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
  } catch (e) {
    console.warn('Supabase signOut error:', e);
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete('auth_token');
  return res;
}
