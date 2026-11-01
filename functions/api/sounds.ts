// Cloudflare Pages Function: GET /api/sounds
// Builds the catalog from build-time manifests (sounds/ + soundscustom/),
// and merges any extras discovered by scraping notateslaapp.com.

interface Sound {
  name: string;
  category: string;
  url: string;
}

function addSound(sounds: Sound[], seen: Set<string>, name: string) {
  if (!name || seen.has(name)) return;
  seen.add(name);
  sounds.push({
    name,
    category: name.split('_')[0] || 'other',
    url: `/api/audio/${encodeURIComponent(name)}.wav`,
  });
}

async function loadNameList(url: string): Promise<string[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data.filter((n): n is string => typeof n === 'string' && !!n) : [];
  } catch {
    return [];
  }
}

function extractScrapedNames(html: string): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  const patterns = [
    /data-file="(\/assets\/customizations\/lock-sounds\/wav\/[^"]+\.wav)"/gi,
    /href="(\/assets\/customizations\/lock-sounds\/wav\/[^"]+\.wav)"/gi,
    /href="(\/assets\/audio\/[^"]+\.wav)"/gi,
  ];

  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(html)) !== null) {
      const filename = decodeURIComponent(match[1].split('/').pop() || '').replace(/\.wav$/i, '');
      if (!filename || seen.has(filename)) continue;
      seen.add(filename);
      names.push(filename);
    }
  }

  return names;
}

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const origin = new URL(context.request.url).origin;
    const sounds: Sound[] = [];
    const seen = new Set<string>();

    // Primary: repo manifests (survive source-site HTML redesigns)
    for (const name of await loadNameList(`${origin}/sounds-manifest.json`)) {
      addSound(sounds, seen, name);
    }
    for (const name of await loadNameList(`${origin}/custom-sounds.json`)) {
      addSound(sounds, seen, name);
    }

    // Optional enrichment: scrape live page for brand-new sounds before next sync
    try {
      const response = await fetch('https://www.notateslaapp.com/tesla-custom-lock-sounds/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TeslaLockSoundLoader/1.0)',
        },
      });
      if (response.ok) {
        const html = await response.text();
        for (const name of extractScrapedNames(html)) {
          addSound(sounds, seen, name);
        }
      }
    } catch {
      // Manifests alone are enough
    }

    sounds.sort((a, b) => a.name.localeCompare(b.name));

    return new Response(JSON.stringify({ sounds }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, max-age=0',
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
