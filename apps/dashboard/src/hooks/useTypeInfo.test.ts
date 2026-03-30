// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTypeInfo } from './useTypeInfo';
import { WorldProvider } from '../worldContext';

function createWorldWrapper(world: 'utopia' | 'stillness') {
  return function WorldWrapper({ children }: PropsWithChildren) {
    return createElement(WorldProvider, { world }, children);
  };
}

describe('useTypeInfo', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('resolves a class label for a turret type', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: '92404',
          name: 'Heavy Turret',
          iconUrl: 'https://assets.example.com/heavy-turret.png',
        }),
        { status: 200 },
      ),
    );

    const { result } = renderHook(() => useTypeInfo('92404'), {
      wrapper: createWorldWrapper('utopia'),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('/world-api/utopia/v2/types/92404', expect.anything());
    expect(result.current.typeInfo?.name).toBe('Heavy Turret');
    expect(result.current.error).toBeNull();
  });

  it('surfaces an explicit error when type metadata cannot be resolved', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('', { status: 500 }));

    const { result } = renderHook(() => useTypeInfo('92405'), {
      wrapper: createWorldWrapper('utopia'),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.typeInfo).toBeNull();
    expect(result.current.error?.message).toContain('92405');
  });

  it('times out unresolved type metadata after ten seconds', async () => {
    vi.useFakeTimers();

    vi.spyOn(globalThis, 'fetch').mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new Error('Aborted'));
          });
        }),
    );

    const { result } = renderHook(() => useTypeInfo('92406'), {
      wrapper: createWorldWrapper('utopia'),
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000);
    });

    await Promise.resolve();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error?.message).toContain('92406');

    vi.useRealTimers();
  });

  it('targets the stillness world api when the world context changes', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: '92407',
          name: 'Stillness Turret',
        }),
        { status: 200 },
      ),
    );

    const { result } = renderHook(() => useTypeInfo('92407'), {
      wrapper: createWorldWrapper('stillness'),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/world-api/stillness/v2/types/92407',
      expect.anything(),
    );
    expect(result.current.typeInfo?.name).toBe('Stillness Turret');
  });
});
