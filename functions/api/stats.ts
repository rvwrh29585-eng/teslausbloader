// Stats tracking API using Cloudflare KV
// KV key format: "stats:{soundId}" -> { plays: number, downloads: number }
// Also: "stats:_global" -> { totalPlays: number, totalDownloads: number }
// Also: "stats:_top" -> cached top sounds list

interface Env {
  STATS: KVNamespace;
}

interface SoundStats {
  plays: number;
  downloads: number;
  favorites: number;
}

interface GlobalStats {
  totalPlays: number;
  totalDownloads: number;
  totalFavorites: number;
  lastUpdated: string;
}

// GET /api/stats - Get stats for all sounds or specific sound
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const soundId = url.searchParams.get('sound');
  
  try {
    // If requesting specific sound stats
    if (soundId) {
      const stats = await context.env.STATS.get(`stats:${soundId}`, 'json') as SoundStats | null;
      return Response.json(stats || { plays: 0, downloads: 0 });
    }
    
    // Get top sounds (cached list)
    const topSounds = await context.env.STATS.get('stats:_top', 'json') as Record<string, SoundStats> | null;
    const globalStats = await context.env.STATS.get('stats:_global', 'json') as GlobalStats | null;
    
    return Response.json({
      global: globalStats || { totalPlays: 0, totalDownloads: 0, totalFavorites: 0 },
      top: topSounds || {}
    });
  } catch (e) {
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
};

// POST /api/stats - Record a play, download, or favorite event
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { soundId: string; event: 'play' | 'download' | 'favorite' | 'unfavorite' };
    const { soundId, event } = body;
    
    if (!soundId || !event || !['play', 'download', 'favorite', 'unfavorite'].includes(event)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    // Get current stats for this sound
    const currentStats = await context.env.STATS.get(`stats:${soundId}`, 'json') as SoundStats | null;
    const stats: SoundStats = currentStats || { plays: 0, downloads: 0, favorites: 0 };
    
    // Increment/decrement the appropriate counter
    if (event === 'play') {
      stats.plays++;
    } else if (event === 'download') {
      stats.downloads++;
    } else if (event === 'favorite') {
      stats.favorites++;
    } else if (event === 'unfavorite') {
      stats.favorites = Math.max(0, stats.favorites - 1);
    }
    
    // Save updated stats
    await context.env.STATS.put(`stats:${soundId}`, JSON.stringify(stats));
    
    // Update global stats
    const globalStats = await context.env.STATS.get('stats:_global', 'json') as GlobalStats | null;
    const global: GlobalStats = globalStats || { totalPlays: 0, totalDownloads: 0, totalFavorites: 0, lastUpdated: '' };
    
    if (event === 'play') {
      global.totalPlays++;
    } else if (event === 'download') {
      global.totalDownloads++;
    } else if (event === 'favorite') {
      global.totalFavorites++;
    } else if (event === 'unfavorite') {
      global.totalFavorites = Math.max(0, global.totalFavorites - 1);
    }
    global.lastUpdated = new Date().toISOString();
    
    await context.env.STATS.put('stats:_global', JSON.stringify(global));
    
    // Update top sounds cache (simple approach: store all sounds with stats > 0)
    // For low volume, this is fine. For high volume, would use a scheduled task.
    const topSounds = await context.env.STATS.get('stats:_top', 'json') as Record<string, SoundStats> | null || {};
    topSounds[soundId] = stats;
    await context.env.STATS.put('stats:_top', JSON.stringify(topSounds));
    
    return Response.json({ success: true, stats });
  } catch (e) {
    console.error('Stats error:', e);
    return Response.json({ error: 'Failed to record stat' }, { status: 500 });
  }
};
