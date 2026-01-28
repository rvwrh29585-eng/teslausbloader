// Local storage and caching utilities

const CACHE_NAME = 'tesla-sounds-v1';
const PREFERENCES_KEY = 'tesla-preferences';
const FAVORITES_KEY = 'tesla-favorites';

// ============================================================================
// FAVORITES
// ============================================================================

export function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load favorites:', e);
  }
  return [];
}

export function saveFavorites(favorites: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function addFavorite(soundId: string): string[] {
  const favorites = getFavorites();
  if (!favorites.includes(soundId)) {
    favorites.push(soundId);
    saveFavorites(favorites);
  }
  return favorites;
}

export function removeFavorite(soundId: string): string[] {
  const favorites = getFavorites().filter(id => id !== soundId);
  saveFavorites(favorites);
  return favorites;
}

export function toggleFavorite(soundId: string): { favorites: string[]; isFavorite: boolean } {
  const favorites = getFavorites();
  const isFavorite = favorites.includes(soundId);
  
  if (isFavorite) {
    return { favorites: removeFavorite(soundId), isFavorite: false };
  } else {
    return { favorites: addFavorite(soundId), isFavorite: true };
  }
}

// ============================================================================
// PREFERENCES
// ============================================================================

export interface Preferences {
  cacheEnabled: boolean;
  lastCacheDate?: string;
}

// Get preferences from localStorage
export function getPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load preferences:', e);
  }
  return { cacheEnabled: false };
}

// Save preferences to localStorage
export function savePreferences(prefs: Preferences): void {
  localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
}

// Check if audio is cached
export async function isAudioCached(url: string): Promise<boolean> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    return !!response;
  } catch {
    return false;
  }
}

// Cache a single audio file
export async function cacheAudio(url: string): Promise<void> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(url);
    if (response.ok) {
      await cache.put(url, response);
    }
  } catch (e) {
    console.error('Failed to cache audio:', e);
  }
}

// Get cached audio or fetch
export async function getCachedAudio(url: string): Promise<Response | null> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);
    if (cached) {
      return cached;
    }
    // Fetch and cache
    const response = await fetch(url);
    if (response.ok) {
      await cache.put(url, response.clone());
    }
    return response;
  } catch {
    return null;
  }
}

// Get cache storage estimate
export async function getCacheSize(): Promise<{ used: number; total: number } | null> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        total: estimate.quota || 0,
      };
    }
  } catch {
    // Storage API not available
  }
  return null;
}

// Clear audio cache
export async function clearAudioCache(): Promise<void> {
  try {
    await caches.delete(CACHE_NAME);
  } catch (e) {
    console.error('Failed to clear cache:', e);
  }
}

// Cache all sounds
export async function cacheAllSounds(
  urls: string[],
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const cache = await caches.open(CACHE_NAME);
  
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await fetch(urls[i]);
      if (response.ok) {
        await cache.put(urls[i], response);
      }
    } catch (e) {
      console.error(`Failed to cache ${urls[i]}:`, e);
    }
    onProgress?.(i + 1, urls.length);
  }
}
