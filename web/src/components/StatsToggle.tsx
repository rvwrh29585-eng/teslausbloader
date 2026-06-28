import type { StatsMode } from '../hooks/useStats';
import { GlobeIcon, UserIcon, PlayIcon, HeartIcon } from '../lib/icons';

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

