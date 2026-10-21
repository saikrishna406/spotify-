'use client';

import React, { useState } from 'react';
import { X, Play, Trash2, Clock, ListMusic, Sparkles, Check } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

interface QueueDrawerProps {
  onClose: () => void;
}

export default function QueueDrawer({ onClose }: QueueDrawerProps) {
  const { state, playTrack, removeFromQueue, toggleSmartRadio } = useAudio();
  const [tab, setTab] = useState<'queue' | 'history'>('queue');

  return (
    <aside className="fixed inset-0 z-50 md:relative md:w-[340px] md:h-full bg-spotify-base border-l border-white/10 flex flex-col shrink-0 select-none text-white animate-fadeIn">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
        {/* Tab switch */}
        <div className="flex bg-[#242424] p-1 rounded-full text-xs font-bold">
          <button
            onClick={() => setTab('queue')}
            className={'px-3 py-1 rounded-full transition ' + (tab === 'queue' ? 'bg-white text-black' : 'text-spotify-subdued hover:text-white')}
          >
            Queue
          </button>
          <button
            onClick={() => setTab('history')}
            className={'px-3 py-1 rounded-full transition ' + (tab === 'history' ? 'bg-white text-black' : 'text-spotify-subdued hover:text-white')}
          >
            Recently Played
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-white/10 text-spotify-subdued hover:text-white transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar text-sm">
        {tab === 'queue' ? (
          <>
            {/* Smart Mood Radio Banner */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-950/40 to-spotify-elevated border border-emerald-500/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-spotify-green animate-pulse" />
                  <span className="font-bold text-xs text-white">Smart Mood Radio</span>
                </div>
                <button
                  onClick={toggleSmartRadio}
                  className={'text-[11px] font-bold px-2.5 py-0.5 rounded-full transition cursor-pointer ' + 
                    (state.isSmartRadio ? 'bg-spotify-green text-black hover:scale-105' : 'bg-white/10 text-spotify-subdued hover:text-white')}
                >
                  {state.isSmartRadio ? 'ACTIVE' : 'OFF'}
                </button>
              </div>
              <p className="text-[11px] text-spotify-subdued leading-tight">
                {state.isSmartRadio 
                  ? 'Auto-plays next song with matching mood, tempo & style when track finishes.' 
                  : 'Disabled. Playing standard playlist in sequential order.'}
              </p>
            </div>

            {/* Now Playing */}
            <div>
              <h4 className="text-xs font-bold text-spotify-subdued uppercase tracking-wider mb-2.5">
                Now Playing
              </h4>
              {state.currentTrack ? (
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-white/10 shadow">
                  <img
                    src={state.currentTrack.image}
                    alt={state.currentTrack.name}
                    className="w-11 h-11 rounded object-cover shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-spotify-green truncate">
                      {state.currentTrack.name}
                    </span>
                    <span className="text-xs text-spotify-subdued truncate">
                      {state.currentTrack.artists}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-spotify-subdued">No song playing</p>
              )}
            </div>

            {/* Next in User Queue (Priority 1) */}
            {state.userQueue.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-spotify-subdued uppercase tracking-wider">
                    Next In Queue (Manual)
                  </h4>
                  <button
                    onClick={() => {
                      state.userQueue.forEach((_, i) => removeFromQueue(0));
                    }}
                    className="text-[11px] font-semibold text-spotify-subdued hover:text-white flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear queue</span>
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  {state.userQueue.map((track, i) => (
                    <div
                      key={track.id + '-' + i}
                      className="group flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition cursor-pointer"
                      onClick={() => playTrack(track)}
                    >
                      <img
                        src={track.image}
                        alt={track.name}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-white truncate group-hover:text-spotify-green">
                          {track.name}
                        </span>
                        <span className="text-xs text-spotify-subdued truncate">
                          {track.artists}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromQueue(i);
                        }}
                        className="p-1 text-spotify-subdued hover:text-white opacity-0 group-hover:opacity-100 transition"
                        title="Remove from queue"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next From Smart Mood Radio (Priority 2 when enabled) */}
            {state.isSmartRadio && state.nextRecommendation && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <h4 className="text-xs font-bold text-spotify-green uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Next From Smart Mood Radio</span>
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-spotify-green border border-emerald-500/30">
                    {state.nextRecommendation.matchPercentage}% Match
                  </span>
                </div>

                <div
                  onClick={() => playTrack(state.nextRecommendation!.track)}
                  className="group flex items-center gap-3 p-2.5 rounded-lg bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-500/30 transition cursor-pointer"
                >
                  <img
                    src={state.nextRecommendation.track.image}
                    alt={state.nextRecommendation.track.name}
                    className="w-12 h-12 rounded object-cover shrink-0 shadow"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold text-white text-sm truncate group-hover:text-spotify-green transition">
                      {state.nextRecommendation.track.name}
                    </span>
                    <span className="text-xs text-spotify-subdued truncate">
                      {state.nextRecommendation.track.artists}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium truncate mt-0.5">
                      ✨ {state.nextRecommendation.primaryReason}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playTrack(state.nextRecommendation!.track);
                    }}
                    className="w-8 h-8 rounded-full bg-spotify-green text-black flex items-center justify-center shadow hover:scale-105 transition shrink-0"
                    title="Play now"
                  >
                    <Play className="w-4 h-4 fill-black ml-0.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Next from Context Queue */}
            <div>
              <h4 className="text-xs font-bold text-spotify-subdued uppercase tracking-wider mb-2.5">
                Next from Playlist / Album
              </h4>
              <div className="flex flex-col gap-1">
                {state.contextQueue
                  .filter(t => t.id !== state.currentTrack?.id)
                  .slice(0, 15)
                  .map((track) => (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className="group flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition cursor-pointer"
                    >
                      <img
                        src={track.image}
                        alt={track.name}
                        className="w-10 h-10 rounded object-cover shrink-0"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-white truncate group-hover:text-spotify-green">
                          {track.name}
                        </span>
                        <span className="text-xs text-spotify-subdued truncate">
                          {track.artists}
                        </span>
                      </div>
                      <span className="text-xs text-spotify-subdued">
                        {track.durationFormatted}
                      </span>
                    </div>
                  ))}

                {state.contextQueue.filter(t => t.id !== state.currentTrack?.id).length === 0 && (
                  <p className="text-xs text-spotify-subdued py-2">
                    {state.isSmartRadio ? 'Smart Mood Radio will automatically pick matching tracks!' : 'Queue is empty'}
                  </p>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Recently Played History Tab */
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-spotify-subdued uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Recently Played</span>
              </h4>
              <span className="text-[11px] text-spotify-subdued">
                {state.history.length} songs
              </span>
            </div>

            {state.history.length > 0 ? (
              <div className="flex flex-col gap-1">
                {state.history.map((track, idx) => (
                  <div
                    key={track.id + '-hist-' + idx}
                    onClick={() => playTrack(track)}
                    className="group flex items-center gap-3 p-2 rounded-md hover:bg-white/10 transition cursor-pointer"
                  >
                    <img
                      src={track.image}
                      alt={track.name}
                      className="w-10 h-10 rounded object-cover shrink-0"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-white truncate group-hover:text-spotify-green">
                        {track.name}
                      </span>
                      <span className="text-xs text-spotify-subdued truncate">
                        {track.artists}
                      </span>
                    </div>
                    <span className="text-xs text-spotify-subdued">
                      {track.durationFormatted}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-spotify-subdued text-xs">
                No songs played yet in this session.
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
