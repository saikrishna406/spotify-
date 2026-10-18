'use client';

import React from 'react';
import { Play } from 'lucide-react';
import { Playlist } from '@/types';

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay: (playlist: Playlist) => void;
  onClick: (playlist: Playlist) => void;
}

export default function PlaylistCard({ playlist, onPlay, onClick }: PlaylistCardProps) {
  return (
    <div
      onClick={() => onClick(playlist)}
      className="group relative bg-[#181818] hover:bg-[#282828] p-4 rounded-lg flex flex-col gap-3 cursor-pointer transition-colors duration-200 shadow-md"
    >
      {/* Artwork with floating play button */}
      <div className="relative w-full aspect-square rounded-md overflow-hidden shadow-lg bg-black/40">
        <img
          src={playlist.image}
          alt={playlist.name}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Play Button Reveal */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay(playlist);
          }}
          className="absolute right-2.5 bottom-2.5 w-12 h-12 rounded-full bg-spotify-green hover:bg-spotify-green-hover text-black flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-105"
          title={`Play ${playlist.name}`}
        >
          <Play className="w-6 h-6 fill-black ml-0.5" />
        </button>
      </div>

      {/* Info */}
      <div className="flex flex-col min-w-0">
        <h3 className="font-bold text-sm text-white truncate mb-1" title={playlist.name}>
          {playlist.name}
        </h3>
        <p className="text-xs text-spotify-subdued line-clamp-2 leading-relaxed" title={playlist.description}>
          {playlist.description}
        </p>
      </div>
    </div>
  );
}
