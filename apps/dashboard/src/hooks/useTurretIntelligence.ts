import type {
  ShellStatisticsSnapshot,
  TurretData,
  TurretIntelligenceResponse,
  TurretIntelligenceSummary,
} from '@sentinel/shared-types';
import { isTurretIntelligenceSummary } from '@sentinel/shared-types';
import { useEffect, useMemo, useRef, useState } from 'react';

const EMPTY_STATS: ShellStatisticsSnapshot = {
  totalTurrets: 0,
  engagedTurrets: 0,
  onlineTurrets: 0,
  offlineTurrets: 0,
  aggressorsPast24Hours: 0,
};

function parseTurretIntelligenceResponse(payload: unknown): TurretIntelligenceSummary[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const data = (payload as Partial<TurretIntelligenceResponse>).data;
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter(isTurretIntelligenceSummary);
}

function deriveShellStatistics(
  turrets: TurretData[],
  summariesByTurretId: Map<string, TurretIntelligenceSummary>,
): ShellStatisticsSnapshot {
  return turrets.reduce<ShellStatisticsSnapshot>(
    (stats, turret) => {
      const summary = summariesByTurretId.get(turret.id);
      const displayStatus = summary?.statusOverride === 'ENGAGED' ? 'engaged' : turret.status;

      return {
        totalTurrets: stats.totalTurrets + 1,
        engagedTurrets: stats.engagedTurrets + (displayStatus === 'engaged' ? 1 : 0),
        onlineTurrets: stats.onlineTurrets + (displayStatus === 'online' ? 1 : 0),
        offlineTurrets: stats.offlineTurrets + (displayStatus === 'offline' ? 1 : 0),
        aggressorsPast24Hours: stats.aggressorsPast24Hours + (summary?.aggressorsPast24Hours ?? 0),
      };
    },
    { ...EMPTY_STATS },
  );
}

interface UseTurretIntelligenceOptions {
  turrets: TurretData[];
  apiBaseUrl?: string;
  enabled?: boolean;
  refreshTick?: number;
}

export interface UseTurretIntelligenceResult {
  summaries: TurretIntelligenceSummary[];
  byTurretId: Map<string, TurretIntelligenceSummary>;
  stats: ShellStatisticsSnapshot;
  loading: boolean;
  error: Error | null;
}

export function useTurretIntelligence({
  turrets,
  apiBaseUrl = '',
  enabled = true,
  refreshTick = 0,
}: UseTurretIntelligenceOptions): UseTurretIntelligenceResult {
  const [summaries, setSummaries] = useState<TurretIntelligenceSummary[]>([]);
  const [loading, setLoading] = useState(Boolean(enabled && turrets.length > 0));
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const queryKeyRef = useRef<string | null>(null);

  const turretIdsKey = useMemo(() => turrets.map((turret) => turret.id).join(','), [turrets]);

  useEffect(() => {
    if (!enabled || turrets.length === 0) {
      setSummaries([]);
      setLoading(false);
      setError(null);
      hasLoadedOnceRef.current = false;
      queryKeyRef.current = null;
      return;
    }

    const queryKey = `${enabled ? '1' : '0'}|${apiBaseUrl}|${turretIdsKey}|${turrets.length}`;
    if (queryKeyRef.current !== queryKey) {
      queryKeyRef.current = queryKey;
      hasLoadedOnceRef.current = false;
    }

    let cancelled = false;
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }

    const loadSummaries = async (): Promise<void> => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/turret-intelligence?ids=${encodeURIComponent(turretIdsKey)}`,
          {
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to load turret intelligence');
        }

        const payload = parseTurretIntelligenceResponse((await response.json()) as unknown);
        if (!cancelled) {
          setSummaries(payload);
          setError(null);
          hasLoadedOnceRef.current = true;
        }
      } catch (reason: unknown) {
        if (!cancelled) {
          setError(
            reason instanceof Error ? reason : new Error('Failed to load turret intelligence'),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadSummaries();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, enabled, refreshTick, turretIdsKey, turrets.length]);

  const byTurretId = useMemo(
    () => new Map(summaries.map((summary) => [summary.turretId, summary] as const)),
    [summaries],
  );

  const stats = useMemo(() => deriveShellStatistics(turrets, byTurretId), [byTurretId, turrets]);

  return {
    summaries,
    byTurretId,
    stats,
    loading,
    error,
  };
}
