// Cloudflare Pages Function: GET /api/sounds
// Scrapes notateslaapp.com for lock sounds, merges with custom list from /custom-sounds.json

interface Sound {
  name: string;
  category: string;
  url: string;
}

export const onRequestGet: PagesFunction = async (context) => {
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
    
    // Merge custom sounds from same-origin static list (built from soundscustom/*.wav)
    const customListUrl = new URL('/custom-sounds.json', context.request.url).href;
    try {
      const customRes = await fetch(customListUrl);
      if (customRes.ok) {
        const customNames: string[] = await customRes.json();
        for (const name of customNames) {
          if (typeof name === 'string' && name && !seen.has(name)) {
            seen.add(name);
            sounds.push({
              name,
              category: name.split('_')[0] || 'other',
              url: `/api/audio/${encodeURIComponent(name)}.wav`,
            });
          }
        }
      }
    } catch {
      // No custom list or invalid JSON; continue with scraped list only
    }
    
    // Sort by name
    sounds.sort((a, b) => a.name.localeCompare(b.name));
    
    return new Response(JSON.stringify({ sounds }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, max-age=0', // Always revalidate so custom sounds show up after deploy
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
