'use client';

import React, { useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  Maximize2,
  Mic2
} from 'lucide-react';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';

interface PlayerBarProps {
  onToggleQueue: () => void;
  isQueueOpen: boolean;
  onToggleLyrics?: () => void;
  isLyricsOpen?: boolean;
}

export default function PlayerBar({
  onToggleQueue,
  isQueueOpen,
  onToggleLyrics,
  isLyricsOpen = false
}: PlayerBarProps) {
  const {
    state,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    next,
    prev,
    analyserNode
  } = useAudio();
  const { toggleLike, isLiked } = useAuth();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const liked = state.currentTrack ? isLiked(state.currentTrack.id) : false;

  // Live frequency visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const barCount = 10;
    const buffer = new Uint8Array(barCount);

    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (state.isPlaying && analyserNode) {
        analyserNode.getByteFrequencyData(buffer);
      } else if (state.isPlaying) {
        // Fallback procedural animation
        const time = Date.now() * 0.006;
        for (let i = 0; i < barCount; i++) {
          buffer[i] = Math.floor(80 + Math.sin(time + i * 0.9) * 75);
        }
      } else {
        buffer.fill(4);
      }

      const barWidth = 3;
      const gap = 2.5;
      const totalWidth = barCount * (barWidth + gap);
      const startX = (canvas.width - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        const val = buffer[i];
        const barHeight = Math.max(3, (val / 255) * canvas.height);
        const x = startX + i * (barWidth + gap);
        const y = canvas.height - barHeight;

        ctx.fillStyle = state.isPlaying ? '#1ed760' : '#727272';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1.5);
        ctx.fill();
      }
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [state.isPlaying, analyserNode]);

  const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
    seek(pct * state.duration);
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
    setVolume(pct);
  };

  return (
    <>
      {/* MOBILE MINI-PLAYER (FLOATING ABOVE BOTTOM NAV) */}
      {state.currentTrack && (
        <div className="flex md:hidden fixed bottom-[68px] left-2 right-2 z-40 bg-[#282828]/95 backdrop-blur-md rounded-lg p-2.5 shadow-2xl border border-white/10 select-none items-center justify-between overflow-hidden">
          {/* Track Info (Tap to toggle lyrics) */}
          <div
            onClick={onToggleLyrics}
            className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer pr-2"
          >
            <img
              src={state.currentTrack.image}
              alt={state.currentTrack.name}
              className="w-10 h-10 rounded object-cover shadow shrink-0 bg-black/40"
            />
            <div className="flex flex-col min-w-0 flex-1 max-w-[220px]">
              <span className="font-semibold text-xs text-white truncate">
                {state.currentTrack.name}
              </span>
              <span className="text-[11px] text-spotify-subdued truncate">
                {state.currentTrack.artists}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Lyrics toggle */}
            {onToggleLyrics && (
              <button
                onClick={onToggleLyrics}
                className={`p-2 rounded-full transition ${
                  isLyricsOpen ? 'text-spotify-green' : 'text-spotify-subdued active:text-white'
                }`}
                title="Lyrics"
              >
                <Mic2 className="w-4 h-4" />
              </button>
            )}

            {/* Like */}
            <button
              onClick={() => state.currentTrack && toggleLike(state.currentTrack)}
              className={`p-2 transition ${liked ? 'text-spotify-green' : 'text-spotify-subdued active:text-white'}`}
              title={liked ? 'Liked' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-spotify-green' : ''}`} />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center active:scale-95 transition shadow ml-1"
              title={state.isPlaying ? 'Pause' : 'Play'}
            >
              {state.isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={next}
              className="p-1.5 text-spotify-subdued active:text-white transition"
              title="Next"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Mini Progress Bar Line at Bottom */}
          <div
            onClick={handleSeekClick}
            className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-white/20 cursor-pointer"
          >
            <div
              className="h-full bg-spotify-green transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* DESKTOP FULL PLAYER BAR */}
      <footer className="hidden md:grid h-[90px] w-full bg-black border-t border-white/10 px-4 grid-cols-[30%_40%_30%] items-center select-none fixed bottom-0 left-0 z-50">
      {/* LEFT: Currently Playing Track Info */}
      <div className="flex items-center gap-3.5 min-w-0 pr-4">
        {state.currentTrack ? (
          <>
            <img
              src={state.currentTrack.image}
              alt={state.currentTrack.name}
              className="w-14 h-14 rounded object-cover shadow-lg shrink-0 bg-black/40"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-sm text-white truncate hover:underline cursor-pointer">
                {state.currentTrack.name}
              </span>
              <span className="text-xs text-spotify-subdued truncate hover:underline cursor-pointer">
                {state.currentTrack.artists}
              </span>
            </div>

            <button
              onClick={() => state.currentTrack && toggleLike(state.currentTrack)}
              className={`p-1.5 transition ${liked ? 'text-spotify-green' : 'text-spotify-subdued hover:text-white'}`}
              title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-spotify-green' : ''}`} />
            </button>

            {/* Live Visualizer */}
            <canvas ref={canvasRef} width={50} height={18} className="hidden xl:block opacity-90 ml-1 shrink-0" />
          </>
        ) : (
          <div className="text-xs text-spotify-subdued">Select a track to play</div>
        )}
      </div>

      {/* CENTER: Controls & Progress Bar */}
      <div className="flex flex-col items-center gap-2 max-w-[650px] w-full mx-auto">
        <div className="flex items-center gap-5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`transition relative ${state.isShuffle ? 'text-spotify-green' : 'text-spotify-subdued hover:text-white'}`}
            title="Enable shuffle"
          >
            <Shuffle className="w-4 h-4" />
            {state.isShuffle && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-spotify-green rounded-full"></span>}
          </button>

          {/* Previous */}
          <button
            onClick={prev}
            className="text-spotify-subdued hover:text-white transition"
            title="Previous"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white text-black hover:scale-105 active:scale-95 flex items-center justify-center transition shadow"
            title={state.isPlaying ? 'Pause' : 'Play'}
          >
            {state.isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={next}
            className="text-spotify-subdued hover:text-white transition"
            title="Next"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`transition relative ${state.repeatMode !== 'off' ? 'text-spotify-green' : 'text-spotify-subdued hover:text-white'}`}
            title={`Repeat: ${state.repeatMode}`}
          >
            {state.repeatMode === 'track' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            {state.repeatMode !== 'off' && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-spotify-green rounded-full"></span>}
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex items-center gap-2.5 w-full text-[11px] font-mono text-spotify-subdued">
          <span className="w-8 text-right tabular-nums">{formatSeconds(state.currentTime)}</span>
          <div
            onClick={handleSeekClick}
            className="group flex-1 h-3 flex items-center cursor-pointer relative"
          >
            <div className="w-full h-1 bg-[#4d4d4d] group-hover:h-1.5 rounded-full overflow-hidden transition-all">
              <div
                className="h-full bg-white group-hover:bg-spotify-green transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {/* Thumb */}
            <div
              className="absolute w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
          <span className="w-8 tabular-nums">{formatSeconds(state.duration)}</span>
        </div>
      </div>

      {/* RIGHT: Volume & Utilities */}
      <div className="flex items-center justify-end gap-3 pl-4">
        {/* Lyrics Toggle (Spotify Mic Icon) */}
        {onToggleLyrics && (
          <button
            onClick={onToggleLyrics}
            className={`transition p-1.5 rounded-full hover:bg-white/10 ${isLyricsOpen ? 'text-spotify-green' : 'text-spotify-subdued hover:text-white'}`}
            title="Lyrics"
          >
            <Mic2 className="w-5 h-5" />
          </button>
        )}

        {/* Queue Toggle */}
        <button
          onClick={onToggleQueue}
          className={`transition p-1.5 rounded-full hover:bg-white/10 ${isQueueOpen ? 'text-spotify-green' : 'text-spotify-subdued hover:text-white'}`}
          title="Queue"
        >
          <ListMusic className="w-5 h-5" />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2 w-32">
          <button
            onClick={toggleMute}
            className="text-spotify-subdued hover:text-white transition"
            title={state.isMuted ? 'Unmute' : 'Mute'}
          >
            {state.isMuted || state.volume === 0 ? (
              <VolumeX className="w-5 h-5 text-spotify-subdued" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <div
            onClick={handleVolumeClick}
            className="group flex-1 h-3 flex items-center cursor-pointer relative"
          >
            <div className="w-full h-1 bg-[#4d4d4d] group-hover:h-1.5 rounded-full overflow-hidden transition-all">
              <div
                className="h-full bg-white group-hover:bg-spotify-green transition-colors"
                style={{ width: `${state.isMuted ? 0 : state.volume * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Fullscreen */}
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => {});
            } else {
              document.exitFullscreen().catch(() => {});
            }
          }}
          className="text-spotify-subdued hover:text-white transition p-1.5"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
    </>
  );
}
