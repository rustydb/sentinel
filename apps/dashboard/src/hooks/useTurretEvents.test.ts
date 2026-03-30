// @vitest-environment jsdom

import { renderHook, waitFor, act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTurretEvents } from './useTurretEvents';

describe('useTurretEvents', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('normalizes live Postgres event rows that serialize numeric fields as strings', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: [
            {
              txDigest: '0xpage1',
              eventSeq: '3',
              checkpointSequenceNumber: '311553454',
              eventType: 'TurretCreatedEvent',
              jsonData: { turretId: '0xturret', itemId: '1001' },
              timestamp: '2026-03-29T00:00:00.000Z',
            },
          ],
          pagination: { nextPage: '2' },
        }),
        { status: 200 },
      ),
    );

    const { result } = renderHook(() =>
      useTurretEvents({
        apiBaseUrl: '',
        turretId: '0xturret',
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0]).toMatchObject({
      txDigest: '0xpage1',
      eventSeq: 3,
      checkpointSequenceNumber: 311553454,
      eventType: 'TurretCreatedEvent',
    });
    expect(result.current.nextPage).toBe(2);
  });

  it('re-fetches the current page when the dashboard refresh tick changes without losing pagination state', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                txDigest: '0xpage1',
                eventSeq: 1,
                checkpointSequenceNumber: 5,
                eventType: 'TurretCreatedEvent',
                jsonData: { turretId: '0xturret', itemId: '1001' },
                timestamp: '2026-03-29T00:00:00.000Z',
              },
            ],
            pagination: { nextPage: 2 },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                txDigest: '0xpage2',
                eventSeq: 2,
                checkpointSequenceNumber: 6,
                eventType: 'PriorityListUpdatedEvent',
                jsonData: { turretId: '0xturret', priority_list: [] },
                timestamp: '2026-03-29T00:05:00.000Z',
              },
            ],
            pagination: { nextPage: null },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                txDigest: '0xpage2-refresh',
                eventSeq: 3,
                checkpointSequenceNumber: 7,
                eventType: 'PriorityListUpdatedEvent',
                jsonData: { turretId: '0xturret', priority_list: [] },
                timestamp: '2026-03-29T00:10:00.000Z',
              },
            ],
            pagination: { nextPage: null },
          }),
          { status: 200 },
        ),
      );

    const { result, rerender } = renderHook(
      ({ refreshTick }: { refreshTick: number }) =>
        useTurretEvents({
          apiBaseUrl: '',
          turretId: '0xturret',
          refreshTick,
        }),
      {
        initialProps: { refreshTick: 0 },
      },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/events/0xturret?page=1',
      expect.objectContaining({ cache: 'no-store' }),
    );

    act(() => {
      result.current.next();
    });

    await waitFor(() => {
      expect(result.current.page).toBe(2);
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/api/events/0xturret?page=2',
      expect.objectContaining({ cache: 'no-store' }),
    );

    rerender({ refreshTick: 1 });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      '/api/events/0xturret?page=2',
      expect.objectContaining({ cache: 'no-store' }),
    );
    expect(result.current.page).toBe(2);
  });

  it('resets pagination when the selected turret changes', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                txDigest: '0xpage1',
                eventSeq: 1,
                checkpointSequenceNumber: 5,
                eventType: 'TurretCreatedEvent',
                jsonData: { turretId: '0xturret-a', itemId: '1001' },
                timestamp: '2026-03-29T00:00:00.000Z',
              },
            ],
            pagination: { nextPage: 2 },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                txDigest: '0xpage2',
                eventSeq: 2,
                checkpointSequenceNumber: 6,
                eventType: 'PriorityListUpdatedEvent',
                jsonData: { turretId: '0xturret-a', priority_list: [] },
                timestamp: '2026-03-29T00:05:00.000Z',
              },
            ],
            pagination: { nextPage: null },
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                txDigest: '0xpage1-b',
                eventSeq: 1,
                checkpointSequenceNumber: 7,
                eventType: 'TurretCreatedEvent',
                jsonData: { turretId: '0xturret-b', itemId: '2001' },
                timestamp: '2026-03-29T00:10:00.000Z',
              },
            ],
            pagination: { nextPage: null },
          }),
          { status: 200 },
        ),
      );

    const { result, rerender } = renderHook(
      ({ turretId, refreshTick }: { turretId: string; refreshTick: number }) =>
        useTurretEvents({
          apiBaseUrl: '',
          turretId,
          refreshTick,
        }),
      {
        initialProps: { turretId: '0xturret-a', refreshTick: 0 },
      },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/events/0xturret-a?page=1',
      expect.objectContaining({ cache: 'no-store' }),
    );

    act(() => {
      result.current.next();
    });

    await waitFor(() => {
      expect(result.current.page).toBe(2);
    });

    rerender({ turretId: '0xturret-b', refreshTick: 0 });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        3,
        '/api/events/0xturret-b?page=1',
        expect.objectContaining({ cache: 'no-store' }),
      );
    });
    expect(result.current.page).toBe(1);
  });
});
