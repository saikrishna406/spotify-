'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Track, UserPlaylist } from '@/types';
import AuthModal from '@/components/AuthModal';
import SpotifySplashScreen from '@/components/SpotifySplashScreen';
import CompulsoryAuthGate from '@/components/CompulsoryAuthGate';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleLike: (track: Track) => Promise<boolean>;
  createPlaylist: (name: string, desc?: string) => Promise<UserPlaylist | null>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<boolean>;
  deletePlaylist: (playlistId: string) => Promise<boolean>;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => Promise<boolean>;
  openAddToPlaylist: (track: Track) => void;
  isLiked: (trackId: string) => boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [addToPlaylistTrack, setAddToPlaylistTrack] = useState<Track | null>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Session fetch error:', err);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'register') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openAddToPlaylist = (track: Track) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setAddToPlaylistTrack(track);
  };

  const closeAddToPlaylist = () => {
    setAddToPlaylistTrack(null);
  };

  const login = async (username: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const register = async (username: string, pass: string, name?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass, displayName: name })
      });
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.error };
      setUser(data.user);
      await fetchSession();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  const toggleLike = async (track: Track): Promise<boolean> => {
    if (!user) {
      openAuthModal('login');
      return false;
    }
    try {
      const res = await fetch('/api/user/liked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return data.isLiked;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const createPlaylist = async (name: string, desc = ''): Promise<UserPlaylist | null> => {
    if (!user) {
      openAuthModal('login');
      return null;
    }
    try {
      const res = await fetch('/api/user/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.playlist && user) {
          setUser({ ...user, playlists: [data.playlist, ...user.playlists] });
        }
        return data.playlist;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const addTrackToPlaylist = async (playlistId: string, track: Track): Promise<boolean> => {
    if (!user) {
      openAuthModal('login');
      return false;
    }
    try {
      const res = await fetch('/api/user/playlists', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistId, track })
      });
      if (res.ok) {
        const data = await res.json();
        if (user) {
          const updated = user.playlists.map(p => p.id === playlistId ? data.playlist : p);
          setUser({ ...user, playlists: updated });
        }
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const deletePlaylist = async (playlistId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/user/playlists?playlistId=' + encodeURIComponent(playlistId), {
        method: 'DELETE'
      });
      if (res.ok) {
        setUser({
          ...user,
          playlists: user.playlists.filter(p => p.id !== playlistId)
        });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const removeTrackFromPlaylist = async (playlistId: string, trackId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch('/api/user/playlists?playlistId=' + encodeURIComponent(playlistId) + '&trackId=' + encodeURIComponent(trackId), {
        method: 'DELETE'
      });
      if (res.ok) {
        const data = await res.json();
        setUser({
          ...user,
          playlists: user.playlists.map(p => p.id === playlistId ? data.playlist : p)
        });
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const isLiked = (trackId: string): boolean => {
    return user ? user.likedSongIds.includes(trackId) : false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      toggleLike,
      createPlaylist,
      addTrackToPlaylist,
      deletePlaylist,
      removeTrackFromPlaylist,
      openAddToPlaylist,
      isLiked,
      openAuthModal,
      closeAuthModal
    }}>
      {isLoading ? (
        <SpotifySplashScreen />
      ) : !user ? (
        <CompulsoryAuthGate />
      ) : (
        <>
          {children}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={closeAuthModal}
            initialTab={authModalMode}
          />
          <AddToPlaylistModal
            track={addToPlaylistTrack}
            isOpen={!!addToPlaylistTrack}
            onClose={closeAddToPlaylist}
          />
        </>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
