import { useMemo } from 'react';
import { formatCategoryName } from '../lib/api';
import type { ProcessedSound } from '../hooks/useSounds';

interface Category {
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (category: string | null) => void;
  sounds?: ProcessedSound[];
  favorites?: string[];
}

interface WeightedCategory extends Category {
  weight: number;
  favoriteCount: number;
}

export function CategoryFilter({ 
  categories, 
  selected, 
  onSelect,
  sounds = [],
  favorites = []
}: CategoryFilterProps) {
  
  // Calculate weighted categories
  const weightedCategories = useMemo(() => {
    const favoriteSet = new Set(favorites);
    
    // Count favorites per category
    const favoritesPerCategory: Record<string, number> = {};
    sounds.forEach(sound => {
      if (favoriteSet.has(sound.id)) {
        favoritesPerCategory[sound.category] = (favoritesPerCategory[sound.category] || 0) + 1;
      }
    });
    
    // Calculate weight for each category
    // Weight = count + (favoriteCount * 3) to give favorites a significant boost
    const weighted: WeightedCategory[] = categories.map(cat => {
      const favoriteCount = favoritesPerCategory[cat.name] || 0;
      const weight = cat.count + (favoriteCount * 3);
      return {
        ...cat,
        weight,
        favoriteCount
      };
    });
    
    // Sort by weight (highest first)
    return weighted.sort((a, b) => b.weight - a.weight);
  }, [categories, sounds, favorites]);

  // Calculate size scale based on weight
  const maxWeight = Math.max(...weightedCategories.map(c => c.weight), 1);
  const minWeight = Math.min(...weightedCategories.map(c => c.weight), 1);
  const weightRange = maxWeight - minWeight || 1;

  const getSize = (weight: number): { fontSize: string; padding: string } => {
    // Normalize weight to 0-1 scale
    const normalized = (weight - minWeight) / weightRange;
    
    // Map to size scale (small to large)
    // Font: 11px to 16px, Padding: smaller to larger
    if (normalized > 0.8) {
      return { fontSize: 'text-base', padding: 'px-4 py-2' };
    } else if (normalized > 0.6) {
      return { fontSize: 'text-sm', padding: 'px-3.5 py-1.5' };
    } else if (normalized > 0.4) {
      return { fontSize: 'text-sm', padding: 'px-3 py-1.5' };
    } else if (normalized > 0.2) {
      return { fontSize: 'text-xs', padding: 'px-2.5 py-1' };
    } else {
      return { fontSize: 'text-xs', padding: 'px-2 py-1' };
    }
  };

  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center">
      {/* All button */}
      <button
        onClick={() => onSelect(null)}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all
          ${selected === null
            ? 'bg-red-600 text-white'
            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
          }
        `}
      >
        All ({totalCount})
      </button>
      
      {/* Weighted category cloud */}
      {weightedCategories.map((category) => {
        const size = getSize(category.weight);
        const hasFavorites = category.favoriteCount > 0;
        
        return (
          <button
            key={category.name}
            onClick={() => onSelect(category.name)}
            className={`
              rounded-full font-medium transition-all duration-200
              hover:scale-105 active:scale-95
              ${size.fontSize} ${size.padding}
              ${selected === category.name
                ? 'bg-red-600 text-white'
                : hasFavorites
                  ? 'bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 border border-pink-500/30'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
              }
            `}
            title={hasFavorites ? `${category.count} sounds (${category.favoriteCount} favorited)` : `${category.count} sounds`}
          >
            <span className="flex items-center gap-1">
              {formatCategoryName(category.name)}
              <span className="opacity-60">({category.count})</span>
              {hasFavorites && (
                <HeartIcon className="w-3 h-3 text-pink-400" />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
    </svg>
  );
}
