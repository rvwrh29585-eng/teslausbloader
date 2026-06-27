import { useState, useEffect, useMemo } from 'react';
import { getWrapModelLabel } from '../lib/wrapModels';

export interface Wrap {
  id: string;
  modelId: string;
  filename: string;
  displayName: string;
  url: string;
}

export interface WrapModel {
  id: string;
  label: string;
  count: number;
}

interface WrapsManifest {
  wraps: Wrap[];
}

export function useWraps() {
  const [wraps, setWraps] = useState<Wrap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadWraps() {
      try {
        setLoading(true);
        const response = await fetch('/wraps-manifest.json', { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to fetch wraps');
        }
        const data: WrapsManifest = await response.json();
        setWraps(data.wraps ?? []);
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load wraps');
      } finally {
        setLoading(false);
      }
    }

    loadWraps();
  }, []);

  const models = useMemo((): WrapModel[] => {
    const countMap = new Map<string, number>();
    wraps.forEach((wrap) => {
      countMap.set(wrap.modelId, (countMap.get(wrap.modelId) || 0) + 1);
    });
    return Array.from(countMap.entries())
      .map(([id, count]) => ({
        id,
        label: getWrapModelLabel(id),
        count,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [wraps]);

  return { wraps, models, loading, error };
}

export function useFilteredWraps(wraps: Wrap[], modelId: string | null, searchQuery: string): Wrap[] {
  return useMemo(() => {
    let filtered = wraps;

    if (modelId) {
      filtered = filtered.filter((w) => w.modelId === modelId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.displayName.toLowerCase().includes(q) ||
          w.filename.toLowerCase().includes(q) ||
          getWrapModelLabel(w.modelId).toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [wraps, modelId, searchQuery]);
}
