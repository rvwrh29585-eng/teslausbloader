import { useState, useMemo, useEffect } from 'react';
import { useFilteredSounds } from '../hooks/useSounds';
import type { ProcessedSound } from '../hooks/useSounds';
import { SoundCard } from './SoundCard';
import type { CardVariant } from './SoundCard';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';

interface Category {
  name: string;
  count: number;
}

interface SoundBrowserProps {
  sounds: ProcessedSound[];
  categories: Category[];
  selectedSound: ProcessedSound | null;
  currentlyPlaying: string | null;
  isPlaying: boolean;
  favorites: string[];
  recentlyPlayed: string[];
  getPlayCount?: (soundId: string) => number;
  onPlaySound: (sound: ProcessedSound) => void;
  onSelectSound: (sound: ProcessedSound) => void;
  onToggleFavorite: (soundId: string) => void;
  onShareSound: (sound: ProcessedSound) => void;
}

type FilterMode = 'all' | 'favorites' | 'recent';

const VIEW_PREFERENCE_KEY = 'tesla-view-mode';

export function SoundBrowser({
  sounds,
  categories,
  selectedSound,
  currentlyPlaying,
  isPlaying,
  favorites,
  recentlyPlayed,
  getPlayCount,
  onPlaySound,
  onSelectSound,
  onToggleFavorite,
  onShareSound,
}: SoundBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [viewMode, setViewMode] = useState<CardVariant>(() => {
    const saved = localStorage.getItem(VIEW_PREFERENCE_KEY);
    return (saved === 'list' || saved === 'grid') ? saved : 'grid';
  });

  // Persist view preference
  useEffect(() => {
    localStorage.setItem(VIEW_PREFERENCE_KEY, viewMode);
  }, [viewMode]);

  const filteredSounds = useFilteredSounds(sounds, searchQuery, selectedCategory);
  
  // Apply filter mode
  const displayedSounds = useMemo(() => {
    if (filterMode === 'favorites') {
      return filteredSounds.filter(s => favorites.includes(s.id));
    }
    if (filterMode === 'recent') {
      const recentSounds = recentlyPlayed
        .map(id => filteredSounds.find(s => s.id === id))
        .filter((s): s is ProcessedSound => s !== undefined);
      return recentSounds;
    }
    return filteredSounds;
  }, [filteredSounds, filterMode, favorites, recentlyPlayed]);

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="space-y-3">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter mode tabs */}
            <div className="flex rounded-lg bg-neutral-900 p-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`
                  px-2.5 py-1 rounded-md text-sm font-medium transition-all
                  ${filterMode === 'all'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                  }
                `}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('favorites')}
                className={`
                  px-2.5 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1
                  ${filterMode === 'favorites'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                  }
                `}
              >
                <HeartIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Favorites</span>
                {favorites.length > 0 && (
                  <span className="px-1 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-[10px]">
                    {favorites.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterMode('recent')}
                className={`
                  px-2.5 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1
                  ${filterMode === 'recent'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                  }
                `}
              >
                <ClockIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Recent</span>
                {recentlyPlayed.length > 0 && (
                  <span className="px-1 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px]">
                    {recentlyPlayed.length}
                  </span>
                )}
              </button>
            </div>
            
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition-colors px-2 py-1"
            >
              <FilterIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{showCategories ? 'Hide' : 'Categories'}</span>
              {selectedCategory && (
                <span className="text-red-400 text-xs">({selectedCategory})</span>
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex rounded-lg bg-neutral-900 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`
                  p-1.5 rounded-md transition-all
                  ${viewMode === 'grid'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-white'
                  }
                `}
                title="Grid view"
              >
                <GridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`
                  p-1.5 rounded-md transition-all
                  ${viewMode === 'list'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-500 hover:text-white'
                  }
                `}
                title="List view"
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
            
            <span className="text-xs text-neutral-500">
              {displayedSounds.length}
            </span>
          </div>
        </div>
        
        {showCategories && (
          <div className="p-3 bg-neutral-900/50 rounded-lg border border-neutral-800">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
              sounds={sounds}
              favorites={favorites}
            />
          </div>
        )}
      </div>

      {/* Sound grid/list */}
      {displayedSounds.length === 0 ? (
        <div className="text-center py-12">
          {filterMode === 'favorites' ? (
            <>
              <HeartIcon className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
              <div className="text-neutral-500 text-sm mb-2">No favorites yet</div>
              <button
                onClick={() => setFilterMode('all')}
                className="text-red-500 hover:text-red-400 text-sm"
              >
                Browse all sounds
              </button>
            </>
          ) : filterMode === 'recent' ? (
            <>
              <ClockIcon className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
              <div className="text-neutral-500 text-sm mb-2">No recently played</div>
              <button
                onClick={() => setFilterMode('all')}
                className="text-red-500 hover:text-red-400 text-sm"
              >
                Browse all sounds
              </button>
            </>
          ) : (
            <>
              <div className="text-neutral-500 text-sm mb-2">No sounds found</div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="text-red-500 hover:text-red-400 text-sm"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-1">
          {displayedSounds.map((sound) => (
            <SoundCard
              key={sound.id}
              sound={sound}
              variant="list"
              isPlaying={isPlaying && currentlyPlaying === sound.id}
              isSelected={selectedSound?.id === sound.id}
              isFavorite={favorites.includes(sound.id)}
              playCount={getPlayCount?.(sound.id) || 0}
              onPlay={() => onPlaySound(sound)}
              onSelect={() => onSelectSound(sound)}
              onToggleFavorite={() => onToggleFavorite(sound.id)}
              onShare={() => onShareSound(sound)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {displayedSounds.map((sound) => (
            <SoundCard
              key={sound.id}
              sound={sound}
              variant="grid"
              isPlaying={isPlaying && currentlyPlaying === sound.id}
              isSelected={selectedSound?.id === sound.id}
              isFavorite={favorites.includes(sound.id)}
              playCount={getPlayCount?.(sound.id) || 0}
              onPlay={() => onPlaySound(sound)}
              onSelect={() => onSelectSound(sound)}
              onToggleFavorite={() => onToggleFavorite(sound.id)}
              onShare={() => onShareSound(sound)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
