#!/usr/bin/env bun

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

type EveWorldName = 'utopia' | 'stillness';

interface SolarSystemApiRecord {
  id: number;
  name: string;
}

interface SolarSystemApiResponse {
  data: SolarSystemApiRecord[];
  metadata?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

const PAGE_SIZE = 1000;
const WORLD_ENDPOINTS: Record<EveWorldName, string> = {
  stillness: 'https://world-api-stillness.live.tech.evefrontier.com/v2/solarsystems',
  utopia: 'https://world-api-utopia.uat.pub.evefrontier.com/v2/solarsystems',
};

async function fetchWorldCatalog(
  world: EveWorldName,
): Promise<Array<{ id: number; name: string; world: EveWorldName }>> {
  const results: Array<{ id: number; name: string; world: EveWorldName }> = [];
  let offset = 0;
  let total = Number.POSITIVE_INFINITY;

  while (offset < total) {
    const url = new URL(WORLD_ENDPOINTS[world]);
    url.searchParams.set('limit', String(PAGE_SIZE));
    url.searchParams.set('offset', String(offset));

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${world} solar systems: ${response.status}`);
    }

    const payload = (await response.json()) as SolarSystemApiResponse;
    for (const entry of payload.data) {
      if (typeof entry.id === 'number' && typeof entry.name === 'string') {
        results.push({
          id: entry.id,
          name: entry.name,
          world,
        });
      }
    }

    total = payload.metadata?.total ?? payload.data.length;
    offset += payload.metadata?.limit ?? payload.data.length;

    if ((payload.data.length ?? 0) === 0) {
      break;
    }
  }

  return results.sort((left, right) => {
    if (left.world !== right.world) {
      return left.world.localeCompare(right.world);
    }

    return left.id - right.id;
  });
}

async function main(): Promise<void> {
  const generatedFile = resolve(
    import.meta.dir,
    '../apps/api/src/data/solarSystems.generated.json',
  );

  const catalog = [
    ...(await fetchWorldCatalog('stillness')),
    ...(await fetchWorldCatalog('utopia')),
  ];

  await mkdir(dirname(generatedFile), { recursive: true });
  await writeFile(generatedFile, JSON.stringify(catalog, null, 2), 'utf8');

  console.log(`Wrote ${catalog.length} solar systems to ${generatedFile}`);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
