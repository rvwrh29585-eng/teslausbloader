import type { StatsMode } from '../hooks/useStats';

interface StatsToggleProps {
  mode: StatsMode;
  onModeChange: (mode: StatsMode) => void;
  globalStats: {
    totalPlays: number;
    totalDownloads: number;
    totalFavorites: number;
  };
}

export function StatsToggle({ mode, onModeChange, globalStats }: StatsToggleProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/50 border border-neutral-800 mb-6">
      <div className="flex items-center gap-3">
        {/* Toggle */}
        <div className="flex rounded-lg bg-neutral-800 p-1">
          <button
            onClick={() => onModeChange('worldwide')}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5
              ${mode === 'worldwide'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-400 hover:text-white'
              }
            `}
          >
            <GlobeIcon className="w-4 h-4" />
            Worldwide
          </button>
          <button
            onClick={() => onModeChange('personal')}
            className={`
              px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5
              ${mode === 'personal'
                ? 'bg-green-600 text-white'
                : 'text-neutral-400 hover:text-white'
              }
            `}
          >
            <UserIcon className="w-4 h-4" />
            My Stats
          </button>
        </div>
        
        {/* Explainer */}
        <p className="text-xs text-neutral-500 hidden sm:block">
          {mode === 'worldwide' 
            ? 'Showing what everyone is playing'
            : 'Showing your personal activity'
          }
        </p>
      </div>
      
      {/* Stats summary */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-neutral-400">
          <PlayIcon className="w-3.5 h-3.5" />
          <span className="font-medium text-white">{globalStats.totalPlays.toLocaleString()}</span>
          <span className="hidden sm:inline">plays</span>
        </div>
        {globalStats.totalFavorites > 0 && (
          <div className="flex items-center gap-1.5 text-neutral-400">
            <HeartIcon className="w-3.5 h-3.5 text-pink-500" />
            <span className="font-medium text-white">{globalStats.totalFavorites.toLocaleString()}</span>
            <span className="hidden sm:inline">favorites</span>
          </div>
        )}
      </div>
    </div>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  );
}
