import type { ProcessedSound } from '../hooks/useSounds';
import { formatCategoryName } from '../lib/api';

interface SoundCardProps {
  sound: ProcessedSound;
  isPlaying: boolean;
  isSelected: boolean;
  isFavorite: boolean;
  onPlay: () => void;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export function SoundCard({ 
  sound, 
  isPlaying, 
  isSelected, 
  isFavorite,
  onPlay, 
  onSelect,
  onToggleFavorite 
}: SoundCardProps) {
  return (
    <div
      className={`
        group relative p-4 rounded-xl border transition-all duration-200
        ${isSelected 
          ? 'bg-red-600/20 border-red-500' 
          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50'
        }
      `}
    >
      {/* Favorite button - top right */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className={`
          absolute top-3 right-3 p-1.5 rounded-full transition-all
          ${isFavorite
            ? 'text-pink-500 hover:text-pink-400'
            : 'text-neutral-600 hover:text-pink-500 opacity-0 group-hover:opacity-100'
          }
        `}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <HeartIcon className="w-5 h-5" filled={isFavorite} />
      </button>
      
      {/* Category badge */}
      <div className="text-xs text-neutral-500 mb-1">
        {formatCategoryName(sound.category)}
      </div>
      
      {/* Sound name */}
      <h3 className="font-medium text-white mb-3 truncate pr-6" title={sound.displayName}>
        {sound.displayName}
      </h3>
      
      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onPlay}
          className={`
            flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
            flex items-center justify-center gap-2
            ${isPlaying
              ? 'bg-red-600 text-white'
              : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
            }
          `}
        >
          {isPlaying ? (
            <>
              <PauseIcon className="w-4 h-4" />
              Playing
            </>
          ) : (
            <>
              <PlayIcon className="w-4 h-4" />
              Preview
            </>
          )}
        </button>
        
        <button
          onClick={onSelect}
          className={`
            py-2 px-3 rounded-lg text-sm font-medium transition-all
            ${isSelected
              ? 'bg-red-600 text-white'
              : 'bg-neutral-800 text-neutral-300 hover:bg-red-600 hover:text-white'
            }
          `}
          title="Select this sound"
        >
          <CheckIcon className="w-4 h-4" />
        </button>
      </div>
      
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center">
          <CheckIcon className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
