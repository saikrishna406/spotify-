import { NextRequest, NextResponse } from 'next/server';
import { recordListeningEventInDb, getUserTasteProfileFromDb } from '@/lib/db';
import { Track } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { trackId, trackData, eventType, dwellSeconds, userId } = body;

    if (!trackId || !eventType) {
      return NextResponse.json({ error: 'trackId and eventType are required' }, { status: 400 });
    }

    if (userId) {
      await recordListeningEventInDb(userId, trackData, eventType, dwellSeconds || 0);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[User Events API] Error recording listening event:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const taste = await getUserTasteProfileFromDb(userId);
    return NextResponse.json({ success: true, taste });
  } catch (err: any) {
    console.error('[User Events API GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
