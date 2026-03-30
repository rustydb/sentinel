// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTurretIntelligence } from './useTurretIntelligence';

describe('useTurretIntelligence', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads turret intelligence summaries and derives shell statistics', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [
              {
                turretId: '0x1111111111111111111111111111111111111111111111111111111111111111',
                latestPriorityEvent: {
                  txDigest: '0xabc',
                  eventSeq: 1,
                  checkpointSequenceNumber: 2,
                  timestamp: '2026-03-29T10:00:00.000Z',
                },
                targetItemId: '7001',
                targetCharacterId: 77,
                targetDisplayName: 'Captain Rusty',
                isNpc: false,
                tribeId: 128,
                tribeName: 'Vherokior',
                targetTypeId: '92404',
                isAggressor: true,
                behaviorChange: 'STARTED_ATTACK',
                statusOverride: 'ENGAGED',
                aggressorsPast24Hours: 3,
              },
            ],
          }),
      }),
    );

    const { result } = renderHook(() =>
      useTurretIntelligence({
        turrets: [
          {
            id: '0x1111111111111111111111111111111111111111111111111111111111111111',
            itemId: '42',
            status: 'online',
            isOnline: true,
            typeId: '92404',
            energySourceId: 'orphaned',
          },
        ],
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(
      result.current.byTurretId.get(
        '0x1111111111111111111111111111111111111111111111111111111111111111',
      )?.statusOverride,
    ).toBe('ENGAGED');
    expect(result.current.stats).toEqual({
      totalTurrets: 1,
      engagedTurrets: 1,
      onlineTurrets: 0,
      offlineTurrets: 0,
      aggressorsPast24Hours: 3,
    });
  });
});
