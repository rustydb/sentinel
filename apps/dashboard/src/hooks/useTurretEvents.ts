import type { TurretEvent } from '@frontier-sentinel/shared-types';
import { useEffect, useRef, useState } from 'react';

interface UseTurretEventsOptions {
  apiBaseUrl?: string;
  turretId?: string;
  enabled?: boolean;
  refreshTick?: number;
}

export interface UseTurretEventsResult {
  events: TurretEvent[];
  loading: boolean;
  error: Error | null;
  page: number;
  nextPage: number | null;
  next: () => void;
  reset: () => void;
}

interface TurretEventsResponse {
  data?: TurretEvent[];
  pagination?: {
    nextPage?: number | null;
  };
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function normalizeTurretEvent(value: unknown): TurretEvent | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as {
    txDigest?: unknown;
    eventSeq?: unknown;
    checkpointSequenceNumber?: unknown;
    eventType?: unknown;
    jsonData?: unknown;
    timestamp?: unknown;
  };

  const eventSeq = readNumber(candidate.eventSeq);
  const checkpointSequenceNumber = readNumber(candidate.checkpointSequenceNumber);
  if (
    typeof candidate.txDigest !== 'string' ||
    eventSeq == null ||
    checkpointSequenceNumber == null ||
    typeof candidate.eventType !== 'string' ||
    typeof candidate.timestamp !== 'string' ||
    !candidate.jsonData ||
    typeof candidate.jsonData !== 'object'
  ) {
    return null;
  }

  return {
    txDigest: candidate.txDigest,
    eventSeq,
    checkpointSequenceNumber,
    eventType: candidate.eventType,
    jsonData: candidate.jsonData as Record<string, unknown>,
    timestamp: candidate.timestamp,
  };
}

function parseTurretEventsPayload(payload: unknown): TurretEventsResponse {
  if (!payload || typeof payload !== 'object') {
    return {};
  }

  const candidate = payload as {
    data?: unknown;
    pagination?: {
      nextPage?: unknown;
    };
  };
  return {
    data: Array.isArray(candidate.data)
      ? candidate.data
          .map((event) => normalizeTurretEvent(event))
          .filter((event): event is TurretEvent => event != null)
      : [],
    pagination:
      candidate.pagination && typeof candidate.pagination === 'object'
        ? {
            nextPage:
              typeof candidate.pagination.nextPage === 'number'
                ? candidate.pagination.nextPage
                : typeof candidate.pagination.nextPage === 'string' &&
                    candidate.pagination.nextPage.trim() &&
                    Number.isFinite(Number(candidate.pagination.nextPage))
                  ? Number(candidate.pagination.nextPage)
                  : null,
          }
        : undefined,
  };
}

export function useTurretEvents({
  apiBaseUrl = '',
  turretId,
  enabled = true,
  refreshTick = 0,
}: UseTurretEventsOptions): UseTurretEventsResult {
  const [events, setEvents] = useState<TurretEvent[]>([]);
  const [loading, setLoading] = useState(Boolean(enabled && turretId));
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(1);
  const [nextPage, setNextPage] = useState<number | null>(null);
  const pendingPageResetRef = useRef(false);
  const hasLoadedOnceRef = useRef(false);
  const queryKeyRef = useRef<string | null>(null);

  useEffect(() => {
    pendingPageResetRef.current = true;
    setEvents([]);
    setError(null);
    setNextPage(null);
    setPage(1);

    if (!enabled || !turretId) {
      setLoading(false);
      hasLoadedOnceRef.current = false;
      queryKeyRef.current = null;
    }
  }, [enabled, turretId]);

  useEffect(() => {
    if (!enabled || !turretId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    if (pendingPageResetRef.current && page !== 1) {
      return;
    }

    if (pendingPageResetRef.current && page === 1) {
      pendingPageResetRef.current = false;
    }

    let cancelled = false;
    const queryKey = `${enabled ? '1' : '0'}|${apiBaseUrl}|${turretId}`;
    if (queryKeyRef.current !== queryKey) {
      queryKeyRef.current = queryKey;
      hasLoadedOnceRef.current = false;
    }

    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }

    const loadEvents = async (): Promise<void> => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/events/${turretId}?page=${page}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error('Failed to load turret events');
        }

        const payload = parseTurretEventsPayload((await response.json()) as unknown);
        if (!cancelled) {
          setEvents(payload.data ?? []);
          setNextPage(payload.pagination?.nextPage ?? null);
          setError(null);
          hasLoadedOnceRef.current = true;
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
  }, [apiBaseUrl, enabled, page, refreshTick, turretId]);

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
