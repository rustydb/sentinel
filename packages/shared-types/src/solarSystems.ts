import {
  SOLAR_SYSTEM_CATALOG_DATA,
  type GeneratedSolarSystemRecord,
} from './solarSystems.generated';

export type EveWorldName = 'utopia' | 'stillness';

export interface SolarSystemCatalogEntry extends GeneratedSolarSystemRecord {
  searchName: string;
}

export interface SolarSystemSearchResult {
  id: number;
  name: string;
  world: EveWorldName;
  matchText: string;
}

const normalizedCatalog = SOLAR_SYSTEM_CATALOG_DATA.map((entry) => ({
  ...entry,
  searchName: entry.name.toLowerCase(),
}));

const catalogByWorld = normalizedCatalog.reduce(
  (accumulator, entry) => {
    accumulator[entry.world].push(entry);
    return accumulator;
  },
  {
    utopia: [] as SolarSystemCatalogEntry[],
    stillness: [] as SolarSystemCatalogEntry[],
  },
);

const catalogByKey = new Map<string, SolarSystemCatalogEntry>();

for (const entry of normalizedCatalog) {
  catalogByKey.set(`${entry.world}:${entry.id}`, entry);
}

export const SOLAR_SYSTEM_CATALOG: SolarSystemCatalogEntry[] = normalizedCatalog;

export function getSolarSystemCatalog(world: EveWorldName): SolarSystemCatalogEntry[] {
  return catalogByWorld[world];
}

export function searchSolarSystems(
  query: string,
  world: EveWorldName,
  limit = 8,
): SolarSystemSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return catalogByWorld[world]
    .filter((entry) => entry.searchName.includes(normalizedQuery))
    .sort((left, right) => {
      const leftStartsWith = left.searchName.startsWith(normalizedQuery);
      const rightStartsWith = right.searchName.startsWith(normalizedQuery);
      if (leftStartsWith !== rightStartsWith) {
        return leftStartsWith ? -1 : 1;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, limit)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      world: entry.world,
      matchText: entry.name,
    }));
}

export function resolveSolarSystemName(
  solarSystemId: number | null | undefined,
  world: EveWorldName,
): string | null {
  if (typeof solarSystemId !== 'number' || !Number.isInteger(solarSystemId) || solarSystemId < 1) {
    return null;
  }

  return catalogByKey.get(`${world}:${solarSystemId}`)?.name ?? null;
}
