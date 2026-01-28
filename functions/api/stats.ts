// Stats tracking API using Cloudflare KV
// Optimized for free tier: single KV key stores all data
// KV key: "stats:_all" -> { sounds: Record<id, SoundStats>, global: GlobalStats }

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

interface AllStats {
  sounds: Record<string, SoundStats>;
  global: GlobalStats;
}

const DEFAULT_STATS: AllStats = {
  sounds: {},
  global: { totalPlays: 0, totalDownloads: 0, totalFavorites: 0, lastUpdated: '' }
};

// GET /api/stats - Get all stats (single read)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const allStats = await context.env.STATS.get('stats:_all', 'json') as AllStats | null;
    const data = allStats || DEFAULT_STATS;
    
    return Response.json({
      global: data.global,
      top: data.sounds
    });
  } catch (e) {
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
};

// POST /api/stats - Record event (single read + single write)
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { soundId: string; event: 'play' | 'download' | 'favorite' | 'unfavorite' };
    const { soundId, event } = body;
    
    if (!soundId || !event || !['play', 'download', 'favorite', 'unfavorite'].includes(event)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    // For plays, use sampling (only record ~20% to reduce writes)
    // Downloads and favorites are always recorded
    if (event === 'play' && Math.random() > 0.2) {
      return Response.json({ success: true, sampled: true });
    }
    
    // Single read
    const allStats = await context.env.STATS.get('stats:_all', 'json') as AllStats | null;
    const data: AllStats = allStats || { ...DEFAULT_STATS, sounds: {}, global: { ...DEFAULT_STATS.global } };
    
    // Get or create sound stats
    if (!data.sounds[soundId]) {
      data.sounds[soundId] = { plays: 0, downloads: 0, favorites: 0 };
    }
    const stats = data.sounds[soundId];
    
    // Update counters
    if (event === 'play') {
      // Multiply by 5 to compensate for 20% sampling
      stats.plays += 5;
      data.global.totalPlays += 5;
    } else if (event === 'download') {
      stats.downloads++;
      data.global.totalDownloads++;
    } else if (event === 'favorite') {
      stats.favorites++;
      data.global.totalFavorites++;
    } else if (event === 'unfavorite') {
      stats.favorites = Math.max(0, stats.favorites - 1);
      data.global.totalFavorites = Math.max(0, data.global.totalFavorites - 1);
    }
    
    data.global.lastUpdated = new Date().toISOString();
    
    // Single write
    await context.env.STATS.put('stats:_all', JSON.stringify(data));
    
    return Response.json({ success: true, stats });
  } catch (e) {
    console.error('Stats error:', e);
    return Response.json({ error: 'Failed to record stat' }, { status: 500 });
  }
};
