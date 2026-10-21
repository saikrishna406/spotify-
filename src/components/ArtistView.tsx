'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, Heart, Check, Clock, UserCheck } from 'lucide-react';
import { Track } from '@/types';
import TrackRow from './TrackRow';
import { useAudio } from '@/context/AudioContext';

interface ArtistViewProps {
  artistName: string;
  onBack: () => void;
  onSelectArtist?: (name: string) => void;
}

export default function ArtistView({ artistName, onBack, onSelectArtist }: ArtistViewProps) {
  const { playTrack, togglePlay, state } = useAudio();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/music/search?q=' + encodeURIComponent(artistName) + '&limit=20')
      .then(r => r.json())
      .then(d => {
        setTracks(d.songs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [artistName]);

  const topTracks = tracks.slice(0, 10);
  const heroImage = tracks[0]?.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80';
  const isPlayingArtist = state.isPlaying && state.currentTrack && topTracks.some(t => t.id === state.currentTrack?.id);

  const handlePlayArtist = () => {
    if (isPlayingArtist) {
      togglePlay();
    } else if (topTracks.length > 0) {
      playTrack(topTracks[0], topTracks);
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none animate-fadeIn pb-16">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[340px] flex flex-col justify-end p-6 sm:p-8 bg-gradient-to-b from-[#333333] to-[#121212]">
        {/* Background Image with Blur */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 blur-sm scale-105"
          style={{ backgroundImage: 'url(' + heroImage + ')' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-black/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-2">
          {/* Back button */}
          <button
            onClick={onBack}
            className="self-start text-xs font-semibold text-spotify-subdued hover:text-white mb-2 transition"
          >
            ← Back
          </button>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
            <span className="w-5 h-5 rounded-full bg-[#1da1f2] flex items-center justify-center text-white text-[11px] shadow">
              ✓
            </span>
            <span>Verified Artist</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight">
            {artistName}
          </h1>

          <div className="flex items-center gap-3 text-xs text-white/80 font-medium mt-1">
            <span>28,491,200 monthly listeners</span>
            <span>•</span>
            <span>Top Artist in India</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 px-2">
        <button
          onClick={handlePlayArtist}
          className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black flex items-center justify-center shadow-xl hover:scale-105 transition"
          title={isPlayingArtist ? 'Pause' : 'Play'}
        >
          {isPlayingArtist ? (
            <Pause className="w-7 h-7 fill-black" />
          ) : (
            <Play className="w-7 h-7 fill-black ml-0.5" />
          )}
        </button>

        <button
          onClick={() => setIsFollowing(!isFollowing)}
          className={'px-5 py-2 rounded-full border text-xs font-bold uppercase tracking-wider transition ' + (isFollowing ? 'border-white/30 text-white bg-white/10' : 'border-white/60 text-white hover:border-white hover:scale-105')}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>

      {/* Popular Tracks Table */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl font-bold text-white px-2">Popular</h2>

        {loading ? (
          <div className="p-12 text-center text-spotify-subdued">Loading top songs...</div>
        ) : (
          <div className="flex flex-col gap-1">
            <div className="hidden md:grid grid-cols-[36px_minmax(200px,3fr)_minmax(120px,2fr)_minmax(80px,1fr)_80px] px-4 py-2 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-spotify-subdued mb-1">
              <span>#</span>
              <span>Title</span>
              <span>Album</span>
              <span className="hidden sm:inline">Lang</span>
              <span className="text-right flex items-center justify-end"><Clock className="w-4 h-4" /></span>
            </div>

            {topTracks.map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx}
                onPlay={(t) => playTrack(t, topTracks)}
                onArtistClick={onSelectArtist}
              />
            ))}
          </div>
        )}
      </div>

      {/* Discography Section */}
      {tracks.length > 5 && (
        <div className="flex flex-col gap-3 pt-4">
          <h2 className="text-xl font-bold text-white px-2">Discography</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {tracks.slice(0, 10).map((t, idx) => (
              <div
                key={t.id + '-' + idx}
                onClick={() => playTrack(t, tracks)}
                className="p-3.5 rounded-lg bg-[#181818] hover:bg-[#282828] transition cursor-pointer group flex flex-col gap-2.5"
              >
                <div className="relative aspect-square rounded-md overflow-hidden bg-black/40 shadow">
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition shadow-xl hover:scale-105">
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </button>
                </div>
                <span className="font-bold text-sm text-white truncate">{t.album || t.name}</span>
                <span className="text-xs text-spotify-subdued">{t.year || 'Single'} • {t.language || 'Music'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
