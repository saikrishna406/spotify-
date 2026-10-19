'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Music, ShieldCheck, Radio } from 'lucide-react';

export default function CompulsoryAuthGate() {
  const { login, register } = useAuth();

  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    setLoading(true);
    const res = await register(username.trim(), password, displayName.trim() || username.trim());
    setLoading(false);

    if (!res.success) {
      if (res.error && (res.error.toLowerCase().includes('already') || res.error.toLowerCase().includes('exists'))) {
        setError('This username or email is already registered. Please click Log In below.');
      } else {
        setError(res.error || 'Registration failed. Please check your inputs.');
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username/email and password.');
      return;
    }

    setLoading(true);
    const res = await login(username.trim(), password);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Invalid credentials. Please verify and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#121212] flex items-center justify-center p-4 sm:p-6 select-none bg-[radial-gradient(circle_at_50%_0%,rgba(30,215,96,0.18)_0%,rgba(18,18,18,0.98)_65%)]">
      <div className="w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative flex flex-col my-auto">
        
        {/* Header: Spotify Brand & Messaging */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-9 h-9 text-[#1ed760]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.304c-.218.357-.682.47-1.039.252-2.85-1.741-6.438-2.135-10.665-1.168-.409.093-.815-.164-.908-.573-.093-.409.164-.815.573-.908 4.63-1.058 8.601-.607 11.787 1.348.357.218.47.682.252 1.051zm1.468-3.265c-.275.448-.863.593-1.311.318-3.262-2.005-8.235-2.587-12.094-1.415-.506.153-1.043-.134-1.196-.64-.153-.506.134-1.043.64-1.196 4.414-1.339 9.896-.689 13.643 1.622.448.275.593.863.318 1.311zm.126-3.41c-3.911-2.322-10.354-2.535-14.088-1.401-.6.182-1.237-.158-1.419-.758-.182-.6.158-1.237.758-1.419 4.296-1.304 11.418-1.052 15.932 1.628.539.319.716 1.018.397 1.557-.319.539-1.018.716-1.557.397z"/>
            </svg>
            <span className="font-extrabold text-2xl tracking-tight text-white">Spotify</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {tab === 'register' ? 'Sign up to start listening' : 'Log in to continue listening'}
          </h2>
          <p className="text-xs text-[#a7a7a7] mt-1 max-w-sm">
            {tab === 'register'
              ? 'Create a free account to unlock unlimited Telugu, Tamil, Hindi, and Global music streaming.'
              : 'Welcome back! Enter your login credentials to access your library and saved songs.'}
          </p>
        </div>

        {/* Tab Toggle Switch (Sign Up default) */}
        <div className="flex bg-[#242424] p-1 rounded-full mb-6 border border-white/5">
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            className={'flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition ' + (tab === 'register' ? 'bg-[#1ed760] text-black shadow-lg' : 'text-[#a7a7a7] hover:text-white')}
          >
            Sign Up (Free)
          </button>
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            className={'flex-1 py-2 text-xs sm:text-sm font-bold rounded-full transition ' + (tab === 'login' ? 'bg-[#1ed760] text-black shadow-lg' : 'text-[#a7a7a7] hover:text-white')}
          >
            Log In
          </button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-red-200 text-xs font-medium animate-fadeIn">
            ⚠️ {error}
          </div>
        )}

        {/* TAB: REGISTER (SIGN UP COMPULSORY) */}
        {tab === 'register' ? (
          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-white block mb-1.5">
                What should we call you? (Display Name)
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Sai Krishna"
                className="w-full px-4 py-2.5 rounded-lg bg-[#242424] border border-[#3e3e3e] focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760] text-sm text-white placeholder-[#727272] outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1.5">
                Username or Email <span className="text-[#1ed760]">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. saikrishna or sai@example.com"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-[#242424] border border-[#3e3e3e] focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760] text-sm text-white placeholder-[#727272] outline-none transition"
              />
              <span className="text-[10px] text-[#727272] mt-1 block">
                Your account is saved immediately to our live cloud database.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1.5">
                Password <span className="text-[#1ed760]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#242424] border border-[#3e3e3e] focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760] text-sm text-white placeholder-[#727272] outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727272] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-extrabold text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Creating Account & Unlocking Player...</span>
                </>
              ) : (
                <span>Sign Up Free & Start Listening</span>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-[#a7a7a7]">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('login'); setError(null); }}
                  className="text-white hover:text-[#1ed760] underline font-bold"
                >
                  Log in here
                </button>
              </span>
            </div>
          </form>
        ) : (
          /* TAB: LOG IN */
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-white block mb-1.5">
                Username or Email <span className="text-[#1ed760]">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or email"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-[#242424] border border-[#3e3e3e] focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760] text-sm text-white placeholder-[#727272] outline-none transition"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-white block mb-1.5">
                Password <span className="text-[#1ed760]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="w-full px-4 py-2.5 pr-10 rounded-lg bg-[#242424] border border-[#3e3e3e] focus:border-[#1ed760] focus:ring-1 focus:ring-[#1ed760] text-sm text-white placeholder-[#727272] outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727272] hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-extrabold text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log In & Open Player</span>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-[#a7a7a7]">
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setTab('register'); setError(null); }}
                  className="text-white hover:text-[#1ed760] underline font-bold"
                >
                  Sign up for free
                </button>
              </span>
            </div>
          </form>
        )}

        {/* Feature Badges */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center gap-1">
            <Radio className="w-4 h-4 text-[#1ed760]" />
            <span className="text-[10px] text-[#b3b3b3]">HD Streaming</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Music className="w-4 h-4 text-[#1ed760]" />
            <span className="text-[10px] text-[#b3b3b3]">All Languages</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#1ed760]" />
            <span className="text-[10px] text-[#b3b3b3]">Cloud Saved</span>
          </div>
        </div>

      </div>
    </div>
  );
}
