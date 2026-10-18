'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Mic2, AlertCircle } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

interface LyricLine {
  time: number;
  text: string;
}

interface LyricsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LyricsView({ isOpen, onClose }: LyricsViewProps) {
  const { state, seek } = useAudio();
  const { currentTrack, currentTime } = state;

  const [lines, setLines] = useState<LyricLine[]>([]);
  const [isSynced, setIsSynced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Fetch lyrics when currentTrack changes
  useEffect(() => {
    if (!currentTrack || !isOpen) return;

    setLoading(true);
    fetch(`/api/music/lyrics?title=${encodeURIComponent(currentTrack.name)}&artist=${encodeURIComponent(currentTrack.artists)}&id=${encodeURIComponent(currentTrack.id)}&duration=${currentTrack.duration}`)
      .then(res => res.json())
      .then(data => {
        setLines(data.lines || []);
        setIsSynced(!!data.synced);
        setLoading(false);
      })
      .catch(() => {
        setLines([{ time: 0, text: 'Unable to load lyrics at this time.' }]);
        setLoading(false);
      });
  }, [currentTrack?.id, isOpen]);

  // Track active line
  useEffect(() => {
    if (lines.length === 0) return;

    let currIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        currIdx = i;
      } else {
        break;
      }
    }

    if (currIdx !== activeIndex) {
      setActiveIndex(currIdx);
    }
  }, [currentTime, lines]);

  // Auto-scroll active line to center smoothly
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-30 bg-gradient-to-b from-[#3b1d54] via-[#1a0b28] to-[#0a0510] text-white flex flex-col overflow-hidden animate-fadeIn select-none">
      {/* Top Header Bar */}
      <div className="h-16 px-6 sm:px-10 flex items-center justify-between border-b border-white/10 shrink-0 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          {currentTrack?.image && (
            <img
              src={currentTrack.image}
              alt={currentTrack.name}
              className="w-10 h-10 rounded object-cover shadow"
            />
          )}
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-white truncate">
              {currentTrack?.name || 'No song playing'}
            </span>
            <span className="text-xs text-white/60 truncate">
              {currentTrack?.artists}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition"
          title="Close lyrics"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center Lyrics Scrollable Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 sm:px-16 py-12 flex flex-col gap-6 custom-scrollbar"
      >
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-white/50">
            <div className="w-8 h-8 border-2 border-white/20 border-t-spotify-green rounded-full animate-spin" />
            <span className="text-sm">Fetching lyrics...</span>
          </div>
        ) : lines.length > 0 ? (
          lines.map((line, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => seek(line.time)}
                className={`transition-all duration-300 cursor-pointer font-extrabold text-2xl sm:text-4xl md:text-5xl leading-tight ${
                  isActive
                    ? 'text-white scale-[1.02] origin-left drop-shadow-md'
                    : 'text-white/35 hover:text-white/75'
                }`}
              >
                {line.text}
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/50 gap-2">
            <Mic2 className="w-12 h-12 stroke-[1.5]" />
            <span className="text-base font-semibold">Looks like we don't have the lyrics for this song.</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="h-10 px-6 sm:px-10 flex items-center justify-between text-xs text-white/40 border-t border-white/5 bg-black/30 shrink-0">
        <span>Click any lyric line to jump to that moment</span>
        <span>{isSynced ? 'Synced with music' : 'Standard lyrics'}</span>
      </div>
    </div>
  );
}
