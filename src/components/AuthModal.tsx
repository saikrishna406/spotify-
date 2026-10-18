'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Check, Users, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, allFriends, login, register, switchProfile } = useAuth();
  const [tab, setTab] = useState<'switch' | 'login' | 'register'>('switch');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Incorrect username or password.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await register(username.trim().toLowerCase(), password, displayName.trim());
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  const handleQuickSwitch = async (uname: string) => {
    setLoading(true);
    const ok = await switchProfile(uname);
    setLoading(false);
    if (ok) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="w-full max-w-[440px] bg-[#121212] border border-[#282828] rounded-xl shadow-2xl p-6 sm:p-8 text-white relative flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-[#b3b3b3] hover:text-white transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Spotify Logo (Encore DS) */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          <span className="text-xl font-bold tracking-tight">Spotify</span>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1.5 p-1 bg-black/60 rounded-full mb-5 text-xs font-semibold border border-white/5">
          <button
            onClick={() => { setTab('switch'); setError(null); }}
            className={`flex-1 py-2 px-3 rounded-full transition ${tab === 'switch' ? 'bg-[#282828] text-white shadow' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            10 Friends Switch
          </button>
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2 px-3 rounded-full transition ${tab === 'login' ? 'bg-[#282828] text-white shadow' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            Log In
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2 px-3 rounded-full transition ${tab === 'register' ? 'bg-[#282828] text-white shadow' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {/* TAB 1: 10 Friends Quick Switcher */}
        {tab === 'switch' && (
          <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
            <p className="text-xs text-[#b3b3b3] mb-1">
              Select any friend's profile to switch instantly to their personal Liked Songs, Playlists, and Queue:
            </p>
            {allFriends.map((f) => {
              const isActive = user?.username === f.username;
              return (
                <div
                  key={f.id}
                  onClick={() => handleQuickSwitch(f.username)}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                    isActive ? 'bg-[#1ed760]/15 border border-[#1ed760]/40' : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={f.avatarUrl}
                      alt={f.displayName}
                      className="w-9 h-9 rounded-full object-cover shadow"
                    />
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm text-white leading-tight">
                        {f.displayName}
                      </span>
                      <span className="text-[11px] text-[#b3b3b3]">
                        @{f.username} • {f.likedSongIds.length} liked songs
                      </span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="flex items-center gap-1 text-xs text-[#1ed760] font-bold">
                      <Check className="w-4 h-4" /> Active
                    </span>
                  ) : (
                    <span className="text-xs text-[#b3b3b3] hover:text-white">
                      Switch →
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: Official Spotify Login Clone */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            {error && (
              <div className="p-2.5 bg-[#e22134]/15 border border-[#e22134]/40 rounded text-[#ff8080] text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="text-white font-bold text-xs mb-1.5 block">
                Email or username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email or username (e.g. sai)"
                required
                className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition"
              />
            </div>

            <div>
              <label className="text-white font-bold text-xs mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password (e.g. sai123)"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727272] hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs mt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-[#1ed760] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <span
                onClick={() => alert('Default passwords for all 10 friends: <username>123 (e.g. sai123, de123, rahul123).')}
                className="text-[#b3b3b3] hover:text-white underline cursor-pointer"
              >
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-sm transition-all duration-200 hover:scale-[1.02] shadow"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <div className="text-center mt-2">
              <Link
                href="/login"
                onClick={onClose}
                className="text-xs text-[#b3b3b3] hover:text-white underline"
              >
                Open full Spotify login page ↗
              </Link>
            </div>
          </form>
        )}

        {/* TAB 3: Official Spotify Signup Clone */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
            {error && (
              <div className="p-2.5 bg-[#e22134]/15 border border-[#e22134]/40 rounded text-[#ff8080] text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="text-white font-bold text-xs mb-1.5 block">
                What should we call you?
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Profile display name"
                required
                className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition"
              />
            </div>

            <div>
              <label className="text-white font-bold text-xs mb-1.5 block">
                Username or Email
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. friend_name"
                required
                className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition"
              />
            </div>

            <div>
              <label className="text-white font-bold text-xs mb-1.5 block">
                Create a password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 4 characters"
                required
                className="w-full px-3.5 py-2.5 bg-[#121212] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-sm transition-all duration-200 hover:scale-[1.02] shadow"
            >
              {loading ? 'Creating account...' : 'Sign Up for Free'}
            </button>

            <div className="text-center mt-2">
              <Link
                href="/signup"
                onClick={onClose}
                className="text-xs text-[#b3b3b3] hover:text-white underline"
              >
                Open full Spotify multi-step signup ↗
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
