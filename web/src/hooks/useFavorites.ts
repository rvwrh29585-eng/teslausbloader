import { useState, useCallback } from 'react';
import { getFavorites, toggleFavorite as toggleFavoriteStorage } from '../lib/storage';

export function useFavorites() {
  // Initialize with stored favorites
  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  const isFavorite = useCallback((soundId: string) => {
    return favorites.includes(soundId);
  }, [favorites]);

  const toggleFavorite = useCallback((soundId: string) => {
    const result = toggleFavoriteStorage(soundId);
    setFavorites(result.favorites);
    return result.isFavorite;
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    count: favorites.length,
  };
}
