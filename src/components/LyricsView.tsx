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
    fetch('/api/music/lyrics?title=' + encodeURIComponent(currentTrack.name) + '&artist=' + encodeURIComponent(currentTrack.artists))
      .then((res) => res.json())
      .then((data) => {
        if (data.lines && data.lines.length > 0) {
          setLines(data.lines);
          setIsSynced(!!data.synced);
        } else {
          setLines([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load lyrics:', err);
        setLines([]);
        setLoading(false);
      });
  }, [currentTrack?.id, isOpen]);

  // Synchronize active lyric line with currentTime
  useEffect(() => {
    if (!lines.length || !isSynced) return;

    let idx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (currentTime >= lines[i].time) {
        idx = i;
      } else {
        break;
      }
    }

    if (idx !== activeIndex) {
      setActiveIndex(idx);
    }
  }, [currentTime, lines, isSynced, activeIndex]);

  // Spotify REA: Smooth fluid auto-scroll keeping the active lyric centered
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/95 backdrop-blur-2xl flex flex-col overflow-hidden text-white animate-fadeIn bg-[radial-gradient(ellipse_at_top,rgba(30,215,96,0.18)_0%,rgba(18,18,18,0.98)_70%)]">
      {/* Top Bar */}
      <div className="h-16 px-6 sm:px-10 flex items-center justify-between border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <Mic2 className="w-5 h-5 text-spotify-green" />
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-sm text-white truncate">
              {currentTrack?.name || 'Lyrics'}
            </span>
            <span className="text-xs text-spotify-subdued truncate">
              {currentTrack?.artists}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 text-spotify-subdued hover:text-white transition"
          title="Close lyrics"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Lyrics Body */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-6 sm:px-16 md:px-24 py-12 flex flex-col gap-6 custom-scrollbar select-none"
      >
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-spotify-subdued">
            <div className="w-8 h-8 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Fetching real-time synced lyrics...</span>
          </div>
        ) : lines.length > 0 ? (
          lines.map((line, idx) => {
            const isActive = idx === activeIndex;
            const isPast = idx < activeIndex;

            return (
              <div
                key={idx}
                ref={isActive ? activeLineRef : null}
                onClick={() => isSynced && seek(line.time)}
                className={'text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight transition-all duration-300 cursor-pointer ' + (isActive ? 'text-white scale-[1.02] filter drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]' : isPast ? 'text-white/40 hover:text-white/70' : 'text-white/20 hover:text-white/60')}
              >
                {line.text}
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-spotify-subdued text-center max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-white/30" />
            <h3 className="text-lg font-bold text-white">Looks like we don&apos;t have the lyrics for this song yet.</h3>
            <p className="text-xs text-spotify-subdued">
              Lyrics are automatically parsed from international community LRC catalogs.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
