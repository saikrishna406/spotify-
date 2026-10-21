'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Heart, ListPlus, MoreHorizontal, User, Trash2 } from 'lucide-react';
import { Track } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';

interface TrackRowProps {
  track: Track;
  index: number;
  onPlay: (track: Track) => void;
  onArtistClick?: (artistName: string) => void;
  onRemoveFromPlaylist?: (trackId: string) => void;
}

export default function TrackRow({
  track,
  index,
  onPlay,
  onArtistClick,
  onRemoveFromPlaylist
}: TrackRowProps) {
  const { state, togglePlay, enqueue } = useAudio();
  const { toggleLike, isLiked, openAddToPlaylist } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCurrent = state.currentTrack?.id === track.id;
  const isPlaying = isCurrent && state.isPlaying;
  const liked = isLiked(track.id);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleArtistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArtistClick && track.artists) {
      const primaryArtist = track.artists.split(',')[0].trim();
      onArtistClick(primaryArtist);
    }
  };

  return (
    <div className="relative group">
      {/* MOBILE ROW */}
      <div
        onClick={() => onPlay(track)}
        className={'flex md:hidden items-center justify-between gap-3 px-2 py-2 rounded-lg active:bg-white/15 cursor-pointer select-none transition ' + (isCurrent ? 'bg-white/10' : '')}
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
            <span className={'font-semibold text-sm truncate ' + (isCurrent ? 'text-spotify-green' : 'text-white')}>
              {track.name}
            </span>
            <span
              onClick={handleArtistClick}
              className="text-xs text-spotify-subdued truncate hover:underline hover:text-white"
            >
              {track.artists}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(track);
            }}
            className={'p-2 transition ' + (liked ? 'text-spotify-green' : 'text-spotify-subdued active:text-white')}
          >
            <Heart className={'w-4 h-4 ' + (liked ? 'fill-spotify-green' : '')} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openAddToPlaylist(track);
            }}
            className="p-2 text-spotify-subdued hover:text-white"
            title="Add to playlist"
          >
            <ListPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* DESKTOP ROW */}
      <div
        onClick={() => onPlay(track)}
        className={'hidden md:grid md:grid-cols-[36px_minmax(200px,3fr)_minmax(120px,2fr)_minmax(80px,1fr)_90px] items-center px-4 py-2.5 rounded-md hover:bg-white/10 cursor-pointer transition select-none text-sm ' + (isCurrent ? 'bg-white/10' : '')}
      >
        {/* Col 1: Index / Play */}
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

        {/* Col 2: Title & Artists */}
        <div className="flex items-center gap-3 overflow-hidden pr-4">
          <img
            src={track.image}
            alt={track.name}
            className="w-10 h-10 rounded object-cover shrink-0 shadow bg-black/40"
          />
          <div className="flex flex-col min-w-0">
            <span className={'font-semibold text-sm truncate ' + (isCurrent ? 'text-spotify-green' : 'text-white')}>
              {track.name}
            </span>
            <span
              onClick={handleArtistClick}
              className="text-xs text-spotify-subdued truncate hover:underline hover:text-white"
            >
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
        <div className="flex items-center justify-end gap-2 text-xs text-spotify-subdued">
          {/* Quick Enqueue */}
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
            className={'transition p-1 ' + (liked ? 'text-spotify-green opacity-100' : 'opacity-0 group-hover:opacity-100 hover:text-white')}
            title={liked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
          >
            <Heart className={'w-4 h-4 ' + (liked ? 'fill-spotify-green' : '')} />
          </button>

          {/* 3-Dot More Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              className="opacity-0 group-hover:opacity-100 hover:text-white transition p-1"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-6 w-48 bg-[#282828] border border-white/10 rounded-lg shadow-2xl py-1 text-xs text-white z-50 animate-fadeIn">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    openAddToPlaylist(track);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Add to playlist</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMenuOpen(false);
                    enqueue(track);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
                >
                  <ListPlus className="w-3.5 h-3.5" />
                  <span>Add to queue</span>
                </button>

                {onArtistClick && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      handleArtistClick(e);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Go to artist</span>
                  </button>
                )}

                {onRemoveFromPlaylist && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMenuOpen(false);
                      onRemoveFromPlaylist(track.id);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/10 flex items-center gap-2 text-red-400 hover:text-red-300 border-t border-white/10 mt-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove from playlist</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <span className="tabular-nums font-mono min-w-[36px] text-right">
            {track.durationFormatted}
          </span>
        </div>
      </div>
    </div>
  );
}
