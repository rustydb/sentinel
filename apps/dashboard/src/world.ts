import type { EveWorldName } from '@sentinel/shared-types';

const DEFAULT_WORLD: EveWorldName = 'utopia';
const DEFAULT_UTOPIA_TURRET_PACKAGE_ID =
  '0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75';
const DEFAULT_STILLNESS_TURRET_PACKAGE_ID =
  '0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c';
const KNOWN_WORLDS: EveWorldName[] = ['utopia', 'stillness'];

function readTenant(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null;
}

export function normalizeWorldName(value: unknown): EveWorldName {
  return readTenant(value) === 'stillness' ? 'stillness' : DEFAULT_WORLD;
}

export function resolveWorldFromSearch(search: string): EveWorldName | null {
  const searchParams = new URLSearchParams(search);
  const tenant = searchParams.get('tenant');

  if (!tenant?.trim()) {
    return null;
  }

  return normalizeWorldName(tenant);
}

export function resolveWorldFromAccount(account: unknown): EveWorldName {
  if (!account || typeof account !== 'object') {
    return DEFAULT_WORLD;
  }

  const candidate = account as {
    key?: {
      tenant?: unknown;
    };
    tenant?: unknown;
  };

  return normalizeWorldName(candidate.key?.tenant ?? candidate.tenant);
}

export function resolveCurrentWorld(
  account: unknown,
  search = window.location.search,
): EveWorldName {
  return resolveWorldFromSearch(search) ?? resolveWorldFromAccount(account);
}

export function prioritizeWorlds(worldHint: EveWorldName): EveWorldName[] {
  return [worldHint, ...KNOWN_WORLDS.filter((world) => world !== worldHint)];
}

export function resolveTurretPackageId(world: EveWorldName): string {
  const sharedPackageId = import.meta.env.VITE_TURRET_PACKAGE_ID;
  const worldPackageId =
    world === 'stillness'
      ? import.meta.env.VITE_STILLNESS_TURRET_PACKAGE_ID
      : import.meta.env.VITE_UTOPIA_TURRET_PACKAGE_ID;

  return (
    worldPackageId ??
    sharedPackageId ??
    (world === 'stillness' ? DEFAULT_STILLNESS_TURRET_PACKAGE_ID : DEFAULT_UTOPIA_TURRET_PACKAGE_ID)
  );
}

export function resolveTurretPackageIdAsync(world: EveWorldName): Promise<string> {
  const defaultId = resolveTurretPackageId(world);

  // TODO: Integrate actual MVR client once @suins/mvr or equivalent SDK is available.
  // The RPC `suix_resolveNameServiceAddress` does not support '@' prefix namespaces.
  // For now, we fallback to the static configuration which contains the latest deployed IDs.

  return Promise.resolve(defaultId);
}

export function buildWorldApiPath(world: EveWorldName, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/world-api/${world}${normalizedPath}`;
}
