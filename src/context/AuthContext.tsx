'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Track, UserPlaylist } from '@/types';

interface AuthContextType {
  user: User | null;
  allFriends: User[];
  isLoading: boolean;
  login: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, pass: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  switchProfile: (username: string) => Promise<boolean>;
  toggleLike: (track: Track) => Promise<boolean>;
  createPlaylist: (name: string, desc?: string) => Promise<UserPlaylist | null>;
  addTrackToPlaylist: (playlistId: string, track: Track) => Promise<boolean>;
  isLiked: (trackId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [allFriends, setAllFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user || null);
        setAllFriends(data.allFriends || []);
      }
    } catch (err) {
      console.error('Session fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

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

  const switchProfile = async (username: string) => {
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const toggleLike = async (track: Track): Promise<boolean> => {
    if (!user) return false;
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

  const isLiked = (trackId: string): boolean => {
    return user ? user.likedSongIds.includes(trackId) : false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      allFriends,
      isLoading,
      login,
      register,
      switchProfile,
      toggleLike,
      createPlaylist,
      addTrackToPlaylist,
      isLiked
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
