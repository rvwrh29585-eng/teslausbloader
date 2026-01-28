import { useState, useCallback, useEffect } from 'react';
import { getFavorites, toggleFavorite as toggleFavoriteStorage } from '../lib/storage';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites on mount
  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

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
