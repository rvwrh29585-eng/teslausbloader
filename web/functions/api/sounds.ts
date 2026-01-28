// Cloudflare Pages Function: GET /api/sounds
// Scrapes notateslaapp.com for lock sounds and returns JSON

interface Sound {
  name: string;
  category: string;
  url: string;
}

export const onRequestGet: PagesFunction = async (context) => {
  const cacheKey = 'sounds-list';
  
  // Check KV cache first (if available)
  // For now, we'll rely on Cloudflare's edge cache
  
  try {
    const response = await fetch('https://www.notateslaapp.com/tesla-custom-lock-sounds/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TeslaLockSoundLoader/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse HTML to extract sound URLs
    // Looking for: <a href="/assets/audio/category/name.wav" class="fancy download">
    const soundRegex = /href="(\/assets\/audio\/[^"]+\.wav)"/g;
    const sounds: Sound[] = [];
    const seen = new Set<string>();
    
    let match;
    while ((match = soundRegex.exec(html)) !== null) {
      const path = match[1];
      const filename = path.split('/').pop()?.replace('.wav', '') || '';
      
      if (filename && !seen.has(filename)) {
        seen.add(filename);
        const category = filename.split('_')[0] || 'other';
        
        sounds.push({
          name: filename,
          category,
          url: `/api/audio/${encodeURIComponent(filename)}.wav`,
        });
      }
    }
    
    // Sort by name
    sounds.sort((a, b) => a.name.localeCompare(b.name));
    
    return new Response(JSON.stringify({ sounds }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error fetching sounds:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch sounds', message: String(error) }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
};
