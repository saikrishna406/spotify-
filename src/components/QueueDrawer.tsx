'use client';

import React from 'react';
import { X, Play } from 'lucide-react';
import { useAudio } from '@/context/AudioContext';

interface QueueDrawerProps {
  onClose: () => void;
}

export default function QueueDrawer({ onClose }: QueueDrawerProps) {
  const { state, playTrack, removeFromQueue } = useAudio();

  return (
    <aside className="w-[320px] h-full bg-spotify-base border-l border-white/10 flex flex-col shrink-0 select-none text-white z-20">
      {/* Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
        <h3 className="font-bold text-base text-white">Queue</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10 text-spotify-subdued hover:text-white transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 custom-scrollbar text-sm">
        {/* Now Playing */}
        <div>
          <h4 className="text-xs font-bold text-spotify-subdued uppercase tracking-wider mb-2.5">
            Now Playing
          </h4>
          {state.currentTrack ? (
            <div className="flex items-center gap-3 p-2 rounded-md bg-white/10 shadow">
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

        {/* Next in User Queue */}
        {state.userQueue.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-spotify-subdued uppercase tracking-wider mb-2.5">
              Next In Queue (Manual)
            </h4>
            <div className="flex flex-col gap-1">
              {state.userQueue.map((track, i) => (
                <div
                  key={`${track.id}-${i}`}
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

        {/* Next from Context Queue */}
        <div>
          <h4 className="text-xs font-bold text-spotify-subdued uppercase tracking-wider mb-2.5">
            Next from Playlist
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
                </div>
              ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
