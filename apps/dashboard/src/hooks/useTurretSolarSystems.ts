import {
  resolveSolarSystemName,
  type EveWorldName,
  type NetworkNodeMapping,
  type TurretData,
  type TurretSolarSystemMapping,
} from '@sentinel/shared-types';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface ResolvedTurretSolarSystem {
  turretId: string;
  solarSystemId: number | null;
  solarSystemName: string | null;
  resolutionSource: 'node' | 'retained' | 'none';
}

interface UseTurretSolarSystemsOptions {
  turrets: TurretData[];
  nodeMappings: NetworkNodeMapping[];
  apiBaseUrl?: string;
  world?: EveWorldName;
  enabled?: boolean;
  refreshTick?: number;
}

interface TurretSolarSystemsResponse {
  data?: TurretSolarSystemMapping[];
}

function isSuiAddress(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{64}$/.test(value);
}

function parseMappings(payload: unknown): TurretSolarSystemMapping[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const data = (payload as TurretSolarSystemsResponse).data;
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter((entry): entry is TurretSolarSystemMapping => {
    return (
      !!entry &&
      typeof entry === 'object' &&
      typeof entry.turretId === 'string' &&
      typeof entry.solarSystemId === 'number'
    );
  });
}

export function useTurretSolarSystems({
  turrets,
  nodeMappings,
  apiBaseUrl = '',
  world = 'utopia',
  enabled = true,
  refreshTick = 0,
}: UseTurretSolarSystemsOptions) {
  const [retainedMappings, setRetainedMappings] = useState<TurretSolarSystemMapping[]>([]);
  const [loading, setLoading] = useState(Boolean(enabled && turrets.length > 0));
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const queryKeyRef = useRef<string | null>(null);

  const turretIdsKey = turrets.map((turret) => turret.id).join(',');
  const relationsKey = turrets
    .map(
      (turret) =>
        `${turret.id}:${isSuiAddress(turret.energySourceId) ? turret.energySourceId : 'null'}`,
    )
    .join(',');

  useEffect(() => {
    if (!enabled || turrets.length === 0) {
      setRetainedMappings([]);
      setLoading(false);
      hasLoadedOnceRef.current = false;
      queryKeyRef.current = null;
      return;
    }

    const queryKey = `${enabled ? '1' : '0'}|${apiBaseUrl}|${turretIdsKey}|${relationsKey}`;
    if (queryKeyRef.current !== queryKey) {
      queryKeyRef.current = queryKey;
      hasLoadedOnceRef.current = false;
    }

    let cancelled = false;
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }

    const loadMappings = async (): Promise<void> => {
      try {
        const activeRelations = turrets
          .map((turret) => ({
            turretId: turret.id,
            nodeId: isSuiAddress(turret.energySourceId) ? turret.energySourceId : null,
          }))
          .filter((entry) => entry.nodeId !== null);

        if (activeRelations.length > 0) {
          await fetch(`${apiBaseUrl}/api/turret-solar-systems/sync`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ turrets: activeRelations }),
          });
        }

        const ids = turrets.map((turret) => turret.id).join(',');
        const response = await fetch(
          `${apiBaseUrl}/api/turret-solar-systems?ids=${encodeURIComponent(ids)}`,
          {
            cache: 'no-store',
          },
        );
        const payload: unknown = await response.json();

        if (!cancelled) {
          setRetainedMappings(parseMappings(payload));
          setError(null);
          hasLoadedOnceRef.current = true;
        }
      } catch (reason) {
        if (!cancelled) {
          setError(
            reason instanceof Error
              ? reason
              : new Error('Failed to resolve retained turret solar systems'),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadMappings();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, enabled, refreshTick, relationsKey, turretIdsKey]);

  const byTurretId = useMemo(() => {
    const currentByNodeId = new Map(nodeMappings.map((mapping) => [mapping.nodeId, mapping]));
    const retainedByTurretId = new Map(
      retainedMappings.map((mapping) => [mapping.turretId, mapping] as const),
    );

    return new Map<string, ResolvedTurretSolarSystem>(
      turrets.map((turret) => {
        const currentNodeId = isSuiAddress(turret.energySourceId) ? turret.energySourceId : null;
        const currentMapping = currentNodeId ? currentByNodeId.get(currentNodeId) : undefined;
        if (currentMapping) {
          const solarSystemName =
            currentMapping.solarSystemName ??
            resolveSolarSystemName(currentMapping.solarSystemId, world);
          return [
            turret.id,
            {
              turretId: turret.id,
              solarSystemId: currentMapping.solarSystemId,
              solarSystemName,
              resolutionSource: 'node',
            },
          ];
        }

        const retainedMapping = retainedByTurretId.get(turret.id);
        if (retainedMapping) {
          return [
            turret.id,
            {
              turretId: turret.id,
              solarSystemId: retainedMapping.solarSystemId,
              solarSystemName:
                retainedMapping.solarSystemName ??
                resolveSolarSystemName(retainedMapping.solarSystemId, world),
              resolutionSource: 'retained',
            },
          ];
        }

        return [
          turret.id,
          {
            turretId: turret.id,
            solarSystemId: null,
            solarSystemName: null,
            resolutionSource: 'none',
          },
        ];
      }),
    );
  }, [nodeMappings, retainedMappings, turrets, world]);

  return { byTurretId, loading, error };
}
