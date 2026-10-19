'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home, Search, Bell, Download, ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface TopNavProps {
  onSearchInput?: (val: string) => void;
  searchValue?: string;
  onHomeClick?: () => void;
}

export default function TopNav({ onSearchInput, searchValue = '', onHomeClick }: TopNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, openAuthModal } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleHomeClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (onHomeClick) {
      onHomeClick();
    }
    if (pathname !== '/') {
      router.push('/');
    }
  };

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 sticky top-0 z-20 bg-spotify-base/90 backdrop-blur-md">
      {/* Mobile Spotify Logo */}
      <button
        type="button"
        onClick={handleHomeClick}
        className="flex sm:hidden items-center gap-1 shrink-0 text-white cursor-pointer"
        title="Spotify Home"
      >
        <svg className="w-7 h-7 text-spotify-green" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.304c-.218.357-.682.47-1.039.252-2.85-1.741-6.438-2.135-10.665-1.168-.409.093-.815-.164-.908-.573-.093-.409.164-.815.573-.908 4.63-1.058 8.601-.607 11.787 1.348.357.218.47.682.252 1.051zm1.468-3.265c-.275.448-.863.593-1.311.318-3.262-2.005-8.235-2.587-12.094-1.415-.506.153-1.043-.134-1.196-.64-.153-.506.134-1.043.64-1.196 4.414-1.339 9.896-.689 13.643 1.622.448.275.593.863.318 1.311zm.126-3.41c-3.911-2.322-10.354-2.535-14.088-1.401-.6.182-1.237-.158-1.419-.758-.182-.6.158-1.237.758-1.419 4.296-1.304 11.418-1.052 15.932 1.628.539.319.716 1.018.397 1.557-.319.539-1.018.716-1.557.397z"/>
        </svg>
      </button>

      {/* Desktop History Controls + Home Icon Button */}
      <div className="hidden sm:flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-spotify-subdued hover:text-white transition"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => router.forward()}
            className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-spotify-subdued hover:text-white transition"
            title="Go forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Home Circle Button (Fixed to reset album/playlist/liked/search state) */}
        <button
          type="button"
          onClick={handleHomeClick}
          className="w-10 h-10 rounded-full bg-[#1f1f1f] hover:bg-[#2a2a2a] flex items-center justify-center text-white transition hover:scale-105 shadow cursor-pointer active:scale-95"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Center Search Input */}
      <div className="flex-1 max-w-[500px] min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-[#242424] hover:bg-[#2a2a2a] focus-within:bg-[#2a2a2a] focus-within:ring-2 focus-within:ring-white transition border border-transparent">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-spotify-subdued shrink-0" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchInput?.(e.target.value)}
            placeholder="Search songs, artists, albums..."
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-spotify-subdued outline-none"
          />
        </div>
      </div>

      {/* Right Action Items */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {user ? (
          /* LOGGED IN USER ACTIONS */
          <>
            <button className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 bg-white text-black font-bold text-sm rounded-full hover:scale-105 transition shadow">
              <span>Explore Premium</span>
            </button>

            <button className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-white hover:scale-105 transition">
              <Download className="w-4 h-4" />
              <span>Install App</span>
            </button>

            <button className="hidden sm:flex w-8 h-8 rounded-full hover:bg-white/10 items-center justify-center text-spotify-subdued hover:text-white transition">
              <Bell className="w-4 h-4" />
            </button>

            {/* User Profile Avatar Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-9 h-9 rounded-full bg-[#535353] hover:scale-105 flex items-center justify-center text-white font-bold text-sm transition shadow p-0.5 border border-white/20"
                title={user.displayName || user.username}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{user.displayName ? user.displayName[0].toUpperCase() : user.username[0].toUpperCase()}</span>
                )}
              </button>

              {/* Profile Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-12 w-52 bg-[#282828] rounded-md shadow-2xl py-1 text-sm text-[#e0e0e0] z-50 border border-white/5 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-[#3e3e3e] flex items-center gap-2.5">
                    {user.avatarUrl && (
                      <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white text-xs truncate">{user.displayName || user.username}</span>
                      <span className="text-[11px] text-[#b3b3b3] truncate">@{user.username}</span>
                    </div>
                  </div>

                  <div
                    onClick={() => setIsDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-white/10 text-white cursor-pointer transition text-xs flex items-center justify-between"
                  >
                    <span>Account</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#b3b3b3]" />
                  </div>

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

                  <div className="border-t border-[#3e3e3e] my-1" />

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-white/10 text-white cursor-pointer transition text-xs font-semibold flex items-center gap-2 text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* GUEST VISITOR BUTTONS */
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAuthModal('register')}
              className="text-[#a7a7a7] hover:text-white font-bold text-sm px-3 py-2 transition hover:scale-105"
            >
              Sign up
            </button>
            <button
              onClick={() => openAuthModal('login')}
              className="bg-white text-black font-bold text-sm px-6 sm:px-7 py-2.5 rounded-full hover:scale-105 transition shadow"
            >
              Log in
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
