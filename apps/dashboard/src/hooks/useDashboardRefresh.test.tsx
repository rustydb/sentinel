// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDashboardRefresh } from './useDashboardRefresh';

describe('useDashboardRefresh', () => {
  let visibilityState: DocumentVisibilityState;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-29T00:00:00.000Z'));
    visibilityState = 'visible';
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => visibilityState,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('polls while visible, slows while hidden, and refreshes when visibility returns', () => {
    const { result } = renderHook(() =>
      useDashboardRefresh({
        visibleIntervalMs: 1_000,
        hiddenIntervalMs: 5_000,
      }),
    );

    expect(result.current.refreshTick).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1_000);
    });
    expect(result.current.refreshTick).toBe(1);

    visibilityState = 'hidden';
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(result.current.refreshTick).toBe(1);

    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(result.current.refreshTick).toBe(2);

    act(() => {
      vi.advanceTimersByTime(100);
    });
    visibilityState = 'visible';
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(result.current.refreshTick).toBe(3);

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(result.current.refreshTick).toBe(3);
  });
});
