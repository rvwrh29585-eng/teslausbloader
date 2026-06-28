import { useState } from 'react';
import type { ProcessedSound } from '../hooks/useSounds';
import { formatCategoryName } from '../lib/api';
import { HeartIcon, PlayIcon, PauseIcon, CheckIcon, FireIcon, ShareIcon } from '../lib/icons';

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
  onShare?: () => void;
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
  onToggleFavorite,
  onShare
}: SoundCardProps) {
  const [heartAnimating, setHeartAnimating] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartAnimating(true);
    onToggleFavorite();
    setTimeout(() => setHeartAnimating(false), 300);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare?.();
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
            onClick={handleShareClick}
            className="p-1.5 rounded-full text-neutral-400 hover:text-blue-400 transition-all duration-200 hover:scale-110 active:scale-95"
            title="Share this sound"
            aria-label="Share this sound"
          >
            <ShareIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleFavoriteClick}
            className={`
              p-1.5 rounded-full transition-all duration-200
              ${isFavorite
                ? 'text-pink-500 hover:text-pink-400'
                : 'text-neutral-400 hover:text-pink-500'
              }
              ${heartAnimating ? 'animate-heart-pop' : ''}
              hover:scale-110 active:scale-95
            `}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
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
            aria-label="Select this sound"
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
      {/* Top row: category + plays + actions */}
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
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleShareClick}
            className="p-1 rounded-full text-neutral-400 hover:text-blue-400 transition-all duration-200 hover:scale-110 active:scale-95"
            title="Share"
            aria-label="Share this sound"
          >
            <ShareIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFavoriteClick}
            className={`
              p-1 rounded-full transition-all duration-200
              ${isFavorite
                ? 'text-pink-500 hover:text-pink-400'
                : 'text-neutral-400 hover:text-pink-500'
              }
              ${heartAnimating ? 'animate-heart-pop' : ''}
              hover:scale-110 active:scale-95
            `}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <HeartIcon className="w-4 h-4" filled={isFavorite} />
          </button>
        </div>
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
          aria-label="Select this sound"
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

