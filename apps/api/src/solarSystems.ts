import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type EveWorldName = 'utopia' | 'stillness';

export interface GeneratedSolarSystemRecord {
  id: number;
  name: string;
  world: EveWorldName;
}

export interface SolarSystemCatalogEntry extends GeneratedSolarSystemRecord {
  searchName: string;
}

export interface SolarSystemSearchResult {
  id: number;
  name: string;
  world: EveWorldName;
  matchText: string;
}

let catalogByWorld: Record<EveWorldName, SolarSystemCatalogEntry[]>;
let catalogLoaded = false;

function loadCatalog() {
  if (catalogLoaded) return;
  const dataPath = resolve(__dirname, './data/solarSystems.generated.json');
  let rawData = '[]';
  try {
    rawData = readFileSync(dataPath, 'utf8');
  } catch (e) {
    console.error('Failed to load solar systems catalog:', e);
  }
  const SOLAR_SYSTEM_CATALOG_DATA = JSON.parse(rawData) as GeneratedSolarSystemRecord[];

  const normalizedCatalog = SOLAR_SYSTEM_CATALOG_DATA.map((entry) => ({
    ...entry,
    searchName: entry.name.toLowerCase(),
  }));

  catalogByWorld = normalizedCatalog.reduce(
    (accumulator, entry) => {
      accumulator[entry.world].push(entry);
      return accumulator;
    },
    {
      utopia: [] as SolarSystemCatalogEntry[],
      stillness: [] as SolarSystemCatalogEntry[],
    },
  );
  catalogLoaded = true;
}

export function searchSolarSystems(
  query: string,
  world: EveWorldName,
  limit = 8,
): SolarSystemSearchResult[] {
  loadCatalog();
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const catalog = catalogByWorld[world] || [];
  return catalog
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
