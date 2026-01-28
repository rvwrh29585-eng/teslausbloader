import { useState, useEffect, useCallback, useRef } from 'react';

interface SoundStats {
  plays: number;
  downloads: number;
}

interface GlobalStats {
  totalPlays: number;
  totalDownloads: number;
}

interface StatsData {
  global: GlobalStats;
  top: Record<string, SoundStats>;
}

export function useStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const pendingEvents = useRef<Array<{ soundId: string; event: 'play' | 'download' }>>([]);
  const flushTimeout = useRef<number | null>(null);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
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

  const recordEvent = useCallback((soundId: string, event: 'play' | 'download') => {
    pendingEvents.current.push({ soundId, event });
    
    // Optimistically update local state
    setStats(prev => {
      if (!prev) return prev;
      
      const soundStats = prev.top[soundId] || { plays: 0, downloads: 0 };
      const newSoundStats = {
        plays: soundStats.plays + (event === 'play' ? 1 : 0),
        downloads: soundStats.downloads + (event === 'download' ? 1 : 0),
      };
      
      return {
        global: {
          totalPlays: prev.global.totalPlays + (event === 'play' ? 1 : 0),
          totalDownloads: prev.global.totalDownloads + (event === 'download' ? 1 : 0),
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

  const getPlayCount = useCallback((soundId: string): number => {
    return stats?.top[soundId]?.plays || 0;
  }, [stats]);

  const getDownloadCount = useCallback((soundId: string): number => {
    return stats?.top[soundId]?.downloads || 0;
  }, [stats]);

  // Get top N sounds by plays
  const getTopSounds = useCallback((limit: number = 10): Array<{ soundId: string; stats: SoundStats }> => {
    if (!stats?.top) return [];
    
    return Object.entries(stats.top)
      .map(([soundId, soundStats]) => ({ soundId, stats: soundStats }))
      .sort((a, b) => b.stats.plays - a.stats.plays)
      .slice(0, limit);
  }, [stats]);

  return {
    stats,
    loading,
    recordPlay,
    recordDownload,
    getPlayCount,
    getDownloadCount,
    getTopSounds,
    globalStats: stats?.global || { totalPlays: 0, totalDownloads: 0 },
  };
}
