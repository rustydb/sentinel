import type { EveWorldName } from '@frontier-sentinel/shared-types';

const DEFAULT_WORLD: EveWorldName = 'utopia';
const DEFAULT_UTOPIA_TURRET_PACKAGE_ID =
  '0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75';

function readTenant(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim().toLowerCase() : null;
}

export function normalizeWorldName(value: unknown): EveWorldName {
  return readTenant(value) === 'stillness' ? 'stillness' : DEFAULT_WORLD;
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

export function resolveTurretPackageId(world: EveWorldName): string {
  const sharedPackageId = import.meta.env.VITE_TURRET_PACKAGE_ID;
  const worldPackageId =
    world === 'stillness'
      ? import.meta.env.VITE_STILLNESS_TURRET_PACKAGE_ID
      : import.meta.env.VITE_UTOPIA_TURRET_PACKAGE_ID;

  return worldPackageId ?? sharedPackageId ?? DEFAULT_UTOPIA_TURRET_PACKAGE_ID;
}

export function buildWorldApiPath(world: EveWorldName, path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `/world-api/${world}${normalizedPath}`;
}
