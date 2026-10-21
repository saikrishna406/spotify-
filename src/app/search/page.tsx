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
import ArtistView from '@/components/ArtistView';
import { Track, Playlist } from '@/types';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { X, Play, Clock, UserCheck } from 'lucide-react';

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
  const [entityFilter, setEntityFilter] = useState<'all' | 'songs' | 'artists' | 'albums'>('all');
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isMobileLibraryOpen, setIsMobileLibraryOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('spotify_recent_searches');
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const clean = query.trim();
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      try { localStorage.setItem('spotify_recent_searches', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const removeRecentSearch = (query: string) => {
    setRecentSearches(prev => {
      const updated = prev.filter(s => s !== query);
      try { localStorage.setItem('spotify_recent_searches', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  // Search API fetcher
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch('/api/music/search?q=' + encodeURIComponent(searchValue) + '&limit=30')
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.songs || []);
          if (data.songs?.length > 0) saveRecentSearch(searchValue);
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

  // Extract unique artists for 'artists' tab
  const uniqueArtists = Array.from(
    new Set(searchResults.map(t => t.artists.split(',')[0].trim()))
  ).map(name => {
    const matchingTrack = searchResults.find(t => t.artists.includes(name));
    return { name, image: matchingTrack?.image || '' };
  });

  // Extract unique albums for 'albums' tab
  const uniqueAlbums = Array.from(
    new Set(searchResults.map(t => t.album))
  ).map(name => {
    const matchingTrack = searchResults.find(t => t.album === name);
    return {
      name,
      image: matchingTrack?.image || '',
      artists: matchingTrack?.artists || '',
      track: matchingTrack
    };
  });

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-black text-white font-sans select-none">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          onCreatePlaylist={() => {
            const name = prompt('Enter playlist name:');
            if (name) router.push('/');
          }}
          onOpenLikedSongs={() => router.push('/')}
          onHomeClick={() => { setSelectedArtist(null); router.push('/'); }}
          onSelectPlaylist={() => router.push('/')}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-spotify-elevated rounded-none md:rounded-lg m-0 md:m-2 md:ml-0 overflow-hidden relative">
          <TopNav
            searchValue={searchValue}
            onHomeClick={() => { setSelectedArtist(null); router.push('/'); }}
            onSearchInput={(val) => {
              setSearchValue(val);
              if (selectedCategory && val !== selectedCategory) {
                setSelectedCategory(null);
              }
            }}
          />

          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 pb-36 md:pb-24 custom-scrollbar">
            {/* ARTIST PROFILE VIEW */}
            {selectedArtist ? (
              <ArtistView
                artistName={selectedArtist}
                onBack={() => setSelectedArtist(null)}
                onSelectArtist={setSelectedArtist}
              />
            ) : searchValue ? (
              /* SEARCH RESULTS WITH ENTITY TABS (Pillar 3) */
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">
                    {isSearching ? 'Searching...' : 'Results for "' + searchValue + '"'}
                  </h2>
                  <button
                    onClick={() => { setSearchValue(''); setSelectedCategory(null); }}
                    className="text-xs text-spotify-subdued hover:text-white"
                  >
                    Clear search
                  </button>
                </div>

                {/* Entity Filter Pills */}
                <div className="flex items-center gap-2 mb-2">
                  {(['all', 'songs', 'artists', 'albums'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setEntityFilter(tab)}
                      className={'px-3.5 py-1 rounded-full text-xs font-bold capitalize transition ' + (entityFilter === tab ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15')}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* TAB: ARTISTS */}
                {entityFilter === 'artists' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-24">
                    {uniqueArtists.map((artist, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedArtist(artist.name)}
                        className="p-4 rounded-xl bg-[#181818] hover:bg-[#282828] transition cursor-pointer flex flex-col items-center text-center gap-3 group"
                      >
                        <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl bg-black/40">
                          <img src={artist.image} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        </div>
                        <span className="font-bold text-sm text-white truncate max-w-full">{artist.name}</span>
                        <span className="text-xs text-spotify-subdued">Artist</span>
                      </div>
                    ))}
                  </div>
                ) : entityFilter === 'albums' ? (
                  /* TAB: ALBUMS */
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pb-24">
                    {uniqueAlbums.map((album, i) => (
                      <div
                        key={i}
                        onClick={() => album.track && playTrack(album.track, searchResults)}
                        className="p-3.5 rounded-xl bg-[#181818] hover:bg-[#282828] transition cursor-pointer flex flex-col gap-2.5 group"
                      >
                        <div className="relative aspect-square rounded-md overflow-hidden bg-black/40 shadow">
                          <img src={album.image} alt={album.name} className="w-full h-full object-cover" />
                          <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-[#1ed760] text-black flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition shadow-xl hover:scale-105">
                            <Play className="w-5 h-5 fill-black ml-0.5" />
                          </button>
                        </div>
                        <span className="font-bold text-sm text-white truncate">{album.name}</span>
                        <span className="text-xs text-spotify-subdued truncate">{album.artists}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* TAB: SONGS & ALL */
                  <div className="flex flex-col gap-1 pb-24">
                    {searchResults.map((track, idx) => (
                      <TrackRow
                        key={track.id}
                        track={track}
                        index={idx}
                        onPlay={(t) => playTrack(t, searchResults)}
                        onArtistClick={setSelectedArtist}
                      />
                    ))}
                    {!isSearching && searchResults.length === 0 && (
                      <div className="py-12 text-center text-spotify-subdued text-sm">
                        No songs found for "{searchValue}". Try searching by movie or artist name.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* DEFAULT BROWSE ALL & RECENT SEARCHES (Pillar 3) */
              <div className="flex flex-col gap-6 pb-24">
                {/* Recent Searches Row */}
                {recentSearches.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-spotify-subdued" />
                        <span>Recent searches</span>
                      </h2>
                      <button
                        onClick={() => {
                          setRecentSearches([]);
                          try { localStorage.removeItem('spotify_recent_searches'); } catch (e) {}
                        }}
                        className="text-[11px] font-semibold text-spotify-subdued hover:text-white"
                      >
                        Clear recent
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term, i) => (
                        <div
                          key={i}
                          onClick={() => setSearchValue(term)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer transition"
                        >
                          <span>{term}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeRecentSearch(term);
                            }}
                            className="text-spotify-subdued hover:text-white p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h1 className="text-2xl font-bold tracking-tight text-white">Browse all</h1>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {BROWSE_CATEGORIES.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className={'relative aspect-square rounded-xl bg-gradient-to-br ' + cat.color + ' p-4 cursor-pointer hover:scale-[1.03] transition-transform duration-200 shadow-lg overflow-hidden group'}
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
        onHomeClick={() => { setSelectedArtist(null); router.push('/'); }}
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
