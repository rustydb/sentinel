import { useEffect, useState } from 'react';

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

const typeCache = new Map<string, TypeInfo | null>();
const inflight = new Map<string, Promise<TypeInfo | null>>();
const TYPE_INFO_TIMEOUT_MS = 5000;
const WORLD_API_BASE = import.meta.env.VITE_WORLD_API_URL ?? '/world-api';

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

async function fetchTypeInfo(typeId: string): Promise<TypeInfo | null> {
  if (!typeId) {
    return null;
  }

  if (typeCache.has(typeId)) {
    return typeCache.get(typeId) ?? null;
  }

  if (inflight.has(typeId)) {
    return inflight.get(typeId) ?? null;
  }

  const request = (async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), TYPE_INFO_TIMEOUT_MS);

    try {
      const response = await fetch(`${WORLD_API_BASE}/v2/types/${typeId}`, {
        signal: controller.signal,
      });

      if (!response.ok) {
        typeCache.set(typeId, null);
        return null;
      }

      const payload = (await response.json()) as RawTypeInfo;
      const normalized = normalizeTypeInfo(typeId, payload);
      typeCache.set(typeId, normalized);
      return normalized;
    } catch {
      typeCache.set(typeId, null);
      return null;
    } finally {
      window.clearTimeout(timeout);
      inflight.delete(typeId);
    }
  })();

  inflight.set(typeId, request);
  return request;
}

export function useTypeInfo(typeId: string | null | undefined): TypeInfo | null {
  const normalizedTypeId = typeof typeId === 'string' ? typeId.trim() : '';
  const [typeInfo, setTypeInfo] = useState<TypeInfo | null>(
    normalizedTypeId ? (typeCache.get(normalizedTypeId) ?? null) : null,
  );

  useEffect(() => {
    if (!normalizedTypeId) {
      setTypeInfo(null);
      return;
    }

    if (typeCache.has(normalizedTypeId)) {
      setTypeInfo(typeCache.get(normalizedTypeId) ?? null);
      return;
    }

    let cancelled = false;
    void fetchTypeInfo(normalizedTypeId).then((result) => {
      if (!cancelled) {
        setTypeInfo(result);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [normalizedTypeId]);

  return typeInfo;
}
