'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, Plus, Heart, Music, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  onCreatePlaylist: () => void;
  onOpenLikedSongs: () => void;
}

export default function Sidebar({ onCreatePlaylist, onOpenLikedSongs }: SidebarProps) {
  const pathname = usePathname();
  const { user, openAuthModal } = useAuth();

  return (
    <aside className="hidden md:flex w-[280px] lg:w-[300px] h-full flex-col gap-2 p-2 select-none shrink-0 text-white font-sans">
      {/* Top Navigation Block */}
      <div className="bg-spotify-base rounded-lg p-4 flex flex-col gap-3">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 px-2 py-1 text-white hover:text-white transition">
          <svg className="w-8 h-8 text-spotify-green" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.304c-.218.357-.682.47-1.039.252-2.85-1.741-6.438-2.135-10.665-1.168-.409.093-.815-.164-.908-.573-.093-.409.164-.815.573-.908 4.63-1.058 8.601-.607 11.787 1.348.357.218.47.682.252 1.051zm1.468-3.265c-.275.448-.863.593-1.311.318-3.262-2.005-8.235-2.587-12.094-1.415-.506.153-1.043-.134-1.196-.64-.153-.506.134-1.043.64-1.196 4.414-1.339 9.896-.689 13.643 1.622.448.275.593.863.318 1.311zm.126-3.41c-3.911-2.322-10.354-2.535-14.088-1.401-.6.182-1.237-.158-1.419-.758-.182-.6.158-1.237.758-1.419 4.296-1.304 11.418-1.052 15.932 1.628.539.319.716 1.018.397 1.557-.319.539-1.018.716-1.557.397z"/>
          </svg>
          <span className="font-bold text-lg tracking-tight">Spotify</span>
        </Link>

        {/* Primary Links */}
        <nav className="flex flex-col gap-1">
          <Link
            href="/"
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-bold text-sm transition ${
              pathname === '/' ? 'text-white bg-white/10' : 'text-spotify-subdued hover:text-white'
            }`}
          >
            <Home className="w-6 h-6" />
            <span>Home</span>
          </Link>
          <Link
            href="/search"
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md font-bold text-sm transition ${
              pathname === '/search' ? 'text-white bg-white/10' : 'text-spotify-subdued hover:text-white'
            }`}
          >
            <Search className="w-6 h-6" />
            <span>Search</span>
          </Link>
        </nav>
      </div>

      {/* Library Section */}
      <div className="bg-spotify-base rounded-lg flex-1 flex flex-col p-3 overflow-hidden">
        {/* Library Header */}
        <div className="flex items-center justify-between px-2 py-1 mb-2">
          <div className="flex items-center gap-3 text-spotify-subdued font-bold text-sm">
            <Library className="w-6 h-6" />
            <span>Your Library</span>
          </div>
          {user && (
            <button
              onClick={onCreatePlaylist}
              className="p-1.5 rounded-full hover:bg-white/10 text-spotify-subdued hover:text-white transition flex items-center gap-1 text-xs font-semibold"
              title="Create playlist"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Create</span>
            </button>
          )}
        </div>

        {user ? (
          /* LOGGED IN USER LIBRARY ITEMS */
          <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
            {/* Filter Pills */}
            <div className="flex gap-2 px-1 mb-2">
              <span className="px-3 py-1 bg-white/10 text-white text-xs font-semibold rounded-full">
                Playlists
              </span>
            </div>

            {/* Liked Songs Entry */}
            <div
              onClick={onOpenLikedSongs}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 cursor-pointer transition group"
            >
              <div className="w-12 h-12 rounded bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shrink-0 shadow">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-sm text-white truncate group-hover:text-spotify-green transition">
                  Liked Songs
                </span>
                <span className="text-xs text-spotify-subdued flex items-center gap-1.5">
                  <span className="text-spotify-green">📌</span> Playlist • {user.likedSongIds.length} songs
                </span>
              </div>
            </div>

            {/* User Custom Playlists */}
            {user.playlists.map((pl) => (
              <div
                key={pl.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-white/10 cursor-pointer transition group"
              >
                <div className="w-12 h-12 rounded bg-spotify-elevated flex items-center justify-center shrink-0 shadow">
                  <Music className="w-5 h-5 text-spotify-subdued" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-sm text-white truncate group-hover:text-spotify-green transition">
                    {pl.name}
                  </span>
                  <span className="text-xs text-spotify-subdued truncate">
                    Playlist • {user.displayName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* GUEST USER LIBRARY PROMPT (Official Spotify Guest Experience) */
          <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-2 custom-scrollbar">
            {/* Card 1: Create your first playlist */}
            <div className="p-4 rounded-lg bg-[#242424] flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm text-white">Create your first playlist</span>
                <span className="text-xs text-spotify-subdued">It&apos;s easy, we&apos;ll help you</span>
              </div>
              <button
                onClick={() => openAuthModal('login')}
                className="self-start px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition shadow"
              >
                Create playlist
              </button>
            </div>

            {/* Card 2: Discover Podcasts */}
            <div className="p-4 rounded-lg bg-[#242424] flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-sm text-white">Let&apos;s find some songs to save</span>
                <span className="text-xs text-spotify-subdued">Sign up to build your personal music library</span>
              </div>
              <button
                onClick={() => openAuthModal('register')}
                className="self-start px-4 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:scale-105 transition shadow"
              >
                Sign up free
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
