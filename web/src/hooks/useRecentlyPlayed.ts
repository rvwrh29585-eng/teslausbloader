import { useState, useCallback } from 'react';
import { getRecentlyPlayed, addRecentlyPlayed as addRecentStorage } from '../lib/storage';

export function useRecentlyPlayed() {
  // Initialize with stored recent plays
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>(() => getRecentlyPlayed());

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
