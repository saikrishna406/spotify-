'use client';

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Track, PlayerState, RepeatMode, RecommendedTrack } from '@/types';
import { getClientUserTaste, recordTrackCompleted, recordTrackSkipped, recordTrackReplayed } from '@/lib/recommendations/behaviorTracker';

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
  toggleSmartRadio: () => void;
  enqueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  next: () => Promise<void>;
  prev: () => void;
  fetchNextRecommendation: (seed?: Track) => Promise<RecommendedTrack | null>;
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

  // Smart Mood Recommendation System State
  const [isSmartRadio, setIsSmartRadio] = useState(true);
  const [nextRecommendation, setNextRecommendation] = useState<RecommendedTrack | null>(null);

  // Spotify Queue Hierarchy: User Queue (Priority 1) -> Context Queue (Priority 2)
  const [userQueue, setUserQueue] = useState<Track[]>([]);
  const [contextQueue, setContextQueue] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);

  // Guard flag to prevent duplicate transition events during stream end
  const isTransitioningRef = useRef(false);
  const isPrefetchingRef = useRef(false);

  // Synchronized Mutable State Ref (Spotify Architecture Pattern)
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
    isSmartRadio,
    nextRecommendation,
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
      isSmartRadio,
      nextRecommendation,
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
    isSmartRadio,
    nextRecommendation,
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

  // Pre-fetch next mood-based recommendation in background
  const fetchNextRecommendation = useCallback(async (seed?: Track): Promise<RecommendedTrack | null> => {
    const seedTrack = seed || stateRef.current.currentTrack;
    if (!seedTrack || isPrefetchingRef.current) return null;

    isPrefetchingRef.current = true;
    try {
      const userTaste = getClientUserTaste();
      const res = await fetch('/api/music/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seedTrack,
          recentHistory: stateRef.current.history.slice(0, 5),
          userTaste
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.topNext) {
          setNextRecommendation(data.topNext);
          stateRef.current.nextRecommendation = data.topNext;
          return data.topNext;
        }
      }
    } catch (err) {
      console.warn('[Smart Radio] Pre-fetch recommendation failed:', err);
    } finally {
      isPrefetchingRef.current = false;
    }
    return null;
  }, []);

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
    setNextRecommendation(null);
    stateRef.current.nextRecommendation = null;

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
        
        // Auto-recover if stream fails
        setTimeout(() => {
          if (!stateRef.current.isPlaying && audio.error) {
            console.warn('[Spotify Audio Engine] Auto-skipping failed stream track:', track.name);
            next();
          }
        }, 1200);
      }
    }

    // Pre-fetch next smart mood recommendation for this newly playing track
    if (stateRef.current.isSmartRadio) {
      setTimeout(() => {
        fetchNextRecommendation(track);
      }, 500);
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
        // MediaSession not supported or restricted
      }
    }
  }, [fetchNextRecommendation]);

  // Public playTrack API
  const playTrack = useCallback(async (track: Track, newContext?: Track[]): Promise<void> => {
    isTransitioningRef.current = false;
    await playTrackInternal(track, newContext);
  }, [playTrackInternal]);

  // Advance to Next Track in Queue (with Skip Tracking & Mood Recommendations)
  const next = useCallback(async (): Promise<void> => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    try {
      const {
        userQueue: uQueue,
        contextQueue: cQueue,
        currentTrack: curr,
        currentTime: curTime,
        duration: dur,
        isShuffle: shuffle,
        repeatMode: repeat,
        isSmartRadio: smartRadio,
        nextRecommendation: preloadedRec
      } = stateRef.current;

      // Track skip behavior: If skipped within 30 seconds or < 30% duration
      if (curr && curTime < 30 && (dur === 0 || curTime / dur < 0.30)) {
        recordTrackSkipped(curr, undefined, curTime);
      }

      // 1. Priority 1: User Queue (Manually queued songs take first priority)
      if (uQueue.length > 0) {
        const nextTrack = uQueue[0];
        const remainingQueue = uQueue.slice(1);
        setUserQueue(remainingQueue);
        stateRef.current.userQueue = remainingQueue;
        await playTrackInternal(nextTrack);
        return;
      }

      // 2. Priority 2: Smart Mood Radio (If enabled and preloaded recommendation exists)
      if (smartRadio && preloadedRec?.track) {
        const recTrack = preloadedRec.track;
        setNextRecommendation(null);
        stateRef.current.nextRecommendation = null;
        await playTrackInternal(recTrack);
        return;
      }

      // 3. Priority 3: Context Queue (Album / Playlist / Search results)
      if (cQueue.length > 0) {
        const currentIndex = cQueue.findIndex(t => t.id === curr?.id);
        let nextIndex = -1;

        if (shuffle) {
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
            nextIndex = currentIndex + 1;
          } else if (repeat === 'context') {
            nextIndex = 0;
          }
        }

        if (nextIndex >= 0 && cQueue[nextIndex]) {
          await playTrackInternal(cQueue[nextIndex]);
          return;
        }
      }

      // 4. Priority 4: Dynamic Mood-Based Autoplay Fallback
      if (curr) {
        try {
          const rec = await fetchNextRecommendation(curr);
          if (rec?.track) {
            await playTrackInternal(rec.track);
            return;
          }
        } catch (err) {
          console.warn('[Smart Radio] On-demand recommendation failed:', err);
        }
      }

      // 5. Fallback: Loop context if available
      if (cQueue.length > 0) {
        await playTrackInternal(cQueue[0]);
      }
    } finally {
      setTimeout(() => {
        isTransitioningRef.current = false;
      }, 500);
    }
  }, [playTrackInternal, fetchNextRecommendation]);

  // SPOTIFY REA: Handle Natural Track Completion
  const handleTrackEnded = useCallback(async () => {
    const {
      repeatMode: repeat,
      currentTrack: curr,
      duration: dur,
      isSmartRadio: smartRadio,
      nextRecommendation: preloadedRec,
      userQueue: uQueue,
      contextQueue: cQueue
    } = stateRef.current;

    console.log('[Spotify Audio Engine] Track finished:', curr?.name, '| SmartRadio:', smartRadio);

    // Spotify Repeat 1: Replay exact same song
    if (repeat === 'track' && audioRef.current) {
      if (curr) recordTrackReplayed(curr);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn('Repeat track replay error:', e));
      return;
    }

    // Record completion in behavior tracker
    if (curr) {
      recordTrackCompleted(curr, undefined, dur);
    }

    // Priority 1: User Queue (Manually queued songs take first priority)
    if (uQueue.length > 0) {
      await next();
      return;
    }

    // Priority 2: Smart Mood Recommendation
    // When a song finishes and smart radio is ON, automatically recommend and play another song
    // with a similar musical feel (mood, style, energy, tempo), rather than simply playing the next track!
    if (smartRadio && curr) {
      if (preloadedRec?.track) {
        console.log('[Smart Mood Radio] Auto-playing pre-fetched mood match:', preloadedRec.track.name, '(', preloadedRec.primaryReason, ')');
        const recTrack = preloadedRec.track;
        setNextRecommendation(null);
        stateRef.current.nextRecommendation = null;
        await playTrackInternal(recTrack);
        return;
      }

      // If pre-fetch hasn't finished, fetch recommendation directly
      try {
        const freshRec = await fetchNextRecommendation(curr);
        if (freshRec?.track) {
          console.log('[Smart Mood Radio] Auto-playing fresh mood match:', freshRec.track.name, '(', freshRec.primaryReason, ')');
          await playTrackInternal(freshRec.track);
          return;
        }
      } catch (err) {
        console.warn('[Smart Mood Radio] Failed to fetch on-demand recommendation:', err);
      }
    }

    // Fall back to standard next track in queue
    await next();
  }, [next, playTrackInternal, fetchNextRecommendation]);

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
      if (cQueue[prevIndex]) {
        playTrackInternal(cQueue[prevIndex]);
      }
    }
  }, [playTrackInternal]);

  // Keep references to stable handlers
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

        // Auto-prefetch mood recommendation when passing 60% progress
        if (stateRef.current.isSmartRadio && !stateRef.current.nextRecommendation && !isPrefetchingRef.current) {
          if (curr / dur > 0.60 && stateRef.current.currentTrack) {
            fetchNextRecommendation(stateRef.current.currentTrack);
          }
        }

        // Watchdog: If track is within 0.25 seconds of the end and not paused, trigger auto-advance
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
  }, [fetchNextRecommendation]);

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

  const toggleSmartRadio = useCallback(() => {
    setIsSmartRadio(prev => {
      const nextVal = !prev;
      stateRef.current.isSmartRadio = nextVal;
      if (nextVal && stateRef.current.currentTrack) {
        fetchNextRecommendation(stateRef.current.currentTrack);
      } else {
        setNextRecommendation(null);
        stateRef.current.nextRecommendation = null;
      }
      return nextVal;
    });
  }, [fetchNextRecommendation]);

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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        next();
      } else if (e.code === 'ArrowLeft' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        prev();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seek(stateRef.current.currentTime + 5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seek(stateRef.current.currentTime - 5);
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(stateRef.current.volume + 0.1);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(stateRef.current.volume - 0.1);
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [togglePlay, next, prev, seek, setVolume, toggleMute]);

  const playerState: PlayerState = {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    isSmartRadio,
    nextRecommendation,
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
      toggleSmartRadio,
      enqueue,
      removeFromQueue,
      next,
      prev,
      fetchNextRecommendation,
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
