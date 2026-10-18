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
}
