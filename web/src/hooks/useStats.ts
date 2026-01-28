import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface SoundStats {
  plays: number;
  downloads: number;
  favorites: number;
}

interface GlobalStats {
  totalPlays: number;
  totalDownloads: number;
  totalFavorites: number;
}

interface StatsData {
  global: GlobalStats;
  top: Record<string, SoundStats>;
}

type EventType = 'play' | 'download' | 'favorite' | 'unfavorite';
export type StatsMode = 'worldwide' | 'personal';

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

const MY_STATS_KEY = 'tesla-my-stats';
const STATS_MODE_KEY = 'tesla-stats-mode';

// ============================================================================
// PERSONAL STATS HELPERS
// ============================================================================

function getMyStats(): Record<string, SoundStats> {
  try {
    const stored = localStorage.getItem(MY_STATS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load personal stats:', e);
  }
  return {};
}

function saveMyStats(stats: Record<string, SoundStats>): void {
  localStorage.setItem(MY_STATS_KEY, JSON.stringify(stats));
}

function updateMyStats(soundId: string, event: EventType): Record<string, SoundStats> {
  const myStats = getMyStats();
  const current = myStats[soundId] || { plays: 0, downloads: 0, favorites: 0 };
  
  if (event === 'play') current.plays++;
  else if (event === 'download') current.downloads++;
  else if (event === 'favorite') current.favorites = 1;
  else if (event === 'unfavorite') current.favorites = 0;
  
  myStats[soundId] = current;
  saveMyStats(myStats);
  return myStats;
}

function getMyTotals(myStats: Record<string, SoundStats>): GlobalStats {
  return Object.values(myStats).reduce(
    (acc, s) => ({
      totalPlays: acc.totalPlays + s.plays,
      totalDownloads: acc.totalDownloads + s.downloads,
      totalFavorites: acc.totalFavorites + s.favorites,
    }),
    { totalPlays: 0, totalDownloads: 0, totalFavorites: 0 }
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useStats() {
  const [worldwideStats, setWorldwideStats] = useState<StatsData | null>(null);
  const [myStats, setMyStats] = useState<Record<string, SoundStats>>({});
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<StatsMode>(() => {
    const saved = localStorage.getItem(STATS_MODE_KEY);
    return saved === 'personal' ? 'personal' : 'worldwide';
  });
  
  // Session deduplication - track what's been recorded this session
  const sessionPlays = useRef<Set<string>>(new Set());
  const sessionDownloads = useRef<Set<string>>(new Set());
  
  const pendingEvents = useRef<Array<{ soundId: string; event: EventType }>>([]);
  const flushTimeout = useRef<number | null>(null);

  // Load data on mount
  useEffect(() => {
    fetchWorldwideStats();
    setMyStats(getMyStats());
  }, []);

  // Persist mode preference
  useEffect(() => {
    localStorage.setItem(STATS_MODE_KEY, mode);
  }, [mode]);

  const fetchWorldwideStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setWorldwideStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    } finally {
      setLoading(false);
    }
  };

  // Batch events and send them (debounced)
  const flushEvents = useCallback(async () => {
    const events = [...pendingEvents.current];
    pendingEvents.current = [];
    
    for (const event of events) {
      try {
        await fetch('/api/stats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
      } catch (e) {
        console.error('Failed to record stat:', e);
      }
    }
  }, []);

  const recordEvent = useCallback((soundId: string, event: EventType, skipDedup = false) => {
    // Session deduplication for plays and downloads
    if (!skipDedup) {
      if (event === 'play') {
        if (sessionPlays.current.has(soundId)) {
          // Already played this session, only update personal stats
          const updated = updateMyStats(soundId, event);
          setMyStats(updated);
          return;
        }
        sessionPlays.current.add(soundId);
      } else if (event === 'download') {
        if (sessionDownloads.current.has(soundId)) {
          const updated = updateMyStats(soundId, event);
          setMyStats(updated);
          return;
        }
        sessionDownloads.current.add(soundId);
      }
    }
    
    // Update personal stats
    const updated = updateMyStats(soundId, event);
    setMyStats(updated);
    
    // Queue for worldwide stats
    pendingEvents.current.push({ soundId, event });
    
    // Optimistically update worldwide state
    setWorldwideStats(prev => {
      if (!prev) return prev;
      
      const soundStats = prev.top[soundId] || { plays: 0, downloads: 0, favorites: 0 };
      const newSoundStats = {
        plays: soundStats.plays + (event === 'play' ? 1 : 0),
        downloads: soundStats.downloads + (event === 'download' ? 1 : 0),
        favorites: soundStats.favorites + (event === 'favorite' ? 1 : event === 'unfavorite' ? -1 : 0),
      };
      
      return {
        global: {
          totalPlays: prev.global.totalPlays + (event === 'play' ? 1 : 0),
          totalDownloads: prev.global.totalDownloads + (event === 'download' ? 1 : 0),
          totalFavorites: prev.global.totalFavorites + (event === 'favorite' ? 1 : event === 'unfavorite' ? -1 : 0),
        },
        top: {
          ...prev.top,
          [soundId]: newSoundStats,
        },
      };
    });
    
    // Debounce the flush
    if (flushTimeout.current) {
      clearTimeout(flushTimeout.current);
    }
    flushTimeout.current = window.setTimeout(flushEvents, 1000);
  }, [flushEvents]);

  const recordPlay = useCallback((soundId: string) => {
    recordEvent(soundId, 'play');
  }, [recordEvent]);

  const recordDownload = useCallback((soundId: string) => {
    recordEvent(soundId, 'download');
  }, [recordEvent]);

  const recordFavorite = useCallback((soundId: string, isFavoriting: boolean) => {
    // Favorites don't need dedup - they toggle
    recordEvent(soundId, isFavoriting ? 'favorite' : 'unfavorite', true);
  }, [recordEvent]);

  // Get play count based on mode
  const getPlayCount = useCallback((soundId: string): number => {
    if (mode === 'personal') {
      return myStats[soundId]?.plays || 0;
    }
    return worldwideStats?.top[soundId]?.plays || 0;
  }, [mode, myStats, worldwideStats]);

  const getDownloadCount = useCallback((soundId: string): number => {
    if (mode === 'personal') {
      return myStats[soundId]?.downloads || 0;
    }
    return worldwideStats?.top[soundId]?.downloads || 0;
  }, [mode, myStats, worldwideStats]);

  const getFavoriteCount = useCallback((soundId: string): number => {
    if (mode === 'personal') {
      return myStats[soundId]?.favorites || 0;
    }
    return worldwideStats?.top[soundId]?.favorites || 0;
  }, [mode, myStats, worldwideStats]);

  // Get top N sounds by plays (based on mode)
  const getTopSounds = useCallback((limit: number = 10): Array<{ soundId: string; stats: SoundStats }> => {
    const source = mode === 'personal' ? myStats : worldwideStats?.top;
    if (!source) return [];
    
    return Object.entries(source)
      .map(([soundId, soundStats]) => ({ soundId, stats: soundStats }))
      .filter(item => item.stats.plays > 0)
      .sort((a, b) => b.stats.plays - a.stats.plays)
      .slice(0, limit);
  }, [mode, myStats, worldwideStats]);

  // Get top N sounds by favorites (based on mode)
  const getTopFavorited = useCallback((limit: number = 10): Array<{ soundId: string; stats: SoundStats }> => {
    const source = mode === 'personal' ? myStats : worldwideStats?.top;
    if (!source) return [];
    
    return Object.entries(source)
      .map(([soundId, soundStats]) => ({ soundId, stats: soundStats }))
      .filter(item => item.stats.favorites > 0)
      .sort((a, b) => b.stats.favorites - a.stats.favorites)
      .slice(0, limit);
  }, [mode, myStats, worldwideStats]);

  // Get global stats based on mode
  const globalStats = mode === 'personal' 
    ? getMyTotals(myStats)
    : (worldwideStats?.global || { totalPlays: 0, totalDownloads: 0, totalFavorites: 0 });

  return {
    // Data
    worldwideStats,
    myStats,
    globalStats,
    loading,
    
    // Mode
    mode,
    setMode,
    
    // Recording
    recordPlay,
    recordDownload,
    recordFavorite,
    
    // Getters (mode-aware)
    getPlayCount,
    getDownloadCount,
    getFavoriteCount,
    getTopSounds,
    getTopFavorited,
  };
}
