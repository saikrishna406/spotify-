import { Track, MoodCategory, SongProfile, RecommendedTrack, UserTasteProfile } from '@/types';
import { inferSongMood } from './moodProfiler';

export interface RecommendationWeights {
  moodSimilarity: number;
  languageMatch: number;
  artistAffinity: number;
  userPreferenceScore: number;
}

export const DEFAULT_WEIGHTS: RecommendationWeights = {
  moodSimilarity: 0.35,
  languageMatch: 0.25,
  artistAffinity: 0.15,
  userPreferenceScore: 0.25
};

// Check if two mood categories are musically compatible
function getMoodCompatibility(m1: MoodCategory, m2: MoodCategory): number {
  if (m1 === m2) return 1.0;

  const compatiblePairs: [MoodCategory, MoodCategory][] = [
    ['romantic_melody', 'chill_lofi'],
    ['romantic_melody', 'folk_acoustic'],
    ['chill_lofi', 'melancholic_sad'],
    ['energetic_dance', 'anthem_inspirational'],
    ['folk_acoustic', 'anthem_inspirational']
  ];

  for (const [a, b] of compatiblePairs) {
    if ((m1 === a && m2 === b) || (m1 === b && m2 === a)) {
      return 0.65;
    }
  }

  // Melancholy vs Party is a clash
  if ((m1 === 'melancholic_sad' && m2 === 'energetic_dance') ||
      (m1 === 'energetic_dance' && m2 === 'melancholic_sad')) {
    return 0.10;
  }

  return 0.35;
}

export function rankCandidates(
  seedTrack: Track,
  candidates: Track[],
  userTaste?: UserTasteProfile | null,
  recentHistory: Track[] = [],
  weights: RecommendationWeights = DEFAULT_WEIGHTS
): RecommendedTrack[] {
  const seedProfile = inferSongMood(seedTrack);
  const recentHistoryIds = new Set(recentHistory.map(t => t.id));
  const recentArtists = new Set(recentHistory.slice(0, 3).map(t => (t.artists || '').toLowerCase()));
  const skippedSet = new Set(userTaste?.recentlySkippedTrackIds || []);

  const scoredList: RecommendedTrack[] = [];

  for (const candidate of candidates) {
    if (!candidate || !candidate.id || candidate.id === seedTrack.id) continue;

    const candProfile = inferSongMood(candidate);
    const reasons: string[] = [];

    // 1. Mood Similarity Component (0.0 to 1.0)
    const moodCatScore = getMoodCompatibility(seedProfile.mood, candProfile.mood);
    const energyDelta = Math.abs(seedProfile.energyLevel - candProfile.energyLevel);
    const energyScore = Math.max(0, 1 - energyDelta * 1.2);

    const valenceDelta = Math.abs(seedProfile.valence - candProfile.valence);
    const valenceScore = Math.max(0, 1 - valenceDelta);

    const tempoScore = (seedProfile.tempoEstimate === candProfile.tempoEstimate)
      ? 1.0
      : (seedProfile.tempoEstimate === 'medium' || candProfile.tempoEstimate === 'medium')
        ? 0.6
        : 0.1;

    const moodScore = (moodCatScore * 0.45) + (energyScore * 0.25) + (valenceScore * 0.15) + (tempoScore * 0.15);

    if (seedProfile.mood === candProfile.mood) {
      reasons.push(`Matching ${candProfile.moodLabel}`);
    } else if (moodCatScore >= 0.6) {
      reasons.push('Harmonious musical mood');
    }

    if (energyDelta < 0.2) {
      reasons.push('Similar tempo and energy');
    }

    // 2. Language Match Component (0.0 to 1.0)
    let langScore = 0.4;
    if (seedProfile.language && candProfile.language && seedProfile.language === candProfile.language) {
      langScore = 1.0;
      reasons.push(`${candProfile.language.toUpperCase()} language match`);
    }

    // 3. Artist Affinity Component (0.0 to 1.0)
    let artistScore = 0.2;
    const hasSharedArtist = seedProfile.primaryArtists.some(a => 
      candProfile.primaryArtists.some(ca => ca.toLowerCase() === a.toLowerCase())
    );

    if (hasSharedArtist) {
      artistScore = 1.0;
      reasons.push('Featuring related artist');
    } else if (seedTrack.album && candidate.album && seedTrack.album.toLowerCase() === candidate.album.toLowerCase()) {
      artistScore = 0.8;
      reasons.push(`From album ${candidate.album}`);
    }

    // 4. Personalized User Preference Component (0.0 to 1.0)
    let userPrefScore = 0.5; // neutral baseline for guest users
    if (userTaste) {
      let prefPoints = 0;
      let totalChecks = 0;

      // Check user language preference
      if (userTaste.preferredLanguages && userTaste.preferredLanguages.length > 0) {
        totalChecks += 1;
        if (userTaste.preferredLanguages.includes(candProfile.language)) {
          prefPoints += 1.0;
        }
      }

      // Check if user likes this artist
      if (userTaste.topArtists) {
        totalChecks += 1;
        const artistMatch = candProfile.primaryArtists.some(a => userTaste.topArtists[a]);
        if (artistMatch) {
          prefPoints += 1.0;
          reasons.push('Matches your frequent artists');
        }
      }

      // Check if user frequently listens to this mood
      if (userTaste.topMoods && userTaste.topMoods[candProfile.mood]) {
        totalChecks += 1;
        prefPoints += 0.9;
      }

      if (totalChecks > 0) {
        userPrefScore = prefPoints / totalChecks;
      }
    }

    // 5. Compute Weighted Raw Score
    let totalScore =
      (moodScore * weights.moodSimilarity) +
      (langScore * weights.languageMatch) +
      (artistScore * weights.artistAffinity) +
      (userPrefScore * weights.userPreferenceScore);

    // 6. Apply Penalties
    // Penalty for skipped track
    if (skippedSet.has(candidate.id)) {
      totalScore -= 0.65;
    }

    // Penalty for recently played track in current session
    if (recentHistoryIds.has(candidate.id)) {
      totalScore -= 0.45;
    }

    // Artist fatigue penalty (don't play same artist 3 times in a row)
    const candArtist = (candidate.artists || '').toLowerCase();
    if (recentArtists.has(candArtist)) {
      totalScore -= 0.25;
    }

    // Normalize final score between 0.05 and 0.99
    const finalScore = Math.max(0.05, Math.min(0.99, totalScore));
    const matchPercentage = Math.round(finalScore * 100);

    const primaryReason = reasons.length > 0
      ? reasons.slice(0, 2).join(' • ')
      : `${candProfile.moodLabel} • Similar rhythm`;

    scoredList.push({
      track: candidate,
      score: finalScore,
      matchPercentage,
      mood: candProfile.mood,
      moodLabel: candProfile.moodLabel,
      reasons,
      primaryReason
    });
  }

  // Sort descending by highest score
  scoredList.sort((a, b) => b.score - a.score);
  return scoredList;
}
