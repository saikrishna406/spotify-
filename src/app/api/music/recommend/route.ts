import { NextRequest, NextResponse } from 'next/server';
import { Track } from '@/types';
import { inferSongMood } from '@/lib/recommendations/moodProfiler';
import { discoverCandidatesForTrack } from '@/lib/recommendations/candidateDiscovery';
import { rankCandidates, DEFAULT_WEIGHTS } from '@/lib/recommendations/recommenderEngine';
import { getUserTasteProfileFromDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const seedTrack: Track = body.seedTrack;
    const userId: string | undefined = body.userId;
    const recentHistory: Track[] = body.recentHistory || [];
    const customWeights = body.weights || DEFAULT_WEIGHTS;

    if (!seedTrack || !seedTrack.id) {
      return NextResponse.json({ error: 'seedTrack is required' }, { status: 400 });
    }

    // 1. Analyze Seed Song's Mood Profile
    const seedProfile = inferSongMood(seedTrack);

    // 2. Discover Candidate Pool from JioSaavn
    const candidates = await discoverCandidatesForTrack(seedTrack, 30);

    // 3. Retrieve User Taste Preferences (from DB/Supabase if user is logged in)
    let userTaste = body.userTaste || null;
    if (!userTaste && userId) {
      try {
        userTaste = await getUserTasteProfileFromDb(userId);
      } catch (e) {
        console.warn('[Recommend API] Failed to fetch taste from DB, continuing with default:', e);
      }
    }

    // 4. Score and Rank Candidates using Recommender Algorithm
    const rankedRecommendations = rankCandidates(
      seedTrack,
      candidates,
      userTaste,
      recentHistory,
      customWeights
    );

    return NextResponse.json({
      success: true,
      seedTrack: {
        id: seedTrack.id,
        name: seedTrack.name,
        artists: seedTrack.artists,
        mood: seedProfile.mood,
        moodLabel: seedProfile.moodLabel,
        energyLevel: seedProfile.energyLevel,
        valence: seedProfile.valence,
        tempoEstimate: seedProfile.tempoEstimate
      },
      topNext: rankedRecommendations[0] || null,
      recommendations: rankedRecommendations.slice(0, 10)
    });
  } catch (err: any) {
    console.error('[Recommend API] Error calculating recommendations:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to compute recommendations' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || 'seed-default';
    const name = searchParams.get('title') || searchParams.get('name') || '';
    const artists = searchParams.get('artist') || searchParams.get('artists') || 'Various Artists';
    const album = searchParams.get('album') || '';
    const language = searchParams.get('language') || 'hindi';
    const userId = searchParams.get('userId') || undefined;

    if (!name) {
      return NextResponse.json({ error: 'Song title or name is required' }, { status: 400 });
    }

    const seedTrack: Track = {
      id,
      name,
      artists,
      album,
      duration: 210,
      durationFormatted: '3:30',
      image: '',
      language
    };

    const seedProfile = inferSongMood(seedTrack);
    const candidates = await discoverCandidatesForTrack(seedTrack, 25);
    const rankedRecommendations = rankCandidates(seedTrack, candidates, null, []);

    return NextResponse.json({
      success: true,
      seedProfile,
      topNext: rankedRecommendations[0] || null,
      recommendations: rankedRecommendations.slice(0, 10)
    });
  } catch (err: any) {
    console.error('[Recommend API GET] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to compute recommendations' },
      { status: 500 }
    );
  }
}
