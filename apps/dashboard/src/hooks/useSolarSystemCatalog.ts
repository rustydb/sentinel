import {
  searchSolarSystems,
  type EveWorldName,
  type SolarSystemSearchResult,
} from '@sentinel/shared-types';
import { useDeferredValue, useMemo } from 'react';

import { useCurrentWorld } from '../worldContext';

interface UseSolarSystemCatalogOptions {
  query: string;
  world?: EveWorldName;
  limit?: number;
}

export function useSolarSystemCatalog({ query, world, limit = 8 }: UseSolarSystemCatalogOptions): {
  results: SolarSystemSearchResult[];
} {
  const currentWorld = useCurrentWorld();
  const resolvedWorld = world ?? currentWorld;
  const deferredQuery = useDeferredValue(query);

  const results = useMemo(
    () => searchSolarSystems(deferredQuery, resolvedWorld, limit),
    [deferredQuery, limit, resolvedWorld],
  );

  return { results };
}
