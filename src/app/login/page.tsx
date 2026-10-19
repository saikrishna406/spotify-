'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(username, password);
    setLoading(false);
    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Incorrect username or password.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 py-6 sm:py-10 font-sans selection:bg-[#1ed760] selection:text-black overflow-y-auto">
      {/* Centered Auth Card Container */}
      <div className="w-full max-w-[420px] bg-[#121212] sm:border sm:border-[#282828] rounded-xl p-6 sm:p-8 shadow-2xl flex flex-col my-auto">
        {/* Spotify Logo */}
        <div className="flex justify-center mb-5">
          <Link href="/" className="flex items-center gap-2 group">
            <svg className="w-9 h-9 text-white fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="text-xl font-bold tracking-tight">Spotify</span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center tracking-tight mb-5">
          Log in to Spotify
        </h1>

        {/* Social Buttons (Official Spotify Encore Design) */}
        <div className="flex flex-col gap-2.5 mb-4">
          <button
            type="button"
            className="w-full h-11 px-4 rounded-full border border-[#727272] hover:border-white bg-transparent hover:bg-white/5 transition flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            className="w-full h-11 px-4 rounded-full border border-[#727272] hover:border-white bg-transparent hover:bg-white/5 transition flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span>Continue with Facebook</span>
          </button>

          <button
            type="button"
            className="w-full h-11 px-4 rounded-full border border-[#727272] hover:border-white bg-transparent hover:bg-white/5 transition flex items-center justify-center gap-3 text-xs sm:text-sm font-semibold cursor-pointer"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.42c.62-.77 1.05-1.84.93-2.92-.93.04-2.02.63-2.68 1.4-.58.68-1.09 1.77-.95 2.83 1.04.08 2.08-.54 2.7-1.31z" />
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        {/* Divider with "or" */}
        <div className="relative flex items-center justify-center my-3">
          <div className="w-full border-t border-[#292929]" />
          <span className="absolute px-3 bg-[#121212] text-[11px] text-[#b3b3b3] font-semibold uppercase tracking-wider">
            or
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-3 p-2.5 rounded bg-[#e22134]/15 border border-[#e22134]/40 text-[#ff8080] text-xs font-medium">
            {error}
          </div>
        )}

        {/* Form Inputs (Encore Design Specs) */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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
                placeholder="Password"
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

          {/* Remember me toggle */}
          <div className="flex items-center gap-2 mt-0.5">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded accent-[#1ed760] cursor-pointer"
            />
            <label htmlFor="remember" className="text-xs text-white cursor-pointer select-none">
              Remember me
            </label>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-6 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-sm sm:text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center cursor-pointer select-none"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>

          {/* Forgot Password Link */}
          <div className="text-center mt-2">
            <span
              onClick={() => alert('Please contact support or reset your password if you forgot your credentials.')}
              className="text-xs text-[#b3b3b3] hover:text-white underline cursor-pointer"
            >
              Forgot your password?
            </span>
          </div>
        </form>

        {/* Bottom Banner */}
        <div className="border-t border-[#292929] mt-5 pt-3.5 text-center">
          <p className="text-xs sm:text-sm text-[#b3b3b3]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-white hover:text-[#1ed760] underline font-bold transition">
              Sign up for Spotify
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
