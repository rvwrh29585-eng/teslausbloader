import type { ProcessedSound } from '../hooks/useSounds';

interface TopSound {
  soundId: string;
  stats: {
    plays: number;
    downloads: number;
  };
}

interface MostPopularProps {
  sounds: ProcessedSound[];
  topSounds: TopSound[];
  currentlyPlaying: string | null;
  isPlaying: boolean;
  onPlay: (sound: ProcessedSound) => void;
  onSelect: (sound: ProcessedSound) => void;
}

export function MostPopular({
  sounds,
  topSounds,
  currentlyPlaying,
  isPlaying,
  onPlay,
  onSelect,
}: MostPopularProps) {
  // Map top sounds to full sound objects
  const popularSounds = topSounds
    .slice(0, 5)
    .map(ts => ({
      sound: sounds.find(s => s.id === ts.soundId),
      plays: ts.stats.plays,
      downloads: ts.stats.downloads,
    }))
    .filter((item): item is { sound: ProcessedSound; plays: number; downloads: number } => 
      item.sound !== undefined
    );

  if (popularSounds.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingIcon className="w-5 h-5 text-orange-500" />
        Most Popular
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {popularSounds.map(({ sound, plays, downloads }, index) => (
          <div
            key={sound.id}
            className={`
              relative p-4 rounded-xl border transition-all
              ${currentlyPlaying === sound.id && isPlaying
                ? 'bg-orange-600/20 border-orange-500 ring-2 ring-orange-500/50'
                : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }
            `}
          >
            {/* Rank badge */}
            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              {index + 1}
            </div>
            
            <div className="text-xs text-neutral-500 mb-1 capitalize">
              {sound.category.replace(/-/g, ' ')}
            </div>
            <h3 className="font-medium text-white text-sm mb-2 truncate" title={sound.displayName}>
              {sound.displayName}
            </h3>
            
            {/* Stats */}
            <div className="flex items-center gap-3 text-[10px] text-neutral-500 mb-3">
              <span className="flex items-center gap-1">
                <PlayIcon className="w-3 h-3" />
                {plays} plays
              </span>
              {downloads > 0 && (
                <span className="flex items-center gap-1">
                  <DownloadIcon className="w-3 h-3" />
                  {downloads}
                </span>
              )}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => onPlay(sound)}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all
                  flex items-center justify-center gap-1.5
                  ${currentlyPlaying === sound.id && isPlaying
                    ? 'bg-orange-600 text-white'
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
                className="py-2 px-3 rounded-lg text-xs font-medium bg-orange-600 text-white hover:bg-orange-500 transition-all"
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

function TrendingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}
