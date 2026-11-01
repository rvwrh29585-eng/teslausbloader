// Cloudflare Pages Function: GET /api/sounds
// Builds the catalog from build-time manifests (sounds/ + soundscustom/),
// and merges any extras discovered by scraping notateslaapp.com.

interface Sound {
  name: string;
  category: string;
  url: string;
  addedAt?: string;
}

interface ManifestEntry {
  name: string;
  addedAt?: string;
}

function addSound(
  sounds: Sound[],
  seen: Set<string>,
  name: string,
  addedAt?: string
) {
  if (!name) return;
  if (seen.has(name)) {
    // Fill in date if a later source has it and current entry doesn't
    if (addedAt) {
      const existing = sounds.find((s) => s.name === name);
      if (existing && !existing.addedAt) existing.addedAt = addedAt;
    }
    return;
  }
  seen.add(name);
  sounds.push({
    name,
    category: name.split('_')[0] || 'other',
    url: `/api/audio/${encodeURIComponent(name)}.wav`,
    ...(addedAt ? { addedAt } : {}),
  });
}

async function loadManifestEntries(url: string): Promise<ManifestEntry[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    // New shape: { sounds: [{ name, addedAt }] }
    if (data && Array.isArray(data.sounds)) {
      return data.sounds
        .map((entry: unknown) => {
          if (typeof entry === 'string') return { name: entry };
          if (entry && typeof entry === 'object' && 'name' in entry) {
            const e = entry as { name: unknown; addedAt?: unknown };
            if (typeof e.name !== 'string' || !e.name) return null;
            return {
              name: e.name,
              addedAt: typeof e.addedAt === 'string' ? e.addedAt : undefined,
            };
          }
          return null;
        })
        .filter((e: ManifestEntry | null): e is ManifestEntry => e !== null);
    }

    // Legacy shape: ["name", ...]
    if (Array.isArray(data)) {
      return data
        .filter((n): n is string => typeof n === 'string' && !!n)
        .map((name) => ({ name }));
    }

    return [];
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

    for (const entry of await loadManifestEntries(`${origin}/sounds-manifest.json`)) {
      addSound(sounds, seen, entry.name, entry.addedAt);
    }
    for (const entry of await loadManifestEntries(`${origin}/custom-sounds.json`)) {
      addSound(sounds, seen, entry.name, entry.addedAt);
    }

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

    // Default API order: newest first, then name
    sounds.sort((a, b) => {
      const aDate = a.addedAt || '';
      const bDate = b.addedAt || '';
      if (aDate !== bDate) return bDate.localeCompare(aDate);
      return a.name.localeCompare(b.name);
    });

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
