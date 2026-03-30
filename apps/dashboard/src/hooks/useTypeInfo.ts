import type { EveWorldName } from '@frontier-sentinel/shared-types';
import { useEffect, useState } from 'react';

import { buildWorldApiPath } from '../world';
import { useCurrentWorld } from '../worldContext';

interface RawTypeInfo {
  id?: number | string;
  name?: string;
  description?: string;
  iconUrl?: string | null;
  icon_url?: string | null;
  icon?: string | null;
  groupName?: string;
  categoryName?: string;
}

export interface TypeInfo {
  id: string;
  name: string;
  description?: string;
  iconUrl?: string | null;
  groupName?: string;
  categoryName?: string;
}

export interface UseTypeInfoResult {
  typeInfo: TypeInfo | null;
  isLoading: boolean;
  error: Error | null;
}

const typeCache = new Map<string, TypeInfo | null>();
const errorCache = new Map<string, Error | null>();
const inflight = new Map<string, Promise<{ typeInfo: TypeInfo | null; error: Error | null }>>();
const TYPE_INFO_TIMEOUT_MS = 10000;

function toCacheKey(world: EveWorldName, typeId: string): string {
  return `${world}:${typeId}`;
}

function normalizeTypeInfo(typeId: string, payload: RawTypeInfo): TypeInfo {
  return {
    id: String(payload.id ?? typeId),
    name: typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : typeId,
    description:
      typeof payload.description === 'string' && payload.description.trim()
        ? payload.description.trim()
        : undefined,
    iconUrl:
      typeof payload.iconUrl === 'string'
        ? payload.iconUrl
        : typeof payload.icon_url === 'string'
          ? payload.icon_url
          : typeof payload.icon === 'string'
            ? payload.icon
            : undefined,
    groupName:
      typeof payload.groupName === 'string' && payload.groupName.trim()
        ? payload.groupName.trim()
        : undefined,
    categoryName:
      typeof payload.categoryName === 'string' && payload.categoryName.trim()
        ? payload.categoryName.trim()
        : undefined,
  };
}

export async function fetchTypeInfo(
  typeId: string,
  world: EveWorldName,
): Promise<{ typeInfo: TypeInfo | null; error: Error | null }> {
  if (!typeId) {
    return { typeInfo: null, error: null };
  }

  const cacheKey = toCacheKey(world, typeId);

  if (typeCache.has(cacheKey)) {
    return {
      typeInfo: typeCache.get(cacheKey) ?? null,
      error: errorCache.get(cacheKey) ?? null,
    };
  }

  if (inflight.has(cacheKey)) {
    return inflight.get(cacheKey) ?? { typeInfo: null, error: null };
  }

  const request = (async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), TYPE_INFO_TIMEOUT_MS);

    try {
      const response = await fetch(buildWorldApiPath(world, `/v2/types/${typeId}`), {
        signal: controller.signal,
      });

      if (!response.ok) {
        typeCache.set(cacheKey, null);
        const error = new Error(`Failed to resolve class metadata for ${typeId}`);
        errorCache.set(cacheKey, error);
        return { typeInfo: null, error };
      }

      const payload = (await response.json()) as RawTypeInfo;
      const normalized = normalizeTypeInfo(typeId, payload);
      typeCache.set(cacheKey, normalized);
      errorCache.set(cacheKey, null);
      return { typeInfo: normalized, error: null };
    } catch {
      typeCache.set(cacheKey, null);
      const error = new Error(`Failed to resolve class metadata for ${typeId}`);
      errorCache.set(cacheKey, error);
      return { typeInfo: null, error };
    } finally {
      window.clearTimeout(timeout);
      inflight.delete(cacheKey);
    }
  })();

  inflight.set(cacheKey, request);
  return request;
}

export function useTypeInfo(
  typeId: string | null | undefined,
  worldOverride?: EveWorldName,
): UseTypeInfoResult {
  const currentWorld = useCurrentWorld();
  const world = worldOverride ?? currentWorld;
  const normalizedTypeId = typeof typeId === 'string' ? typeId.trim() : '';
  const cacheKey = normalizedTypeId ? toCacheKey(world, normalizedTypeId) : '';
  const hasCachedValue = normalizedTypeId ? typeCache.has(cacheKey) : false;
  const [typeInfo, setTypeInfo] = useState<TypeInfo | null>(
    normalizedTypeId ? (typeCache.get(cacheKey) ?? null) : null,
  );
  const [error, setError] = useState<Error | null>(
    normalizedTypeId ? (errorCache.get(cacheKey) ?? null) : null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(normalizedTypeId ? !hasCachedValue : false);

  useEffect(() => {
    if (!normalizedTypeId) {
      setTypeInfo(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (typeCache.has(cacheKey)) {
      setTypeInfo(typeCache.get(cacheKey) ?? null);
      setError(errorCache.get(cacheKey) ?? null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    void fetchTypeInfo(normalizedTypeId, world).then((result) => {
      if (!cancelled) {
        setTypeInfo(result.typeInfo);
        setError(result.error);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cacheKey, normalizedTypeId, world]);

  return { typeInfo, isLoading, error };
}
