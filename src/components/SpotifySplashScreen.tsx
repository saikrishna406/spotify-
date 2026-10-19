'use client';

import React from 'react';

export default function SpotifySplashScreen() {
  return (
    <div className="fixed inset-0 z-50 bg-[#121212] flex flex-col items-center justify-center gap-4 select-none">
      <div className="relative flex items-center justify-center animate-pulse">
        <svg className="w-16 h-16 text-[#1ed760]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.304c-.218.357-.682.47-1.039.252-2.85-1.741-6.438-2.135-10.665-1.168-.409.093-.815-.164-.908-.573-.093-.409.164-.815.573-.908 4.63-1.058 8.601-.607 11.787 1.348.357.218.47.682.252 1.051zm1.468-3.265c-.275.448-.863.593-1.311.318-3.262-2.005-8.235-2.587-12.094-1.415-.506.153-1.043-.134-1.196-.64-.153-.506.134-1.043.64-1.196 4.414-1.339 9.896-.689 13.643 1.622.448.275.593.863.318 1.311zm.126-3.41c-3.911-2.322-10.354-2.535-14.088-1.401-.6.182-1.237-.158-1.419-.758-.182-.6.158-1.237.758-1.419 4.296-1.304 11.418-1.052 15.932 1.628.539.319.716 1.018.397 1.557-.319.539-1.018.716-1.557.397z"/>
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-white font-bold tracking-tight text-lg">Spotify</span>
        <span className="text-xs text-[#b3b3b3]">Loading your music experience...</span>
      </div>
    </div>
  );
}
