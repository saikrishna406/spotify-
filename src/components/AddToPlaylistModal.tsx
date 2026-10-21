'use client';

import React, { useState } from 'react';
import { X, Check, Music } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Track } from '@/types';

interface AddToPlaylistModalProps {
  track: Track | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToPlaylistModal({ track, isOpen, onClose }: AddToPlaylistModalProps) {
  const { user, addTrackToPlaylist, createPlaylist } = useAuth();
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen || !track || !user) return null;

  const handleAddToPlaylist = async (playlistId: string) => {
    setLoadingId(playlistId);
    const success = await addTrackToPlaylist(playlistId, track);
    setLoadingId(null);
    if (success) {
      setAddedIds(prev => [...prev, playlistId]);
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    setIsCreating(true);
    const pl = await createPlaylist(newPlaylistName.trim());
    if (pl) {
      await addTrackToPlaylist(pl.id, track);
      setAddedIds(prev => [...prev, pl.id]);
      setNewPlaylistName('');
      setTimeout(() => {
        onClose();
      }, 700);
    }
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-[#282828] border border-white/10 rounded-xl p-5 shadow-2xl flex flex-col gap-4 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex flex-col min-w-0 pr-2">
            <h3 className="font-bold text-base text-white">Add to playlist</h3>
            <span className="text-xs text-spotify-subdued truncate">{track.name} • {track.artists}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-spotify-subdued hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Create New Playlist */}
        <form onSubmit={handleCreateAndAdd} className="flex gap-2">
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New playlist name..."
            className="flex-1 px-3 py-1.5 rounded-full bg-[#181818] border border-white/10 focus:border-[#1ed760] text-xs text-white placeholder-spotify-subdued outline-none transition"
          />
          <button
            type="submit"
            disabled={!newPlaylistName.trim() || isCreating}
            className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:scale-105 transition disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create & Add'}
          </button>
        </form>

        {/* User Playlists List */}
        <div className="max-h-60 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
          {user.playlists.length === 0 ? (
            <p className="text-xs text-spotify-subdued py-4 text-center">No playlists created yet.</p>
          ) : (
            user.playlists.map((pl) => {
              const isAdded = addedIds.includes(pl.id) || pl.trackIds.includes(track.id);
              const isLoading = loadingId === pl.id;

              return (
                <div
                  key={pl.id}
                  onClick={() => !isAdded && handleAddToPlaylist(pl.id)}
                  className={'flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition cursor-pointer ' + (isAdded ? 'opacity-80' : '')}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded bg-[#181818] flex items-center justify-center shrink-0">
                      <Music className="w-4 h-4 text-spotify-subdued" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-xs text-white truncate">{pl.name}</span>
                      <span className="text-[10px] text-spotify-subdued">{pl.trackIds.length} songs</span>
                    </div>
                  </div>

                  {isAdded ? (
                    <span className="text-[#1ed760] flex items-center gap-1 text-xs font-bold shrink-0">
                      <Check className="w-4 h-4" /> Added
                    </span>
                  ) : (
                    <button
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition shrink-0"
                    >
                      {isLoading ? 'Adding...' : 'Add'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
