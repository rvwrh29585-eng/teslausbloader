import { useState, useEffect, useCallback } from 'react';
import type { ProcessedSound } from '../hooks/useSounds';
import { SparklesIcon, ShuffleIcon, PlayIcon, PauseIcon } from '../lib/icons';

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
