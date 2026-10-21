import { Track, UserTasteProfile, ListeningEvent } from '@/types';
import { inferSongMood } from './moodProfiler';

const STORAGE_KEY_PREFIX = 'spotify_behavior_';

function getStorageKey(userId?: string): string {
  return `${STORAGE_KEY_PREFIX}${userId || 'guest'}`;
}

export function getClientUserTaste(userId?: string): UserTasteProfile {
  if (typeof window === 'undefined') {
    return {
      preferredLanguages: [],
      topArtists: {},
      topMoods: {},
      totalPlays: 0,
      totalCompletions: 0,
      totalSkips: 0,
      recentlySkippedTrackIds: []
    };
  }

  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[Behavior Tracker] Failed to read from localStorage:', e);
  }

  return {
    preferredLanguages: [],
    topArtists: {},
    topMoods: {},
    totalPlays: 0,
    totalCompletions: 0,
    totalSkips: 0,
    recentlySkippedTrackIds: []
  };
}

function saveClientUserTaste(profile: UserTasteProfile, userId?: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(profile));
  } catch (e) {
    console.warn('[Behavior Tracker] Failed to save to localStorage:', e);
  }
}

// Send event to server asynchronously (fire-and-forget, zero playback lag)
async function dispatchServerEvent(event: ListeningEvent) {
  try {
    await fetch('/api/user/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
  } catch (e) {
    // Non-fatal, local taste cache remains primary
  }
}

export function recordTrackCompleted(track: Track, userId?: string, dwellSeconds = 0) {
  if (!track || !track.id) return;
  const taste = getClientUserTaste(userId);
  const profile = inferSongMood(track);

  taste.totalPlays += 1;
  taste.totalCompletions += 1;

  // Language affinity
  if (profile.language && !taste.preferredLanguages.includes(profile.language)) {
    taste.preferredLanguages.push(profile.language);
  }

  // Artist affinity
  for (const artist of profile.primaryArtists) {
    taste.topArtists[artist] = (taste.topArtists[artist] || 0) + 1;
  }

  // Mood affinity
  taste.topMoods[profile.mood] = (taste.topMoods[profile.mood] || 0) + 1;

  // If track was previously in skipped list, remove it since user completed it
  taste.recentlySkippedTrackIds = taste.recentlySkippedTrackIds.filter(id => id !== track.id);

  saveClientUserTaste(taste, userId);

  dispatchServerEvent({
    trackId: track.id,
    trackData: track,
    eventType: 'complete',
    dwellSeconds,
    userId
  });
}

export function recordTrackSkipped(track: Track, userId?: string, dwellSeconds = 0) {
  if (!track || !track.id) return;
  const taste = getClientUserTaste(userId);

  taste.totalPlays += 1;
  taste.totalSkips += 1;

  // Add to recently skipped (keep maximum 25 items FIFO)
  if (!taste.recentlySkippedTrackIds.includes(track.id)) {
    taste.recentlySkippedTrackIds.unshift(track.id);
    if (taste.recentlySkippedTrackIds.length > 25) {
      taste.recentlySkippedTrackIds.pop();
    }
  }

  saveClientUserTaste(taste, userId);

  dispatchServerEvent({
    trackId: track.id,
    trackData: track,
    eventType: 'skip',
    dwellSeconds,
    userId
  });
}

export function recordTrackReplayed(track: Track, userId?: string) {
  if (!track || !track.id) return;
  const taste = getClientUserTaste(userId);
  const profile = inferSongMood(track);

  // Replaying indicates high affinity
  for (const artist of profile.primaryArtists) {
    taste.topArtists[artist] = (taste.topArtists[artist] || 0) + 2;
  }
  taste.topMoods[profile.mood] = (taste.topMoods[profile.mood] || 0) + 2;

  saveClientUserTaste(taste, userId);

  dispatchServerEvent({
    trackId: track.id,
    trackData: track,
    eventType: 'replay',
    dwellSeconds: track.duration || 0,
    userId
  });
}
