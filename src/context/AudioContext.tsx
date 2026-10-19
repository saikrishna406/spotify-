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
  next: () => void;
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

  // Queue Hierarchy
  const [userQueue, setUserQueue] = useState<Track[]>([]);
  const [contextQueue, setContextQueue] = useState<Track[]>([]);
  const [history, setHistory] = useState<Track[]>([]);

  // Setup HTMLAudioElement
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.volume = volume;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => handleTrackEnded();
    const onError = () => {
      console.error('Audio playback error code:', audio.error?.code, audio.error?.message);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

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

  const resolveStreamUrl = (track: Track): string => {
    if (track.streamUrl) return track.streamUrl;
    if (track.encryptedMediaUrl) {
      return `/api/music/stream?url=${encodeURIComponent(track.encryptedMediaUrl)}`;
    }
    return `/api/music/stream?id=${track.id}`;
  };

  const playTrack = async (track: Track, newContext?: Track[]) => {
    if (!audioRef.current) return;

    if (currentTrack && currentTrack.id !== track.id) {
      setHistory(prev => [currentTrack, ...prev]);
    }

    setCurrentTrack(track);
    if (track.duration && track.duration > 0) {
      setDuration(track.duration);
    }
    setCurrentTime(0);
    if (newContext) {
      setContextQueue(newContext);
    }

    const stream = resolveStreamUrl(track);
    if (stream && audioRef.current) {
      audioRef.current.src = stream;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.warn('Play error:', e));
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.warn('Play error:', e));
    }
  };

  const pause = () => {
    if (audioRef.current) audioRef.current.pause();
  };

  const resume = () => {
    if (audioRef.current) audioRef.current.play().catch(e => console.warn('Play error:', e));
  };

  const seek = (seconds: number) => {
    if (!audioRef.current) return;
    const clamped = Math.max(0, Math.min(seconds, duration));
    audioRef.current.currentTime = clamped;
    setCurrentTime(clamped);
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(vol, 1));
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume || 0.75);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
    }
  };

  const toggleShuffle = () => setIsShuffle(prev => !prev);

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'context';
      if (prev === 'context') return 'track';
      return 'off';
    });
  };

  const enqueue = (track: Track) => {
    setUserQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (index: number) => {
    setUserQueue(prev => prev.filter((_, i) => i !== index));
  };

  const handleTrackEnded = () => {
    if (repeatMode === 'track') {
      seek(0);
      resume();
      return;
    }
    next();
  };

  const next = () => {
    // 1. Priority: User Manual Queue
    if (userQueue.length > 0) {
      const nextTrack = userQueue[0];
      setUserQueue(prev => prev.slice(1));
      playTrack(nextTrack);
      return;
    }

    // 2. Context Queue
    if (contextQueue.length === 0) return;
    const currentIndex = contextQueue.findIndex(t => t.id === currentTrack?.id);
    let nextIndex = -1;

    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * contextQueue.length);
    } else {
      if (currentIndex >= 0 && currentIndex < contextQueue.length - 1) {
        nextIndex = currentIndex + 1;
      } else if (repeatMode === 'context') {
        nextIndex = 0; // loop playlist
      }
    }

    if (nextIndex >= 0 && contextQueue[nextIndex]) {
      playTrack(contextQueue[nextIndex]);
    }
  };

  const prev = () => {
    if (currentTime > 3) {
      seek(0);
      return;
    }

    if (history.length > 0) {
      const prevTrack = history[0];
      setHistory(prev => prev.slice(1));
      playTrack(prevTrack);
      return;
    }

    if (contextQueue.length > 0) {
      const currentIndex = contextQueue.findIndex(t => t.id === currentTrack?.id);
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : contextQueue.length - 1;
      playTrack(contextQueue[prevIndex]);
    }
  };

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
