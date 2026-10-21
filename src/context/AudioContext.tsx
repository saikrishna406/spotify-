'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Track, PlayerState, RepeatMode } from '@/types';

interface AudioContextType {
  state: PlayerState;
  playTrack: (track: Track, contextTracks?: Track[]) => Promise<void>;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  enqueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  next: () => Promise<void>;
  prev: () => void;
  analyserNode: AnalyserNode | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.75);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(0.75);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');

  // Spotify Queue Hierarchy: User Queue (Priority 1) -> Context Queue (Priority 2)
  const [userQueue, setUserQueue] = useState<Track[]>([]);
  const [contextQueue, setContextQueue] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);

  // Guard flag to prevent duplicate transition events during stream end
  const isTransitioningRef = useRef(false);

  // Synchronized Mutable State Ref (Spotify Architecture Pattern)
  // Ensures event listeners on the native HTMLAudioElement always read live playback state
  const stateRef = useRef({
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    previousVolume,
    isShuffle,
    repeatMode,
    userQueue,
    contextQueue,
    history
  });

  // Keep stateRef continuously updated
  useEffect(() => {
    stateRef.current = {
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      isMuted,
      previousVolume,
      isShuffle,
      repeatMode,
      userQueue,
      contextQueue,
      history
    };
  }, [
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    previousVolume,
    isShuffle,
    repeatMode,
    userQueue,
    contextQueue,
    history
  ]);

  const resolveStreamUrl = (track: Track): string => {
    if (track.streamUrl) return track.streamUrl;
    if (track.encryptedMediaUrl) {
      return `/api/music/stream?url=${encodeURIComponent(track.encryptedMediaUrl)}`;
    }
    return `/api/music/stream?id=${track.id}`;
  };

  // Internal Track Loader & Player
  const playTrackInternal = useCallback(async (track: Track, newContext?: Track[]): Promise<void> => {
    const audio = audioRef.current;
    if (!audio) return;

    const prevTrack = stateRef.current.currentTrack;
    if (prevTrack && prevTrack.id !== track.id) {
      setHistory(prev => [prevTrack, ...prev.slice(0, 49)]);
      stateRef.current.history = [prevTrack, ...stateRef.current.history.slice(0, 49)];
    }

    setCurrentTrack(track);
    stateRef.current.currentTrack = track;

    if (track.duration && track.duration > 0) {
      setDuration(track.duration);
      stateRef.current.duration = track.duration;
    }
    setCurrentTime(0);
    stateRef.current.currentTime = 0;

    if (newContext && newContext.length > 0) {
      setContextQueue(newContext);
      stateRef.current.contextQueue = newContext;
    }

    const stream = resolveStreamUrl(track);
    if (stream) {
      try {
        audio.src = stream;
        audio.currentTime = 0;
        await audio.play();
        setIsPlaying(true);
        stateRef.current.isPlaying = true;
      } catch (err: any) {
        console.warn('[Spotify Audio Engine] Playback start error for track:', track.name, err.message);
        setIsPlaying(false);
        stateRef.current.isPlaying = false;
        
        // Auto-recover / Auto-skip if stream fails to play
        setTimeout(() => {
          if (!stateRef.current.isPlaying && audio.error) {
            console.warn('[Spotify Audio Engine] Auto-skipping failed stream track:', track.name);
            next();
          }
        }, 1200);
      }
    }

    // Spotify Standard: Sync with OS MediaSession
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.name,
          artist: track.artists,
          album: track.album,
          artwork: [
            { src: track.image, sizes: '96x96', type: 'image/jpeg' },
            { src: track.image, sizes: '128x128', type: 'image/jpeg' },
            { src: track.image, sizes: '256x256', type: 'image/jpeg' },
            { src: track.image, sizes: '512x512', type: 'image/jpeg' },
          ]
        });
        navigator.mediaSession.playbackState = 'playing';
      } catch (e) {
        // MediaSession not supported or restricted in environment
      }
    }
  }, []);

  // Public playTrack API
  const playTrack = useCallback(async (track: Track, newContext?: Track[]): Promise<void> => {
    isTransitioningRef.current = false;
    await playTrackInternal(track, newContext);
  }, [playTrackInternal]);

  // SPOTIFY REA: Advance to Next Track in Queue
  const next = useCallback(async (): Promise<void> => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    try {
      const { userQueue: uQueue, contextQueue: cQueue, currentTrack: curr, isShuffle: shuffle, repeatMode: repeat } = stateRef.current;

      // 1. Priority 1: User Queue (Manually queued songs take first priority)
      if (uQueue.length > 0) {
        const nextTrack = uQueue[0];
        const remainingQueue = uQueue.slice(1);
        setUserQueue(remainingQueue);
        stateRef.current.userQueue = remainingQueue;
        await playTrackInternal(nextTrack);
        return;
      }

      // 2. Priority 2: Context Queue (Album / Playlist / Search results)
      if (cQueue.length > 0) {
        const currentIndex = cQueue.findIndex(t => t.id === curr?.id);
        let nextIndex = -1;

        if (shuffle) {
          // Shuffle mode: Pick an unplayed song from the context queue
          if (cQueue.length > 1) {
            const availableIndices = cQueue
              .map((_, i) => i)
              .filter(i => i !== currentIndex);
            nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
          } else {
            nextIndex = 0;
          }
        } else {
          if (currentIndex >= 0 && currentIndex < cQueue.length - 1) {
            // Next sequential song in the album or playlist
            nextIndex = currentIndex + 1;
          } else if (repeat === 'context') {
            // Repeat playlist is on: loop back to track 0
            nextIndex = 0;
          }
        }

        if (nextIndex >= 0 && cQueue[nextIndex]) {
          await playTrackInternal(cQueue[nextIndex]);
          return;
        }
      }

      // 3. Priority 3: Spotify Infinite Autoplay (Artist & Genre Radio)
      // When playlist reaches the end and repeat is off, Spotify automatically fetches recommendations
      if (curr) {
        try {
          console.log('[Spotify Autoplay] Reached end of playlist. Fetching recommendations for:', curr.artists);
          const searchSeed = curr.artists.split(',')[0].trim() || curr.language || 'Trending Hits';
          const res = await fetch(`/api/music/search?q=${encodeURIComponent(searchSeed)}&limit=15`);
          const data = await res.json();
          const songs: Track[] = data.songs || [];
          
          const existingIds = new Set([curr.id, ...cQueue.map(t => t.id)]);
          const freshSongs = songs.filter(s => !existingIds.has(s.id));
          const candidateTracks = freshSongs.length > 0 ? freshSongs : songs;

          if (candidateTracks.length > 0) {
            const nextTrack = candidateTracks[0];
            const updatedContext = [...cQueue, ...candidateTracks];
            setContextQueue(updatedContext);
            stateRef.current.contextQueue = updatedContext;
            await playTrackInternal(nextTrack);
            return;
          }
        } catch (err) {
          console.warn('[Spotify Autoplay] Recommendation fetch failed, falling back to loop:', err);
        }
      }

      // 4. Fallback: Loop context if available
      if (cQueue.length > 0) {
        await playTrackInternal(cQueue[0]);
      }
    } finally {
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 500);
    }
  }, [playTrackInternal]);

  // SPOTIFY REA: Handle Track End
  const handleTrackEnded = useCallback(() => {
    const { repeatMode: repeat, currentTrack: curr } = stateRef.current;
    console.log('[Spotify Audio Engine] Track completed:', curr?.name, '| RepeatMode:', repeat);

    // Spotify Repeat 1: Replay exact same song
    if (repeat === 'track' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn('Repeat track replay error:', e));
      return;
    }

    // Auto-advance to next track in queue
    next();
  }, [next]);

  // Previous Track
  const prev = useCallback(() => {
    const { history: hist, contextQueue: cQueue, currentTrack: curr, currentTime: curTime } = stateRef.current;

    // Spotify Behavior: If played for more than 3 seconds, previous restarts the current track
    if (curTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    // Check history first
    if (hist.length > 0) {
      const prevTrack = hist[0];
      const remainingHistory = hist.slice(1);
      setHistory(remainingHistory);
      stateRef.current.history = remainingHistory;
      playTrackInternal(prevTrack);
      return;
    }

    // Fall back to previous track in context queue
    if (cQueue.length > 0) {
      const currentIndex = cQueue.findIndex(t => t.id === curr?.id);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : cQueue.length - 1;
      playTrackInternal(cQueue[prevIndex]);
    }
  }, [playTrackInternal]);

  // Stable Handler References to avoid Stale Closures in Audio Listeners
  const handleTrackEndedRef = useRef(handleTrackEnded);
  const nextRef = useRef(next);
  const prevRef = useRef(prev);

  useEffect(() => {
    handleTrackEndedRef.current = handleTrackEnded;
    nextRef.current = next;
    prevRef.current = prev;
  }, [handleTrackEnded, next, prev]);

  // Setup HTMLAudioElement on Mount (Single Persistent Instance)
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      const curr = audio.currentTime;
      const dur = audio.duration;
      setCurrentTime(curr);
      stateRef.current.currentTime = curr;

      if (dur && !isNaN(dur) && isFinite(dur) && dur > 0) {
        setDuration(dur);
        stateRef.current.duration = dur;

        // Watchdog: If track is within 0.25 seconds of the end and not paused, trigger auto-advance
        // This solves browsers where audio stream reaches end without dispatching 'ended' event
        if (dur > 2 && curr >= dur - 0.25 && !audio.paused && !isTransitioningRef.current) {
          handleTrackEndedRef.current();
        }
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
        stateRef.current.duration = audio.duration;
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      stateRef.current.isPlaying = true;
      if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    };

    const onPause = () => {
      setIsPlaying(false);
      stateRef.current.isPlaying = false;
      if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
    };

    const onEnded = () => {
      handleTrackEndedRef.current();
    };

    const onError = () => {
      console.warn('[Spotify Audio Engine] Audio error occurred:', audio.error?.code, audio.error?.message);
      setIsPlaying(false);
      stateRef.current.isPlaying = false;
      // Auto-skip corrupt or dead track after brief pause
      if (!isTransitioningRef.current) {
        setTimeout(() => {
          handleTrackEndedRef.current();
        }, 1000);
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // Register MediaSession Handlers
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => audio.play().catch(() => {}));
        navigator.mediaSession.setActionHandler('pause', () => audio.pause());
        navigator.mediaSession.setActionHandler('nexttrack', () => nextRef.current());
        navigator.mediaSession.setActionHandler('previoustrack', () => prevRef.current());
        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined) {
            audio.currentTime = details.seekTime;
            setCurrentTime(details.seekTime);
          }
        });
      } catch (e) {}
    }

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (stateRef.current.isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(e => console.warn('Play error:', e));
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) audioRef.current.play().catch(e => console.warn('Resume error:', e));
  }, []);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const dur = stateRef.current.duration || audio.duration || 0;
    const clamped = Math.max(0, Math.min(seconds, dur));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
    stateRef.current.currentTime = clamped;
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(vol, 1));
    setVolumeState(clamped);
    stateRef.current.volume = clamped;
    setIsMuted(clamped === 0);
    stateRef.current.isMuted = clamped === 0;
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (stateRef.current.isMuted) {
      setVolume(stateRef.current.previousVolume || 0.75);
    } else {
      setPreviousVolume(stateRef.current.volume);
      stateRef.current.previousVolume = stateRef.current.volume;
      setVolume(0);
    }
  }, [setVolume]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => {
      const nextVal = !prev;
      stateRef.current.isShuffle = nextVal;
      return nextVal;
    });
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      let nextMode: RepeatMode = 'off';
      if (prev === 'off') nextMode = 'context';
      else if (prev === 'context') nextMode = 'track';
      else nextMode = 'off';
      stateRef.current.repeatMode = nextMode;
      return nextMode;
    });
  }, []);

  const enqueue = useCallback((track: Track) => {
    setUserQueue(prev => {
      const nextQueue = [...prev, track];
      stateRef.current.userQueue = nextQueue;
      return nextQueue;
    });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setUserQueue(prev => {
      const nextQueue = prev.filter((_, i) => i !== index);
      stateRef.current.userQueue = nextQueue;
      return nextQueue;
    });
  }, []);

  const playerState: PlayerState = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    userQueue,
    contextQueue,
    history
  };

  return (
    <AudioContext.Provider value={{
      state: playerState,
      playTrack,
      togglePlay,
      pause,
      resume,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      toggleRepeat,
      enqueue,
      removeFromQueue,
      next,
      prev,
      analyserNode: analyser
    }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
}
