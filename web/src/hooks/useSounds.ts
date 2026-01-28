import { useState, useEffect, useMemo } from 'react';
import { fetchSounds, parseCategory, formatDisplayName, getAudioUrl } from '../lib/api';
import type { Sound } from '../lib/api';

export interface ProcessedSound extends Sound {
  id: string;
}

export function useSounds() {
  const [sounds, setSounds] = useState<ProcessedSound[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSounds() {
      try {
        setLoading(true);
        const data = await fetchSounds();
        
        const processed: ProcessedSound[] = data.map((sound) => ({
          ...sound,
          id: sound.name,
          category: parseCategory(sound.name),
          displayName: formatDisplayName(sound.name),
          url: getAudioUrl(`${sound.name}.wav`),
        }));
        
        setSounds(processed);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load sounds');
      } finally {
        setLoading(false);
      }
    }

    loadSounds();
  }, []);

  const categories = useMemo(() => {
    const catMap = new Map<string, number>();
    sounds.forEach((sound) => {
      catMap.set(sound.category, (catMap.get(sound.category) || 0) + 1);
    });
    return Array.from(catMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [sounds]);

  return { sounds, categories, loading, error };
}

export function useFilteredSounds(
  sounds: ProcessedSound[],
  searchQuery: string,
  selectedCategory: string | null
) {
  return useMemo(() => {
    let filtered = sounds;

    if (selectedCategory) {
      filtered = filtered.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.displayName.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [sounds, searchQuery, selectedCategory]);
}
