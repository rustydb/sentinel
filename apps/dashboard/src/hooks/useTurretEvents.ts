import type { TurretEvent } from '@frontier-sentinel/shared-types';
import { useEffect, useState } from 'react';

interface UseTurretEventsOptions {
  apiBaseUrl?: string;
  turretId?: string;
  enabled?: boolean;
}

interface TurretEventsResponse {
  data?: TurretEvent[];
  pagination?: {
    nextPage?: number | null;
  };
}

function isTurretEvent(value: unknown): value is TurretEvent {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as { txDigest?: unknown }).txDigest === 'string' &&
    typeof (value as { eventSeq?: unknown }).eventSeq === 'number' &&
    typeof (value as { checkpointSequenceNumber?: unknown }).checkpointSequenceNumber ===
      'number' &&
    typeof (value as { eventType?: unknown }).eventType === 'string' &&
    typeof (value as { timestamp?: unknown }).timestamp === 'string' &&
    !!(value as { jsonData?: unknown }).jsonData &&
    typeof (value as { jsonData?: unknown }).jsonData === 'object'
  );
}

function parseTurretEventsPayload(payload: unknown): TurretEventsResponse {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const candidate = payload as TurretEventsResponse;
  return {
    data: Array.isArray(candidate.data) ? candidate.data.filter(isTurretEvent) : [],
    pagination:
      candidate.pagination && typeof candidate.pagination === 'object'
        ? {
            nextPage:
              typeof candidate.pagination.nextPage === 'number' ||
              candidate.pagination.nextPage === null
                ? candidate.pagination.nextPage
                : null,
          }
        : undefined,
  };
}

export function useTurretEvents({
  apiBaseUrl = '',
  turretId,
  enabled = true,
}: UseTurretEventsOptions) {
  const [events, setEvents] = useState<TurretEvent[]>([]);
  const [loading, setLoading] = useState(Boolean(enabled && turretId));
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || !turretId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const loadEvents = async (): Promise<void> => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/events/${turretId}?page=${page}`);
        if (!response.ok) {
          throw new Error('Failed to load turret events');
        }

        const payload = parseTurretEventsPayload((await response.json()) as unknown);
        if (!cancelled) {
          setEvents(payload.data ?? []);
          setNextPage(payload.pagination?.nextPage ?? null);
          setError(null);
        }
      } catch (reason: unknown) {
        if (!cancelled) {
          setError(reason instanceof Error ? reason : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadEvents();

    return () => {
      cancelled = true;
    };
  }, [apiBaseUrl, enabled, page, turretId]);

  return {
    events,
    loading,
    error,
    page,
    nextPage,
    next: () => {
      if (nextPage) {
        setPage(nextPage);
      }
    },
    reset: () => setPage(1),
  };
}
