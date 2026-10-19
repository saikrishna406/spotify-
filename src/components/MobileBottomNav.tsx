'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenLibrary: () => void;
  onHomeClick?: () => void;
}

export default function MobileBottomNav({ onOpenLibrary, onHomeClick }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isHome = pathname === '/';
  const isSearch = pathname === '/search';

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#121212]/95 backdrop-blur-lg border-t border-white/5 flex items-center justify-around z-40 select-none md:hidden px-2 shadow-2xl">
      {/* Home Tab */}
      <Link
        href="/"
        onClick={onHomeClick}
        className={`flex flex-col items-center justify-center gap-1 w-20 py-1 transition ${
          isHome ? 'text-white' : 'text-spotify-subdued hover:text-white'
        }`}
      >
        <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className={`text-[10px] font-medium ${isHome ? 'font-bold' : ''}`}>Home</span>
      </Link>

      {/* Search Tab */}
      <Link
        href="/search"
        className={`flex flex-col items-center justify-center gap-1 w-20 py-1 transition ${
          isSearch ? 'text-white' : 'text-spotify-subdued hover:text-white'
        }`}
      >
        <Search className={`w-5 h-5 ${isSearch ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className={`text-[10px] font-medium ${isSearch ? 'font-bold' : ''}`}>Search</span>
      </Link>

      {/* Your Library Tab */}
      <button
        onClick={onOpenLibrary}
        className="flex flex-col items-center justify-center gap-1 w-20 py-1 text-spotify-subdued hover:text-white transition"
      >
        <Library className="w-5 h-5 stroke-2" />
        <span className="text-[10px] font-medium">Your Library</span>
      </button>
    </nav>
  );
}
