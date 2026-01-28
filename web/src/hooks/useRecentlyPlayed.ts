import { useState, useCallback, useEffect } from 'react';
import { getRecentlyPlayed, addRecentlyPlayed as addRecentStorage } from '../lib/storage';

export function useRecentlyPlayed() {
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);

  // Load on mount
  useEffect(() => {
    setRecentlyPlayed(getRecentlyPlayed());
  }, []);

  const addRecentlyPlayed = useCallback((soundId: string) => {
    const updated = addRecentStorage(soundId);
    setRecentlyPlayed(updated);
  }, []);

  const isRecentlyPlayed = useCallback((soundId: string) => {
    return recentlyPlayed.includes(soundId);
  }, [recentlyPlayed]);

  return {
    recentlyPlayed,
    addRecentlyPlayed,
    isRecentlyPlayed,
    count: recentlyPlayed.length,
  };
}
