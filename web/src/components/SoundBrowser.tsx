import { useState } from 'react';
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
  onPlaySound: (sound: ProcessedSound) => void;
  onSelectSound: (sound: ProcessedSound) => void;
}

export function SoundBrowser({
  sounds,
  categories,
  selectedSound,
  currentlyPlaying,
  isPlaying,
  onPlaySound,
  onSelectSound,
}: SoundBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  const filteredSounds = useFilteredSounds(sounds, searchQuery, selectedCategory);

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <div className="space-y-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <FilterIcon className="w-4 h-4" />
            {showCategories ? 'Hide categories' : 'Show categories'}
            {selectedCategory && ` (${selectedCategory})`}
          </button>
          
          <div className="text-sm text-neutral-500">
            {filteredSounds.length} sound{filteredSounds.length !== 1 ? 's' : ''}
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
      {filteredSounds.length === 0 ? (
        <div className="text-center py-12">
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
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSounds.map((sound) => (
            <SoundCard
              key={sound.id}
              sound={sound}
              isPlaying={isPlaying && currentlyPlaying === sound.id}
              isSelected={selectedSound?.id === sound.id}
              onPlay={() => onPlaySound(sound)}
              onSelect={() => onSelectSound(sound)}
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
