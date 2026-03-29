import {
  searchSolarSystems,
  type EveWorldName,
  type SolarSystemSearchResult,
} from '@frontier-sentinel/shared-types';
import { useDeferredValue, useMemo } from 'react';

interface UseSolarSystemCatalogOptions {
  query: string;
  world?: EveWorldName;
  limit?: number;
}

export function useSolarSystemCatalog({
  query,
  world = (import.meta.env.VITE_EVE_SERVER_NAME ?? 'utopia') as EveWorldName,
  limit = 8,
}: UseSolarSystemCatalogOptions): { results: SolarSystemSearchResult[] } {
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () => searchSolarSystems(deferredQuery, world, limit),
    [deferredQuery, limit, world],
  );

  return { results };
}
