import { useState, useEffect, useCallback } from 'react';
import type { ProcessedSound } from '../hooks/useSounds';

interface QuickPicksProps {
  sounds: ProcessedSound[];
  currentlyPlaying: string | null;
  isPlaying: boolean;
  onPlay: (sound: ProcessedSound) => void;
  onSelect: (sound: ProcessedSound) => void;
}

export function QuickPicks({ 
  sounds, 
  currentlyPlaying, 
  isPlaying, 
  onPlay, 
  onSelect 
}: QuickPicksProps) {
  const [picks, setPicks] = useState<ProcessedSound[]>([]);

  const shuffle = useCallback(() => {
    const shuffled = [...sounds].sort(() => Math.random() - 0.5);
    setPicks(shuffled.slice(0, 5));
  }, [sounds]);

  // Initialize picks on first load
  useEffect(() => {
    if (sounds.length > 0 && picks.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time initialization
      shuffle();
    }
  }, [sounds, picks.length, shuffle]);

  if (picks.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-yellow-500" />
          Quick Picks
        </h2>
        <button
          onClick={shuffle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors text-sm"
        >
          <ShuffleIcon className="w-4 h-4" />
          Shuffle
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {picks.map((sound) => (
          <div
            key={sound.id}
            className={`
              relative p-4 rounded-xl border transition-all
              ${currentlyPlaying === sound.id && isPlaying
                ? 'bg-red-600/20 border-red-500 ring-2 ring-red-500/50'
                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }
            `}
          >
            <div className="text-xs text-neutral-500 mb-1 capitalize">
              {sound.category.replace(/-/g, ' ')}
            </div>
            <h3 className="font-medium text-white text-sm mb-3 truncate" title={sound.displayName}>
              {sound.displayName}
            </h3>
            
            <div className="flex gap-2">
              <button
                onClick={() => onPlay(sound)}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all
                  flex items-center justify-center gap-1.5
                  ${currentlyPlaying === sound.id && isPlaying
                    ? 'bg-red-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  }
                `}
              >
                {currentlyPlaying === sound.id && isPlaying ? (
                  <PauseIcon className="w-3.5 h-3.5" />
                ) : (
                  <PlayIcon className="w-3.5 h-3.5" />
                )}
                {currentlyPlaying === sound.id && isPlaying ? 'Stop' : 'Play'}
              </button>
              
              <button
                onClick={() => onSelect(sound)}
                className="py-2 px-3 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-500 transition-all"
              >
                Use
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" />
    </svg>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
    </svg>
  );
}
