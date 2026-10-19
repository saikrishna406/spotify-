'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import PlayerBar from '@/components/PlayerBar';
import QueueDrawer from '@/components/QueueDrawer';
import LyricsView from '@/components/LyricsView';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileLibraryDrawer from '@/components/MobileLibraryDrawer';
import TrackRow from '@/components/TrackRow';
import { Track, Playlist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';

const BROWSE_CATEGORIES = [
  { id: 'english-pop', title: 'Global Pop & English Hits', color: 'from-blue-600 to-indigo-900', query: 'English Top Hits' },
  { id: 'hiphop', title: 'Hip-Hop & R&B', color: 'from-amber-600 to-red-800', query: 'Hip Hop Hits' },
  { id: 'rock', title: 'Rock & Classics', color: 'from-rose-600 to-pink-900', query: 'Classic Rock Hits' },
  { id: 'telugu', title: 'Telugu Hits', color: 'from-emerald-600 to-teal-800', query: 'Telugu Top Hits' },
  { id: 'tamil', title: 'Tamil Blockbusters', color: 'from-purple-600 to-indigo-900', query: 'Tamil Top Hits' },
  { id: 'hindi', title: 'Bollywood Hits', color: 'from-rose-600 to-red-800', query: 'Bollywood Top Hits' },
  { id: 'south', title: 'South State Top 50', color: 'from-blue-600 to-cyan-900', query: 'South India Hits' },
  { id: 'romance', title: 'Romantic Melodies', color: 'from-pink-600 to-rose-900', query: 'Romantic Hits' },
  { id: 'anirudh', title: 'Best of Anirudh', color: 'from-amber-600 to-orange-900', query: 'Anirudh Ravichander' },
  { id: 'dsp', title: 'Devi Sri Prasad (DSP)', color: 'from-violet-600 to-purple-900', query: 'Devi Sri Prasad' },
  { id: 'party', title: 'Party & Dance', color: 'from-yellow-500 to-amber-700', query: 'Party Dance Hits' },
  { id: 'arijit', title: 'Arijit Singh Essentials', color: 'from-indigo-600 to-blue-900', query: 'Arijit Singh' },
  { id: 'sid', title: 'Sid Sriram Special', color: 'from-teal-600 to-emerald-900', query: 'Sid Sriram' },
  { id: 'punjabi', title: 'Punjabi Fire', color: 'from-orange-600 to-red-700', query: 'Punjabi Hits' },
  { id: 'devotional', title: 'Bhakti & Devotional', color: 'from-yellow-600 to-amber-800', query: 'Devotional South' }
];

export default function SearchPage() {
  const router = useRouter();
  const { playTrack } = useAudio();
  const { user } = useAuth();

  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isMobileLibraryOpen, setIsMobileLibraryOpen] = useState(false);

  // Search API fetcher
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/music/search?q=${encodeURIComponent(searchValue)}&limit=30`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.songs || []);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [searchValue]);

  const handleCategoryClick = (cat: typeof BROWSE_CATEGORIES[0]) => {
    setSelectedCategory(cat.title);
    setSearchValue(cat.query);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white font-sans select-none">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          onCreatePlaylist={() => {
            const name = prompt('Enter playlist name:');
            if (name) router.push('/');
          }}
          onOpenLikedSongs={() => router.push('/')}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-spotify-elevated rounded-none md:rounded-lg m-0 md:m-2 md:ml-0 overflow-hidden relative">
          <TopNav
            searchValue={searchValue}
            onSearchInput={(val) => {
              setSearchValue(val);
              if (selectedCategory && val !== selectedCategory) {
                setSelectedCategory(null);
              }
            }}
          />

          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 pb-36 md:pb-24 custom-scrollbar">
            {/* If searching or has results */}
            {searchValue ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {isSearching ? 'Searching...' : `Results for "${searchValue}"`}
                  </h2>
                  <button
                    onClick={() => { setSearchValue(''); setSelectedCategory(null); }}
                    className="text-xs text-spotify-subdued hover:text-white"
                  >
                    Clear search
                  </button>
                </div>

                <div className="flex flex-col gap-1 pb-24">
                  {searchResults.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={idx}
                      onPlay={(t) => playTrack(t, searchResults)}
                    />
                  ))}
                  {!isSearching && searchResults.length === 0 && (
                    <div className="py-12 text-center text-spotify-subdued text-sm">
                      No songs found for "{searchValue}". Try searching by movie or artist name.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Browse All Genres & Categories (Spotify Encore Layout) */
              <div className="flex flex-col gap-6 pb-24">
                <h1 className="text-2xl font-bold tracking-tight text-white">Browse all</h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {BROWSE_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className={`relative aspect-square rounded-xl bg-gradient-to-br ${cat.color} p-4 cursor-pointer hover:scale-[1.03] transition-transform duration-200 shadow-lg overflow-hidden group`}
                    >
                      <h3 className="font-bold text-lg text-white leading-tight break-words">
                        {cat.title}
                      </h3>
                      <div className="absolute -bottom-2 -right-3 w-16 h-16 rounded-lg bg-black/20 rotate-[25deg] shadow-md group-hover:rotate-[20deg] transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Spotify Synced Lyrics View */}
          <LyricsView
            isOpen={isLyricsOpen}
            onClose={() => setIsLyricsOpen(false)}
          />
        </main>

        {/* Slide-Out Queue Drawer */}
        {isQueueOpen && (
          <QueueDrawer onClose={() => setIsQueueOpen(false)} />
        )}
      </div>

      {/* Sticky Bottom Player Bar */}
      <PlayerBar
        onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
        isQueueOpen={isQueueOpen}
        onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
        isLyricsOpen={isLyricsOpen}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        onOpenLibrary={() => setIsMobileLibraryOpen(true)}
      />

      {/* Mobile Library Drawer */}
      <MobileLibraryDrawer
        isOpen={isMobileLibraryOpen}
        onClose={() => setIsMobileLibraryOpen(false)}
        onCreatePlaylist={() => {
          const name = prompt('Enter playlist name:');
          if (name) router.push('/');
        }}
        onOpenLikedSongs={() => router.push('/')}
        onSelectPlaylist={() => router.push('/')}
      />
    </div>
  );
}
