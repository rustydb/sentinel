import { type EveWorldName, type SolarSystemSearchResult } from '@sentinel/shared-types';
import { useDeferredValue, useEffect, useState } from 'react';

import { useCurrentWorld } from '../worldContext';

interface UseSolarSystemCatalogOptions {
  query: string;
  world?: EveWorldName;
  limit?: number;
}

export function useSolarSystemCatalog({ query, world, limit = 8 }: UseSolarSystemCatalogOptions): {
  results: SolarSystemSearchResult[];
  loading: boolean;
} {
  const currentWorld = useCurrentWorld();
  const resolvedWorld = world ?? currentWorld;
  const deferredQuery = useDeferredValue(query);
  const [results, setResults] = useState<SolarSystemSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = deferredQuery.trim();
    if (!q) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const url = `/api/solar-systems/search?q=${encodeURIComponent(q)}&world=${encodeURIComponent(resolvedWorld)}&limit=${limit}`;

    fetch(url)
      .then((res) => res.json() as Promise<{ data?: SolarSystemSearchResult[] }>)
      .then((payload) => {
        if (!cancelled) {
          setResults(payload.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Failed to fetch solar systems', err);
          setResults([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [deferredQuery, resolvedWorld, limit]);

  return { results, loading };
}
