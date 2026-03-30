import type { EveWorldName } from '@frontier-sentinel/shared-types';
import { useEffect, useMemo, useState } from 'react';

import { fetchTypeInfo, type TypeInfo } from './useTypeInfo';

export interface TurretTypeCatalogEntry {
  typeId: string;
  typeInfo: TypeInfo | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseTurretTypeCatalogOptions {
  typeIds: string[];
  world: EveWorldName;
  enabled?: boolean;
}

function uniqueTypeIds(typeIds: string[]): string[] {
  return [...new Set(typeIds.map((typeId) => typeId.trim()).filter(Boolean))];
}

export function useTurretTypeCatalog({
  typeIds,
  world,
  enabled = true,
}: UseTurretTypeCatalogOptions) {
  const normalizedTypeIds = useMemo(() => uniqueTypeIds(typeIds), [typeIds.join(',')]);
  const [entries, setEntries] = useState<TurretTypeCatalogEntry[]>([]);

  useEffect(() => {
    if (!enabled || normalizedTypeIds.length === 0) {
      setEntries([]);
      return;
    }

    let cancelled = false;

    const load = async (): Promise<void> => {
      const currentEntries = new Map(entries.map((entry) => [entry.typeId, entry] as const));

      const nextEntries: TurretTypeCatalogEntry[] = await Promise.all(
        normalizedTypeIds.map(async (typeId) => {
          const existing = currentEntries.get(typeId);
          if (existing && !existing.isLoading && (existing.typeInfo || existing.error)) {
            return existing;
          }

          const result = await fetchTypeInfo(typeId, world);
          return {
            typeId,
            typeInfo: result.typeInfo,
            isLoading: false,
            error: result.error,
          };
        }),
      );

      if (!cancelled) {
        setEntries(
          nextEntries.map((entry) => ({
            ...entry,
            isLoading: false,
          })),
        );
      }
    };

    setEntries(
      normalizedTypeIds.map((typeId) => ({
        typeId,
        typeInfo: entries.find((entry) => entry.typeId === typeId)?.typeInfo ?? null,
        isLoading: true,
        error: null,
      })),
    );

    void load();

    return () => {
      cancelled = true;
    };
  }, [enabled, normalizedTypeIds.join(','), world]);

  const byTypeId = useMemo(
    () =>
      new Map(
        entries.map((entry) => [
          entry.typeId,
          {
            typeInfo: entry.typeInfo,
            isLoading: entry.isLoading,
            error: entry.error,
          },
        ]),
      ),
    [entries],
  );

  const resolvedEntries = useMemo(
    () =>
      normalizedTypeIds.map((typeId) => {
        const entry = byTypeId.get(typeId);
        return {
          typeId,
          typeInfo: entry?.typeInfo ?? null,
          isLoading: entry?.isLoading ?? true,
          error: entry?.error ?? null,
        };
      }),
    [byTypeId, normalizedTypeIds.join(',')],
  );

  return { entries: resolvedEntries, byTypeId };
}
