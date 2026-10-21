export interface Track {
  id: string;
  name: string;
  album: string;
  albumId?: string;
  artists: string;
  duration: number; // in seconds
  durationFormatted: string;
  image: string;
  streamUrl?: string;
  encryptedMediaUrl?: string;
  language?: string;
  year?: string;
  hasLyrics?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string;
  owner: string;
  followerCount?: string;
  color?: string;
  tracks?: Track[];
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  likedSongIds: string[];
  likedSongsData: Track[];
  playlists: UserPlaylist[];
}

export interface UserPlaylist {
  id: string;
  name: string;
  description: string;
  image?: string;
  trackIds: string[];
  tracks: Track[];
  createdAt: string;
}

export type RepeatMode = 'off' | 'context' | 'track';

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  userQueue: Track[];
  contextQueue: Track[];
  history: Track[];
  isSmartRadio: boolean;
  nextRecommendation: RecommendedTrack | null;
}

export type MoodCategory =
  | 'romantic_melody'
  | 'energetic_dance'
  | 'chill_lofi'
  | 'melancholic_sad'
  | 'folk_acoustic'
  | 'anthem_inspirational';

export interface SongProfile {
  trackId: string;
  language: string;
  mood: MoodCategory;
  moodLabel: string;
  energyLevel: number; // 0.0 (gentle/slow) to 1.0 (intense/fast)
  danceability: number; // 0.0 to 1.0
  valence: number; // 0.0 (melancholic) to 1.0 (euphoric)
  tempoEstimate: 'slow' | 'medium' | 'fast';
  primaryArtists: string[];
  composer?: string;
  keywords: string[];
}

export interface RecommendedTrack {
  track: Track;
  score: number;
  matchPercentage: number;
  mood: MoodCategory;
  moodLabel: string;
  reasons: string[];
  primaryReason: string;
}

export interface UserTasteProfile {
  preferredLanguages: string[];
  topArtists: Record<string, number>;
  topMoods: Record<string, number>;
  totalPlays: number;
  totalCompletions: number;
  totalSkips: number;
  recentlySkippedTrackIds: string[];
}

export interface ListeningEvent {
  id?: string;
  userId?: string;
  trackId: string;
  trackData: Track;
  eventType: 'complete' | 'skip' | 'replay' | 'like';
  dwellSeconds: number;
  createdAt?: string;
}
