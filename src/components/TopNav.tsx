'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home, Search, Bell, Download, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TopNavProps {
  onSearchInput?: (val: string) => void;
  searchValue?: string;
}

export default function TopNav({ onSearchInput, searchValue = '' }: TopNavProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 px-6 flex items-center justify-between gap-4 sticky top-0 z-20 bg-spotify-base/80 backdrop-blur-md">
      {/* History Controls + Home Icon Button */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-spotify-subdued hover:text-white transition"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => router.forward()}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-spotify-subdued hover:text-white transition"
            title="Go forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Home Circle Button */}
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] flex items-center justify-center text-white transition hover:scale-105 shadow"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </Link>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-[500px]">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-[#242424] hover:bg-[#2a2a2a] focus-within:bg-[#2a2a2a] focus-within:ring-2 focus-within:ring-white transition border border-transparent">
          <Search className="w-5 h-5 text-spotify-subdued shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchInput?.(e.target.value)}
            placeholder="What do you want to play? (Telugu, Tamil, Hindi...)"
            className="w-full bg-transparent text-sm text-white placeholder-spotify-subdued outline-none"
          />
        </div>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center gap-4 shrink-0">
        <button className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-black font-bold text-sm rounded-full hover:scale-105 transition shadow">
          <span>Explore Premium</span>
        </button>

        <button className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-white hover:scale-105 transition">
          <Download className="w-4 h-4" />
          <span>Install App</span>
        </button>

        <button className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-spotify-subdued hover:text-white transition">
          <Bell className="w-4 h-4" />
        </button>

        {/* User Profile Dropdown (Official Spotify Dropdown) */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-9 h-9 rounded-full bg-[#535353] hover:scale-105 flex items-center justify-center text-white font-bold text-sm transition shadow p-0.5"
            title={user?.displayName || 'Profile'}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span>{user?.displayName ? user.displayName[0].toUpperCase() : 'S'}</span>
            )}
          </button>

          {/* Spotify Official Profile Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-52 bg-[#282828] rounded-md shadow-2xl py-1 text-sm text-[#e0e0e0] z-50 border border-white/5 animate-fadeIn">
              <div className="px-4 py-2.5 border-b border-[#3e3e3e] flex items-center gap-2.5">
                {user?.avatarUrl && (
                  <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white text-xs truncate">{user?.displayName || 'User'}</span>
                  <span className="text-[11px] text-[#b3b3b3] truncate">@{user?.username || 'user'}</span>
                </div>
              </div>

              <Link
                href="/login"
                onClick={() => setIsDropdownOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 hover:bg-white/10 text-white transition text-xs font-semibold"
              >
                <span>Account</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#b3b3b3]" />
              </Link>

              <div
                onClick={() => setIsDropdownOpen(false)}
                className="px-4 py-2 hover:bg-white/10 text-white cursor-pointer transition text-xs"
              >
                <span>Profile</span>
              </div>

              <div
                onClick={() => setIsDropdownOpen(false)}
                className="px-4 py-2 hover:bg-white/10 text-white cursor-pointer transition text-xs"
              >
                <span>Upgrade to Premium</span>
              </div>

              <div
                onClick={() => setIsDropdownOpen(false)}
                className="px-4 py-2 hover:bg-white/10 text-white cursor-pointer transition text-xs"
              >
                <span>Settings</span>
              </div>

              <div className="border-t border-[#3e3e3e] my-1" />

              <Link
                href="/login"
                onClick={() => setIsDropdownOpen(false)}
                className="block px-4 py-2 hover:bg-white/10 text-white cursor-pointer transition text-xs font-semibold"
              >
                Log in or switch account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
