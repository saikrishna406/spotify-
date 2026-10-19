'use client';

import React from 'react';
import { Play, Pause, Heart, ListPlus } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';

interface TrackRowProps {
  track: Track;
  index: number;
  onPlay: (track: Track) => void;
}

export default function TrackRow({ track, index, onPlay }: TrackRowProps) {
  const { state, togglePlay, enqueue } = useAudio();
  const { toggleLike, isLiked } = useAuth();

  const isCurrent = state.currentTrack?.id === track.id;
  const isPlaying = isCurrent && state.isPlaying;
  const liked = isLiked(track.id);

  return (
    <>
      {/* MOBILE ROW (Compact touch-friendly row) */}
      <div
        onClick={() => onPlay(track)}
        className={`flex md:hidden items-center justify-between gap-3 px-2 py-2 rounded-lg active:bg-white/15 cursor-pointer select-none transition ${
          isCurrent ? 'bg-white/10' : ''
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-11 h-11 shrink-0 rounded overflow-hidden shadow bg-black/40">
            <img
              src={track.image}
              alt={track.name}
              className="w-full h-full object-cover"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 bg-spotify-green animate-pulse h-full"></span>
                  <span className="w-0.5 bg-spotify-green animate-pulse h-2"></span>
                  <span className="w-0.5 bg-spotify-green animate-pulse h-3"></span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <span className={`font-semibold text-sm truncate ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>
              {track.name}
            </span>
            <span className="text-xs text-spotify-subdued truncate">
              {track.artists}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(track);
            }}
            className={`p-2 transition ${liked ? 'text-spotify-green' : 'text-spotify-subdued active:text-white'}`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-spotify-green' : ''}`} />
          </button>
          <span className="text-[11px] font-mono text-spotify-subdued tabular-nums">
            {track.durationFormatted}
          </span>
        </div>
      </div>

      {/* DESKTOP ROW (Full 5-column table) */}
      <div
        onClick={() => onPlay(track)}
        className={`hidden md:grid md:grid-cols-[36px_minmax(200px,3fr)_minmax(120px,2fr)_minmax(80px,1fr)_80px] items-center px-4 py-2.5 rounded-md hover:bg-white/10 cursor-pointer transition select-none text-sm ${
          isCurrent ? 'bg-white/10' : ''
        }`}
      >
      {/* Col 1: Index / Play Icon / Equalizer Wave */}
      <div className="flex items-center text-spotify-subdued text-sm font-medium">
        {isPlaying ? (
          <div className="flex items-end gap-0.5 h-3.5">
            <span className="w-0.5 bg-spotify-green animate-pulse h-full"></span>
            <span className="w-0.5 bg-spotify-green animate-pulse h-2"></span>
            <span className="w-0.5 bg-spotify-green animate-pulse h-3"></span>
          </div>
        ) : (
          <>
            <span className="group-hover:hidden">{index + 1}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isCurrent) togglePlay();
                else onPlay(track);
              }}
              className="hidden group-hover:inline-flex text-white hover:scale-110 transition"
              title="Play"
            >
              <Play className="w-4 h-4 fill-white" />
            </button>
          </>
        )}
      </div>

      {/* Col 2: Title, Art, Artists */}
      <div className="flex items-center gap-3 overflow-hidden pr-4">
        <img
          src={track.image}
          alt={track.name}
          className="w-10 h-10 rounded object-cover shrink-0 shadow bg-black/40"
        />
        <div className="flex flex-col min-w-0">
          <span className={`font-semibold text-sm truncate ${isCurrent ? 'text-spotify-green' : 'text-white'}`}>
            {track.name}
          </span>
          <span className="text-xs text-spotify-subdued truncate hover:underline">
            {track.artists}
          </span>
        </div>
      </div>

      {/* Col 3: Album */}
      <div className="text-xs text-spotify-subdued truncate pr-4">
        {track.album}
      </div>

      {/* Col 4: Language Badge */}
      <div className="hidden sm:block">
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-spotify-subdued">
          {track.language || 'Music'}
        </span>
      </div>

      {/* Col 5: Actions & Duration */}
      <div className="flex items-center justify-end gap-3 text-xs text-spotify-subdued">
        {/* Enqueue */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            enqueue(track);
          }}
          className="opacity-0 group-hover:opacity-100 hover:text-white transition p-1"
          title="Add to queue"
        >
          <ListPlus className="w-4 h-4" />
        </button>

        {/* Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(track);
          }}
          className={`transition p-1 ${liked ? 'text-spotify-green opacity-100' : 'opacity-0 group-hover:opacity-100 hover:text-white'}`}
          title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-spotify-green' : ''}`} />
        </button>

        <span className="tabular-nums font-mono min-w-[36px] text-right">
          {track.durationFormatted}
        </span>
      </div>
    </div>
    </>
  );
}
