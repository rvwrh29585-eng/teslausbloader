import { useState } from 'react';
import type { ProcessedSound } from '../hooks/useSounds';

interface TopSound {
  soundId: string;
  stats: {
    plays: number;
    downloads: number;
    favorites: number;
  };
}

interface MostPopularProps {
  sounds: ProcessedSound[];
  topPlayed: TopSound[];
  topFavorited: TopSound[];
  currentlyPlaying: string | null;
  isPlaying: boolean;
  onPlay: (sound: ProcessedSound) => void;
  onSelect: (sound: ProcessedSound) => void;
}

type TabMode = 'played' | 'favorited';

export function MostPopular({
  sounds,
  topPlayed,
  topFavorited,
  currentlyPlaying,
  isPlaying,
  onPlay,
  onSelect,
}: MostPopularProps) {
  const [activeTab, setActiveTab] = useState<TabMode>('played');

  // Map top sounds to full sound objects
  const mapToSounds = (topSounds: TopSound[]) => 
    topSounds
      .slice(0, 5)
      .map(ts => ({
        sound: sounds.find(s => s.id === ts.soundId),
        plays: ts.stats.plays,
        downloads: ts.stats.downloads,
        favorites: ts.stats.favorites,
      }))
      .filter((item): item is { sound: ProcessedSound; plays: number; downloads: number; favorites: number } => 
        item.sound !== undefined
      );

  const popularSounds = mapToSounds(topPlayed);
  const favoritedSounds = mapToSounds(topFavorited);

  const displayedSounds = activeTab === 'played' ? popularSounds : favoritedSounds;
  const hasPlayed = popularSounds.length > 0;
  const hasFavorited = favoritedSounds.length > 0;

  if (!hasPlayed && !hasFavorited) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          {activeTab === 'played' ? (
            <>
              <TrendingIcon className="w-5 h-5 text-orange-500" />
              Most Played
            </>
          ) : (
            <>
              <HeartIcon className="w-5 h-5 text-pink-500" />
              Most Favorited
            </>
          )}
        </h2>
        
        {/* Tabs */}
        {hasPlayed && hasFavorited && (
          <div className="flex rounded-lg bg-neutral-900 p-1">
            <button
              onClick={() => setActiveTab('played')}
              className={`
                px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1
                ${activeTab === 'played'
                  ? 'bg-orange-600 text-white'
                  : 'text-neutral-400 hover:text-white'
                }
              `}
            >
              <TrendingIcon className="w-3.5 h-3.5" />
              Played
            </button>
            <button
              onClick={() => setActiveTab('favorited')}
              className={`
                px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1
                ${activeTab === 'favorited'
                  ? 'bg-pink-600 text-white'
                  : 'text-neutral-400 hover:text-white'
                }
              `}
            >
              <HeartIcon className="w-3.5 h-3.5" />
              Favorited
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {displayedSounds.map(({ sound, plays, downloads, favorites }, index) => {
          const accentColor = activeTab === 'played' ? 'orange' : 'pink';
          const isActive = currentlyPlaying === sound.id && isPlaying;
          
          return (
            <div
              key={sound.id}
              className={`
                relative p-4 rounded-xl border transition-all
                ${isActive
                  ? `bg-${accentColor}-600/20 border-${accentColor}-500 ring-2 ring-${accentColor}-500/50`
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                }
              `}
              style={isActive ? {
                backgroundColor: activeTab === 'played' ? 'rgba(234, 88, 12, 0.2)' : 'rgba(219, 39, 119, 0.2)',
                borderColor: activeTab === 'played' ? 'rgb(234, 88, 12)' : 'rgb(219, 39, 119)',
              } : {}}
            >
              {/* Rank badge */}
              <div 
                className="absolute -top-2 -left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: activeTab === 'played' ? 'rgb(234, 88, 12)' : 'rgb(219, 39, 119)' }}
              >
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
                {activeTab === 'played' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1 text-pink-400">
                      <HeartIcon className="w-3 h-3" />
                      {favorites} favorites
                    </span>
                    {plays > 0 && (
                      <span className="flex items-center gap-1">
                        <PlayIcon className="w-3 h-3" />
                        {plays}
                      </span>
                    )}
                  </>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => onPlay(sound)}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all
                    flex items-center justify-center gap-1.5
                    ${isActive
                      ? 'text-white'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                    }
                  `}
                  style={isActive ? {
                    backgroundColor: activeTab === 'played' ? 'rgb(234, 88, 12)' : 'rgb(219, 39, 119)',
                  } : {}}
                >
                  {isActive ? (
                    <PauseIcon className="w-3.5 h-3.5" />
                  ) : (
                    <PlayIcon className="w-3.5 h-3.5" />
                  )}
                  {isActive ? 'Stop' : 'Play'}
                </button>
                
                <button
                  onClick={() => onSelect(sound)}
                  className="py-2 px-3 rounded-lg text-xs font-medium text-white hover:opacity-90 transition-all"
                  style={{ backgroundColor: activeTab === 'played' ? 'rgb(234, 88, 12)' : 'rgb(219, 39, 119)' }}
                >
                  Use
                </button>
              </div>
            </div>
          );
        })}
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

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
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
