import { useState } from 'react';
import type { ProcessedSound } from '../hooks/useSounds';
import { formatCategoryName } from '../lib/api';

export type CardVariant = 'grid' | 'list';

interface SoundCardProps {
  sound: ProcessedSound;
  isPlaying: boolean;
  isSelected: boolean;
  isFavorite: boolean;
  variant?: CardVariant;
  playCount?: number;
  onPlay: () => void;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export function SoundCard({ 
  sound, 
  isPlaying, 
  isSelected, 
  isFavorite,
  variant = 'grid',
  playCount = 0,
  onPlay, 
  onSelect,
  onToggleFavorite 
}: SoundCardProps) {
  const [heartAnimating, setHeartAnimating] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartAnimating(true);
    onToggleFavorite();
    setTimeout(() => setHeartAnimating(false), 300);
  };

  if (variant === 'list') {
    return (
      <div
        className={`
          group flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-150
          hover:bg-neutral-800/50
          ${isSelected 
            ? 'bg-red-600/10 border-red-500/50' 
            : 'bg-neutral-900/50 border-neutral-800/50 hover:border-neutral-700'
          }
        `}
      >
        {/* Play button */}
        <button
          onClick={onPlay}
          className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150
            hover:scale-110 active:scale-95
            ${isPlaying
              ? 'bg-red-600 text-white'
              : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
            }
          `}
        >
          {isPlaying ? (
            <PauseIcon className="w-3.5 h-3.5" />
          ) : (
            <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white text-sm truncate" title={sound.displayName}>
              {sound.displayName}
            </span>
            <span className="text-xs text-neutral-500 flex-shrink-0">
              {formatCategoryName(sound.category)}
            </span>
            {playCount > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-neutral-500 flex-shrink-0">
                <FireIcon className="w-3 h-3" />
                {playCount}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={handleFavoriteClick}
            className={`
              p-1.5 rounded-full transition-all duration-200
              ${isFavorite
                ? 'text-pink-500 hover:text-pink-400'
                : 'text-neutral-600 hover:text-pink-500 opacity-0 group-hover:opacity-100'
              }
              ${heartAnimating ? 'animate-heart-pop' : ''}
              hover:scale-110 active:scale-95
            `}
          >
            <HeartIcon className="w-4 h-4" filled={isFavorite} />
          </button>
          
          <button
            onClick={onSelect}
            className={`
              p-1.5 rounded-full transition-all duration-150
              hover:scale-110 active:scale-95
              ${isSelected
                ? 'bg-red-600 text-white'
                : 'text-neutral-500 hover:text-white hover:bg-red-600'
              }
            `}
            title="Select this sound"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Grid variant (compact)
  return (
    <div
      className={`
        group relative p-3 rounded-lg border transition-all duration-200
        hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20
        ${isSelected 
          ? 'bg-red-600/20 border-red-500 scale-[1.02]' 
          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
        }
      `}
    >
      {/* Top row: category + plays + favorite */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wide">
            {formatCategoryName(sound.category)}
          </span>
          {playCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-orange-400/80 bg-orange-500/10 px-1 py-0.5 rounded">
              <FireIcon className="w-2.5 h-2.5" />
              {playCount}
            </span>
          )}
        </div>
        <button
          onClick={handleFavoriteClick}
          className={`
            p-1 rounded-full transition-all duration-200
            ${isFavorite
              ? 'text-pink-500 hover:text-pink-400'
              : 'text-neutral-600 hover:text-pink-500 opacity-0 group-hover:opacity-100'
            }
            ${heartAnimating ? 'animate-heart-pop' : ''}
            hover:scale-110 active:scale-95
          `}
        >
          <HeartIcon className="w-4 h-4" filled={isFavorite} />
        </button>
      </div>
      
      {/* Sound name */}
      <h3 className="font-medium text-white text-sm mb-2 truncate" title={sound.displayName}>
        {sound.displayName}
      </h3>
      
      {/* Actions - inline */}
      <div className="flex gap-1.5">
        <button
          onClick={onPlay}
          className={`
            flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150
            flex items-center justify-center gap-1.5
            hover:scale-[1.02] active:scale-[0.98]
            ${isPlaying
              ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }
          `}
        >
          {isPlaying ? (
            <>
              <PauseIcon className="w-3 h-3" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-3 h-3" />
              <span>Play</span>
            </>
          )}
        </button>
        
        <button
          onClick={onSelect}
          className={`
            py-1.5 px-2 rounded-md text-xs font-medium transition-all duration-150
            hover:scale-105 active:scale-95
            ${isSelected
              ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
              : 'bg-neutral-800 text-neutral-300 hover:bg-red-600 hover:text-white'
            }
          `}
          title="Select this sound"
        >
          <CheckIcon className="w-3.5 h-3.5" />
        </button>
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center animate-bounce-in shadow-lg shadow-red-600/50">
          <CheckIcon className="w-3 h-3 text-white" />
        </div>
      )}
    </div>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg className={`${className} transition-transform`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className={`${className} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function FireIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
    </svg>
  );
}
