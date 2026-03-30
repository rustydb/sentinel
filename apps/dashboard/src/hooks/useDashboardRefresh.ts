import { useEffect, useRef, useState } from 'react';

interface UseDashboardRefreshOptions {
  enabled?: boolean;
  visibleIntervalMs?: number;
  hiddenIntervalMs?: number;
}

export interface UseDashboardRefreshResult {
  refreshTick: number;
}

const DEFAULT_VISIBLE_INTERVAL_MS = 15_000;
const DEFAULT_HIDDEN_INTERVAL_MS = 60_000;
const REFRESH_DEDUPLICATION_WINDOW_MS = 50;

function isDocumentVisible(): boolean {
  if (typeof document === 'undefined') {
    return true;
  }

  return document.visibilityState !== 'hidden';
}

export function useDashboardRefresh({
  enabled = true,
  visibleIntervalMs = DEFAULT_VISIBLE_INTERVAL_MS,
  hiddenIntervalMs = DEFAULT_HIDDEN_INTERVAL_MS,
}: UseDashboardRefreshOptions = {}): UseDashboardRefreshResult {
  const [refreshTick, setRefreshTick] = useState(0);
  const [isVisible, setIsVisible] = useState(isDocumentVisible);
  const lastRefreshAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleVisibilityChange = () => {
      const nextVisible = isDocumentVisible();
      setIsVisible(nextVisible);

      if (nextVisible) {
        const now = Date.now();
        if (
          lastRefreshAtRef.current == null ||
          now - lastRefreshAtRef.current >= REFRESH_DEDUPLICATION_WINDOW_MS
        ) {
          lastRefreshAtRef.current = now;
          setRefreshTick((current) => current + 1);
        }
      }
    };

    const handleWindowFocus = () => {
      if (!isDocumentVisible()) {
        return;
      }

      const now = Date.now();
      if (
        lastRefreshAtRef.current == null ||
        now - lastRefreshAtRef.current >= REFRESH_DEDUPLICATION_WINDOW_MS
      ) {
        lastRefreshAtRef.current = now;
        setRefreshTick((current) => current + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const intervalMs = isVisible ? visibleIntervalMs : hiddenIntervalMs;
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      if (
        lastRefreshAtRef.current == null ||
        now - lastRefreshAtRef.current >= REFRESH_DEDUPLICATION_WINDOW_MS
      ) {
        lastRefreshAtRef.current = now;
        setRefreshTick((current) => current + 1);
      }
    }, intervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled, hiddenIntervalMs, isVisible, visibleIntervalMs]);

  return { refreshTick };
}
