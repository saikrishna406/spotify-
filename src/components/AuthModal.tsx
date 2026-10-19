'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTab(initialTab);
    setError(null);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Login failed. Please check your credentials.');
    } else {
      onClose();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await register(username, password, displayName);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Registration failed. Try a different username/email.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-[460px] bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-spotify-subdued hover:text-white rounded-full hover:bg-white/10 transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <svg className="w-10 h-10 text-spotify-green" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.304c-.218.357-.682.47-1.039.252-2.85-1.741-6.438-2.135-10.665-1.168-.409.093-.815-.164-.908-.573-.093-.409.164-.815.573-.908 4.63-1.058 8.601-.607 11.787 1.348.357.218.47.682.252 1.051zm1.468-3.265c-.275.448-.863.593-1.311.318-3.262-2.005-8.235-2.587-12.094-1.415-.506.153-1.043-.134-1.196-.64-.153-.506.134-1.043.64-1.196 4.414-1.339 9.896-.689 13.643 1.622.448.275.593.863.318 1.311zm.126-3.41c-3.911-2.322-10.354-2.535-14.088-1.401-.6.182-1.237-.158-1.419-.758-.182-.6.158-1.237.758-1.419 4.296-1.304 11.418-1.052 15.932 1.628.539.319.716 1.018.397 1.557-.319.539-1.018.716-1.557.397z" />
          </svg>
          <h3 className="text-xl sm:text-2xl font-bold text-white text-center tracking-tight">
            {tab === 'login' ? 'Log in to Spotify' : 'Sign up for Spotify'}
          </h3>
          <p className="text-xs text-[#b3b3b3] text-center">
            {tab === 'login' ? 'Access your playlists, saved music and recommendations.' : 'Create your free account to start saving songs and making playlists.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 mb-5 text-sm font-bold">
          <button
            onClick={() => { setTab('login'); setError(null); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              tab === 'login' ? 'border-[#1ed760] text-white' : 'border-transparent text-[#b3b3b3] hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setTab('register'); setError(null); }}
            className={`flex-1 py-2.5 text-center border-b-2 transition ${
              tab === 'register' ? 'border-[#1ed760] text-white' : 'border-transparent text-[#b3b3b3] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 bg-[#e22134]/15 border border-[#e22134]/40 rounded text-[#ff8080] text-xs font-medium">
            {error}
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-3.5">
            <div>
              <label className="text-white font-bold text-xs mb-1.5 block">
                Email or username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email or username"
                required
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition"
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
                  placeholder="Password"
                  required
                  className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition pr-10"
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
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#b3b3b3]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-[#1ed760] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-sm transition-all duration-200 hover:scale-[1.02] shadow"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>

            <div className="text-center mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-[#b3b3b3]">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('register'); setError(null); }}
                  className="text-white hover:text-[#1ed760] underline font-bold"
                >
                  Sign up for free
                </button>
              </p>
            </div>
          </form>
        ) : (
          /* TAB 2: REGISTER FORM */
          <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
            <div>
              <label className="text-white font-bold text-xs mb-1.5 block">
                Profile display name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="What should we call you?"
                required
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition"
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
                placeholder="e.g. john or john@example.com"
                required
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition"
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
                className="w-full px-3.5 py-2.5 bg-[#181818] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-6 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-sm transition-all duration-200 hover:scale-[1.02] shadow"
            >
              {loading ? 'Creating account...' : 'Sign Up for Free'}
            </button>

            <div className="text-center mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-[#b3b3b3]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(null); }}
                  className="text-white hover:text-[#1ed760] underline font-bold"
                >
                  Log in
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
