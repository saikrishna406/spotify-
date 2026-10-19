'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Check, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Profile Details
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('January');
  const [year, setYear] = useState('');
  const [gender, setGender] = useState('prefer_not_to_say');

  // Terms
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [shareDataConsent, setShareDataConsent] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password validation indicators
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSpecial = /[0-9#?!@$%^&*-]/.test(password);
  const hasLength = password.length >= 6; // accessible minimum

  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username or email address.');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    setError(null);
    setStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setError('Please enter what we should call you.');
      return;
    }

    setError(null);
    setLoading(true);
    const res = await register(username.trim().toLowerCase(), password, displayName.trim());
    setLoading(false);

    if (res.success) {
      router.push('/');
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] text-white flex flex-col items-center justify-start sm:justify-center p-4 sm:p-6 py-6 sm:py-10 overflow-y-auto font-sans selection:bg-[#1ed760] selection:text-black">
      {/* Centered Signup Container (Spotify Specs: max-w-[450px]) */}
      <div className="w-full max-w-[420px] bg-[#121212] sm:border sm:border-[#282828] rounded-xl p-6 sm:p-8 shadow-2xl flex flex-col my-auto">
        {/* Spotify Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <span className="text-2xl font-bold tracking-tight">Spotify</span>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-center tracking-tight mb-2">
          Sign up to start listening
        </h1>
        <p className="text-xs text-center text-[#b3b3b3] mb-6">
          Step {step} of 3
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-[#292929] h-1 rounded-full mb-6 overflow-hidden">
          <div
            className="bg-[#1ed760] h-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded bg-[#e22134]/15 border border-[#e22134]/40 text-[#ff8080] text-xs font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Email or Username */}
        {step === 1 && (
          <form onSubmit={handleNextFromStep1} className="flex flex-col gap-4">
            <div>
              <label className="text-white font-bold text-sm mb-2 block">
                Email address or username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="name@domain.com or username"
                required
                className="w-full px-4 py-3 bg-[#121212] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition"
              />
              <span className="text-xs text-[#b3b3b3] mt-1.5 block">
                This will be your login identifier across all devices.
              </span>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-8 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              Next
            </button>

            {/* Social Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-[#292929]" />
              <span className="absolute px-4 bg-[#121212] text-xs text-[#b3b3b3] font-medium uppercase tracking-wider">
                or
              </span>
            </div>

            {/* Social Buttons */}
            <button
              type="button"
              className="w-full h-12 px-6 rounded-full border border-[#727272] hover:border-white bg-transparent hover:bg-white/5 transition flex items-center justify-center gap-3 text-sm font-semibold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign up with Google</span>
            </button>
          </form>
        )}

        {/* STEP 2: Create a Password */}
        {step === 2 && (
          <form onSubmit={handleNextFromStep2} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs text-[#b3b3b3] hover:text-white mb-1 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div>
              <label className="text-white font-bold text-sm mb-2 block">
                Create a password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 bg-[#121212] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition pr-10"
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

            {/* Spotify Password Criteria Indicators */}
            <div className="p-3 bg-black/40 rounded-lg border border-white/5 flex flex-col gap-1.5 text-xs">
              <span className="font-semibold text-[#b3b3b3] mb-0.5">Your password must contain at least:</span>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${hasLetter ? 'bg-[#1ed760] text-black' : 'border border-[#727272] text-transparent'}`}>
                  ✓
                </span>
                <span className={hasLetter ? 'text-white' : 'text-[#727272]'}>1 letter</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${hasNumberOrSpecial ? 'bg-[#1ed760] text-black' : 'border border-[#727272] text-transparent'}`}>
                  ✓
                </span>
                <span className={hasNumberOrSpecial ? 'text-white' : 'text-[#727272]'}>1 number or special character</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${hasLength ? 'bg-[#1ed760] text-black' : 'border border-[#727272] text-transparent'}`}>
                  ✓
                </span>
                <span className={hasLength ? 'text-white' : 'text-[#727272]'}>6 characters</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-8 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              Next
            </button>
          </form>
        )}

        {/* STEP 3: Tell us about yourself */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-xs text-[#b3b3b3] hover:text-white mb-1 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div>
              <label className="text-white font-bold text-sm mb-1.5 block">
                What should we call you?
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Profile name"
                required
                className="w-full px-4 py-3 bg-[#121212] border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded text-sm text-white placeholder-[#727272] outline-none transition"
              />
              <span className="text-xs text-[#b3b3b3] mt-1 block">This appears on your Spotify profile.</span>
            </div>

            {/* Date of Birth (Spotify Specs) */}
            <div>
              <label className="text-white font-bold text-sm mb-1.5 block">
                What's your date of birth?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  maxLength={2}
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  placeholder="DD"
                  className="px-3 py-2.5 bg-[#121212] border border-[#727272] hover:border-white focus:border-white rounded text-sm text-white text-center outline-none"
                />
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="px-2 py-2.5 bg-[#121212] border border-[#727272] hover:border-white focus:border-white rounded text-sm text-white outline-none cursor-pointer"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m} className="bg-[#181818] text-white">{m}</option>
                  ))}
                </select>
                <input
                  type="text"
                  maxLength={4}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="YYYY"
                  className="px-3 py-2.5 bg-[#121212] border border-[#727272] hover:border-white focus:border-white rounded text-sm text-white text-center outline-none"
                />
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="text-white font-bold text-sm mb-1.5 block">
                What's your gender?
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'man', label: 'Man' },
                  { id: 'woman', label: 'Woman' },
                  { id: 'nonbinary', label: 'Non-binary' },
                  { id: 'prefer_not_to_say', label: 'Prefer not to say' }
                ].map(g => (
                  <label
                    key={g.id}
                    onClick={() => setGender(g.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition select-none ${
                      gender === g.id ? 'bg-[#1ed760]/10 border-[#1ed760] text-white font-semibold' : 'border-[#727272] hover:border-white text-[#b3b3b3]'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${gender === g.id ? 'border-[#1ed760] bg-[#1ed760]' : 'border-[#727272]'}`}>
                      {gender === g.id && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                    {g.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Terms checkboxes */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="flex items-start gap-2.5 text-xs text-[#b3b3b3] cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareDataConsent}
                  onChange={(e) => setShareDataConsent(e.target.checked)}
                  className="mt-0.5 rounded accent-[#1ed760]"
                />
                <span>Share my registration data with Spotify's content providers for marketing purposes.</span>
              </label>
            </div>

            {/* Final Sign up submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-3.5 px-8 rounded-full bg-[#1ed760] hover:bg-[#1db954] text-black font-bold text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md flex items-center justify-center"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
        )}

        {/* Bottom Banner */}
        <div className="border-t border-[#292929] mt-8 pt-6 text-center">
          <p className="text-sm text-[#b3b3b3]">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:text-[#1ed760] underline font-bold transition">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
