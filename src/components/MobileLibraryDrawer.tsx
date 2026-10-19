'use client';

import React from 'react';
import { X, Plus, Heart, Folder, Music, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAudio } from '@/context/AudioContext';
import { Playlist } from '@/types';

interface MobileLibraryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlaylist: () => void;
  onOpenLikedSongs: () => void;
  onSelectPlaylist?: (playlist: Playlist) => void;
}

export default function MobileLibraryDrawer({
  isOpen,
  onClose,
  onCreatePlaylist,
  onOpenLikedSongs,
  onSelectPlaylist
}: MobileLibraryDrawerProps) {
  const { user } = useAuth();
  const { playTrack } = useAudio();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col justify-end animate-fadeIn md:hidden">
      {/* Backdrop tap to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer content */}
      <div className="w-full max-h-[85vh] bg-[#121212] border-t border-white/10 rounded-t-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header Handle & Title */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#535353] flex items-center justify-center font-bold text-xs text-white">
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Your Library</h3>
              <p className="text-xs text-spotify-subdued">{user?.displayName || 'User'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onCreatePlaylist();
              }}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-semibold"
              title="Create playlist"
            >
              <Plus className="w-4 h-4" />
              <span>Create</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-spotify-subdued hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
          {/* Liked Songs Card */}
          <div
            onClick={() => {
              onClose();
              onOpenLikedSongs();
            }}
            className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-[#450af5]/30 to-transparent hover:bg-white/10 border border-white/5 cursor-pointer transition active:scale-[0.99]"
          >
            <div className="w-12 h-12 rounded bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shrink-0 shadow">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm text-white">Liked Songs</span>
              <span className="text-xs text-spotify-subdued">
                Playlist • {user?.likedSongIds.length || 0} songs
              </span>
            </div>
          </div>

          {/* User Playlists */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-spotify-subdued uppercase tracking-wider px-1 mb-2">
              Playlists
            </h4>
            <div className="flex flex-col gap-1">
              {user?.playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => {
                    onClose();
                    if (onSelectPlaylist) {
                      onSelectPlaylist({
                        id: pl.id,
                        name: pl.name,
                        description: pl.description || 'User created playlist',
                        image: pl.image || pl.tracks[0]?.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
                        owner: user?.displayName || 'User',
                        tracks: pl.tracks
                      });
                    } else if (pl.tracks.length > 0) {
                      playTrack(pl.tracks[0], pl.tracks);
                    }
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/10 active:bg-white/15 cursor-pointer transition"
                >
                  <div className="w-11 h-11 rounded bg-[#282828] flex items-center justify-center shrink-0 text-spotify-subdued">
                    {pl.tracks[0]?.image ? (
                      <img src={pl.tracks[0].image} alt={pl.name} className="w-full h-full rounded object-cover" />
                    ) : (
                      <Music className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-sm text-white truncate">{pl.name}</span>
                    <span className="text-xs text-spotify-subdued">
                      Playlist • {pl.tracks.length} songs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
