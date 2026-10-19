'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import TopNav from '@/components/TopNav';
import PlaylistCard from '@/components/PlaylistCard';
import TrackRow from '@/components/TrackRow';
import PlayerBar from '@/components/PlayerBar';
import QueueDrawer from '@/components/QueueDrawer';
import LyricsView from '@/components/LyricsView';
import MobileBottomNav from '@/components/MobileBottomNav';
import MobileLibraryDrawer from '@/components/MobileLibraryDrawer';
import { useAudio } from '@/context/AudioContext';
import { useAuth } from '@/context/AuthContext';
import { Playlist, Track } from '@/types';
import { Play, Pause, Heart, ChevronRight, Clock } from 'lucide-react';

export default function HomePage() {
  const { playTrack, togglePlay, state } = useAudio();
  const { user, createPlaylist, isLiked, toggleLike, openAuthModal } = useAuth();

  // Navigation / View State
  const [activeTab, setActiveTab] = useState<'all' | 'music' | 'podcasts'>('all');
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Selected Playlist / Album View
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);

  // Liked Songs View
  const [isViewingLikedSongs, setIsViewingLikedSongs] = useState(false);

  // Drawers & Lyrics
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const [isMobileLibraryOpen, setIsMobileLibraryOpen] = useState(false);

  // Featured Sections State
  const [sections, setSections] = useState<{ title: string; playlists: Playlist[] }[]>([]);

  // Load Featured Indian Sections (Telugu, Tamil, Hindi, South State)
  useEffect(() => {
    fetch('/api/music/trending')
      .then(res => res.json())
      .then(data => {
        if (data.sections) setSections(data.sections);
      })
      .catch(err => console.error('Error loading trending sections:', err));
  }, []);

  // Handle Search Input (Auto-searches Telugu, Tamil, Hindi tracks)
  useEffect(() => {
    if (!searchValue.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);
      fetch(`/api/music/search?q=${encodeURIComponent(searchValue)}&limit=25`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data.songs || []);
          setIsSearching(false);
        })
        .catch(() => setIsSearching(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Load Playlist or Album Tracks
  const handleSelectPlaylist = async (playlist: Playlist) => {
    setIsViewingLikedSongs(false);
    setSelectedPlaylist(playlist);
    setLoadingTracks(true);

    // Search or resolve tracks for this playlist / album
    const query = playlist.name.replace(/\(.*\)/, '').trim();
    try {
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}&limit=15`);
      const data = await res.json();
      setPlaylistTracks(data.songs || []);
    } catch (err) {
      console.error('Failed to load playlist tracks:', err);
    } finally {
      setLoadingTracks(false);
    }
  };

  const handlePlayPlaylist = async (playlist: Playlist) => {
    handleSelectPlaylist(playlist);
    // Fetch and play first track
    try {
      const query = playlist.name.replace(/\(.*\)/, '').trim();
      const res = await fetch(`/api/music/search?q=${encodeURIComponent(query)}&limit=15`);
      const data = await res.json();
      const tracks = data.songs || [];
      if (tracks.length > 0) {
        playTrack(tracks[0], tracks);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePlaylistPrompt = async () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    const name = prompt('Enter a name for your new playlist:', `My Playlist #${(user?.playlists.length || 0) + 1}`);
    if (name) {
      await createPlaylist(name);
    }
  };

  const handleOpenLiked = () => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setSelectedPlaylist(null);
    setIsViewingLikedSongs(true);
  };

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans">
      {/* 1. LEFT SIDEBAR */}
      <Sidebar
        onCreatePlaylist={handleCreatePlaylistPrompt}
        onOpenLikedSongs={handleOpenLiked}
      />

      {/* 2. CENTER MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-full md:h-[calc(100vh-90px)] my-0 md:my-2 mr-0 md:mr-2 bg-spotify-base rounded-none md:rounded-lg overflow-hidden relative">
        <TopNav
          searchValue={searchValue}
          onSearchInput={setSearchValue}
        />

        {/* Viewport Scroll Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-6 pb-36 md:pb-6">
          {/* SEARCH RESULTS VIEW */}
          {searchValue.trim() ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  Search results for &quot;<span className="text-spotify-green">{searchValue}</span>&quot;
                </h2>
                <button
                  onClick={() => setSearchValue('')}
                  className="text-xs font-semibold text-spotify-subdued hover:text-white"
                >
                  Clear search
                </button>
              </div>

              {isSearching ? (
                <div className="p-12 text-center text-spotify-subdued">Searching songs & artists...</div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {searchResults.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={idx}
                      onPlay={(t) => playTrack(t, searchResults)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-spotify-subdued">No songs found for "{searchValue}". Try searching by song name (e.g. Shape of You, Believer) or artist.</div>
              )}
            </div>
          ) : isViewingLikedSongs ? (
            /* LIKED SONGS VIEW */
            <div className="flex flex-col gap-6">
              {/* Hero Banner */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl bg-gradient-to-b from-[#450af5] to-spotify-base/40">
                <div className="w-32 h-32 sm:w-48 sm:h-48 rounded bg-gradient-to-br from-[#450af5] to-[#c4efd9] flex items-center justify-center shrink-0 shadow-2xl">
                  <Heart className="w-14 h-14 sm:w-20 sm:h-20 text-white fill-white" />
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Playlist</span>
                  <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Liked Songs</h1>
                  <p className="text-xs text-white/80 font-medium">
                    {user?.displayName} • {user?.likedSongIds.length || 0} songs
                  </p>
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-4 py-2">
                <button
                  onClick={() => {
                    if (user && user.likedSongsData.length > 0) {
                      playTrack(user.likedSongsData[0], user.likedSongsData);
                    }
                  }}
                  className="w-14 h-14 rounded-full bg-spotify-green hover:bg-spotify-green-hover text-black flex items-center justify-center shadow-xl hover:scale-105 transition"
                  title="Play Liked Songs"
                >
                  <Play className="w-7 h-7 fill-black ml-0.5" />
                </button>
              </div>

              {/* Track list */}
              {user?.likedSongsData && user.likedSongsData.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {user.likedSongsData.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={idx}
                      onPlay={(t) => playTrack(t, user.likedSongsData)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-spotify-subdued">
                  Songs you like will appear here. Click the heart icon on any Telugu, Tamil, or Hindi song!
                </div>
              )}
            </div>
          ) : selectedPlaylist ? (
            /* PLAYLIST / ALBUM VIEW */
            <div className="flex flex-col gap-6">
              {/* Hero Banner */}
              <div
                className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl"
                style={{
                  background: `linear-gradient(180deg, ${selectedPlaylist.color || '#333'} 0%, rgba(18,18,18,0.8) 100%)`
                }}
              >
                <img
                  src={selectedPlaylist.image}
                  alt={selectedPlaylist.name}
                  className="w-32 h-32 sm:w-48 sm:h-48 rounded object-cover shadow-2xl shrink-0"
                />
                <div className="flex flex-col gap-1 sm:gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Album / Playlist</span>
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                    {selectedPlaylist.name}
                  </h1>
                  <p className="text-xs text-white/80 max-w-xl">
                    {selectedPlaylist.description}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-white/70 font-semibold mt-1">
                    <span>{selectedPlaylist.owner}</span> • 
                    <span>{selectedPlaylist.followerCount || 'Curated'}</span> • 
                    <span>{playlistTracks.length} songs</span>
                  </div>
                </div>
              </div>

              {/* Play Button & Actions */}
              <div className="flex items-center gap-4 py-2">
                <button
                  onClick={() => {
                    if (playlistTracks.length > 0) {
                      const isCurrentPlaying = state.currentTrack && playlistTracks.some(t => t.id === state.currentTrack?.id);
                      if (isCurrentPlaying) {
                        togglePlay();
                      } else {
                        playTrack(playlistTracks[0], playlistTracks);
                      }
                    }
                  }}
                  className="w-14 h-14 rounded-full bg-spotify-green hover:bg-spotify-green-hover text-black flex items-center justify-center shadow-xl hover:scale-105 transition"
                  title={state.isPlaying && state.currentTrack && playlistTracks.some(t => t.id === state.currentTrack?.id) ? 'Pause' : 'Play'}
                >
                  {state.isPlaying && state.currentTrack && playlistTracks.some(t => t.id === state.currentTrack?.id) ? (
                    <Pause className="w-7 h-7 fill-black" />
                  ) : (
                    <Play className="w-7 h-7 fill-black ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedPlaylist(null)}
                  className="text-xs font-semibold text-spotify-subdued hover:text-white"
                >
                  ← Back to Home
                </button>
              </div>

              {/* Tracks Table */}
              <div className="flex flex-col gap-1">
                <div className="hidden md:grid grid-cols-[36px_minmax(200px,3fr)_minmax(120px,2fr)_minmax(80px,1fr)_80px] px-4 py-2 border-b border-white/10 text-xs font-bold uppercase tracking-wider text-spotify-subdued mb-2">
                  <span>#</span>
                  <span>Title</span>
                  <span>Album</span>
                  <span className="hidden sm:inline">Lang</span>
                  <span className="text-right flex items-center justify-end"><Clock className="w-4 h-4" /></span>
                </div>

                {loadingTracks ? (
                  <div className="p-8 text-center text-spotify-subdued">Loading tracks...</div>
                ) : (
                  playlistTracks.map((track, idx) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      index={idx}
                      onPlay={(t) => playTrack(t, playlistTracks)}
                    />
                  ))
                )}
              </div>
            </div>
          ) : (
            /* HOME DEFAULT VIEW (Matches User Screenshot) */
            <div className="flex flex-col gap-8 pb-12">
              {/* Category Pills: All, Music, Podcasts */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    activeTab === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('music')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    activeTab === 'music' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  Music
                </button>
                <button
                  onClick={() => setActiveTab('podcasts')}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    activeTab === 'podcasts' ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
                  }`}
                >
                  Podcasts
                </button>
              </div>

              {/* Dynamic Featured Sections (Telugu, Tamil, Hindi, South State) */}
              {sections.map((sec, i) => (
                <section key={i} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight hover:underline cursor-pointer">
                      {sec.title}
                    </h2>
                    <span className="text-xs font-bold text-spotify-subdued hover:underline cursor-pointer">
                      Show all
                    </span>
                  </div>

                  {/* Horizontal Scroll Grid of Albums / Singles */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {sec.playlists.map((pl) => (
                      <PlaylistCard
                        key={pl.id}
                        playlist={pl}
                        onPlay={handlePlayPlaylist}
                        onClick={handleSelectPlaylist}
                      />
                    ))}
                  </div>
                </section>
              ))}

              {/* Quick Language Explore Shortcuts */}
              <section className="flex flex-col gap-3 pt-2">
                <h3 className="text-lg font-bold text-white">Explore by South & National Languages</h3>
                <div className="flex flex-wrap gap-2.5">
                  {['Telugu Chartbusters', 'Tamil Melodies', 'Hindi Romance', 'Malayalam Chill', 'Kannada Hits', 'Arijit Singh', 'Anirudh Ravichander', 'Devi Sri Prasad', 'AR Rahman'].map((lang, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchValue(lang)}
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition hover:scale-105"
                    >
                      🎵 {lang}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </main>

        {/* Real-Time Spotify Synced Lyrics View */}
        <LyricsView
          isOpen={isLyricsOpen}
          onClose={() => setIsLyricsOpen(false)}
        />
      </div>

      {/* 3. RIGHT QUEUE DRAWER */}
      {isQueueOpen && (
        <QueueDrawer onClose={() => setIsQueueOpen(false)} />
      )}

      {/* 4. BOTTOM PERSISTENT PLAYER BAR */}
      <PlayerBar
        onToggleQueue={() => setIsQueueOpen(!isQueueOpen)}
        isQueueOpen={isQueueOpen}
        onToggleLyrics={() => setIsLyricsOpen(!isLyricsOpen)}
        isLyricsOpen={isLyricsOpen}
      />

      {/* 5. MOBILE BOTTOM NAVIGATION (Fixed at bottom on phones) */}
      <MobileBottomNav
        onOpenLibrary={() => setIsMobileLibraryOpen(true)}
        onHomeClick={() => {
          setSelectedPlaylist(null);
          setIsViewingLikedSongs(false);
          setSearchValue('');
        }}
      />

      {/* 6. MOBILE LIBRARY DRAWER */}
      <MobileLibraryDrawer
        isOpen={isMobileLibraryOpen}
        onClose={() => setIsMobileLibraryOpen(false)}
        onCreatePlaylist={handleCreatePlaylistPrompt}
        onOpenLikedSongs={handleOpenLiked}
        onSelectPlaylist={handleSelectPlaylist}
      />
    </div>
  );
}
