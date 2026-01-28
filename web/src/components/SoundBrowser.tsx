import { useState, useMemo } from 'react';
import { useFilteredSounds } from '../hooks/useSounds';
import type { ProcessedSound } from '../hooks/useSounds';
import { SoundCard } from './SoundCard';
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
  onPlaySound: (sound: ProcessedSound) => void;
  onSelectSound: (sound: ProcessedSound) => void;
  onToggleFavorite: (soundId: string) => void;
}

type FilterMode = 'all' | 'favorites' | 'recent';

export function SoundBrowser({
  sounds,
  categories,
  selectedSound,
  currentlyPlaying,
  isPlaying,
  favorites,
  recentlyPlayed,
  onPlaySound,
  onSelectSound,
  onToggleFavorite,
}: SoundBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const filteredSounds = useFilteredSounds(sounds, searchQuery, selectedCategory);
  
  // Apply filter mode
  const displayedSounds = useMemo(() => {
    if (filterMode === 'favorites') {
      return filteredSounds.filter(s => favorites.includes(s.id));
    }
    if (filterMode === 'recent') {
      // Preserve order of recently played (most recent first)
      const recentSounds = recentlyPlayed
        .map(id => filteredSounds.find(s => s.id === id))
        .filter((s): s is ProcessedSound => s !== undefined);
      return recentSounds;
    }
    return filteredSounds;
  }, [filteredSounds, filterMode, favorites, recentlyPlayed]);

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="space-y-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {/* Filter mode tabs */}
            <div className="flex rounded-lg bg-neutral-900 p-1">
              <button
                onClick={() => setFilterMode('all')}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all
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
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5
                  ${filterMode === 'favorites'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                  }
                `}
              >
                <HeartIcon className="w-4 h-4" />
                Favorites
                {favorites.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-400 text-xs">
                    {favorites.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setFilterMode('recent')}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5
                  ${filterMode === 'recent'
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-400 hover:text-white'
                  }
                `}
              >
                <ClockIcon className="w-4 h-4" />
                Recent
                {recentlyPlayed.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                    {recentlyPlayed.length}
                  </span>
                )}
              </button>
            </div>
            
            <button
              onClick={() => setShowCategories(!showCategories)}
              className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
            >
              <FilterIcon className="w-4 h-4" />
              {showCategories ? 'Hide' : 'Categories'}
              {selectedCategory && (
                <span className="text-red-400">({selectedCategory})</span>
              )}
            </button>
          </div>
          
          <div className="text-sm text-neutral-500">
            {displayedSounds.length} sound{displayedSounds.length !== 1 ? 's' : ''}
          </div>
        </div>
        
        {showCategories && (
          <div className="p-4 bg-neutral-900/50 rounded-xl border border-neutral-800">
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
        )}
      </div>

      {/* Sound grid */}
      {displayedSounds.length === 0 ? (
        <div className="text-center py-12">
          {filterMode === 'favorites' ? (
            <>
              <HeartIcon className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
              <div className="text-neutral-500 mb-2">No favorites yet</div>
              <button
                onClick={() => setFilterMode('all')}
                className="text-red-500 hover:text-red-400"
              >
                Browse all sounds
              </button>
            </>
          ) : filterMode === 'recent' ? (
            <>
              <ClockIcon className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
              <div className="text-neutral-500 mb-2">No recently played sounds</div>
              <button
                onClick={() => setFilterMode('all')}
                className="text-red-500 hover:text-red-400"
              >
                Browse all sounds
              </button>
            </>
          ) : (
            <>
              <div className="text-neutral-500 mb-2">No sounds found</div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
                className="text-red-500 hover:text-red-400"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedSounds.map((sound) => (
            <SoundCard
              key={sound.id}
              sound={sound}
              isPlaying={isPlaying && currentlyPlaying === sound.id}
              isSelected={selectedSound?.id === sound.id}
              isFavorite={favorites.includes(sound.id)}
              onPlay={() => onPlaySound(sound)}
              onSelect={() => onSelectSound(sound)}
              onToggleFavorite={() => onToggleFavorite(sound.id)}
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
