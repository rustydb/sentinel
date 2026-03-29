// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTurretSolarSystems } from './useTurretSolarSystems';

const NODE_ADDRESS = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

describe('useTurretSolarSystems', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefers current node mappings and falls back to retained mappings for orphaned turrets', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: { updated: 1 } }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                turretId: '0xorphaned',
                solarSystemId: 30000005,
                solarSystemName: 'I9T-0FN',
                sourceNodeId: NODE_ADDRESS,
              },
            ],
          }),
          { status: 200 },
        ),
      );

    const { result } = renderHook(() =>
      useTurretSolarSystems({
        turrets: [
          {
            id: '0xactive',
            itemId: '1',
            status: 'online',
            isOnline: true,
            typeId: '92401',
            energySourceId: NODE_ADDRESS,
          },
          {
            id: '0xorphaned',
            itemId: '2',
            status: 'offline',
            isOnline: false,
            typeId: '92404',
            energySourceId: 'orphaned',
          },
        ],
        nodeMappings: [
          {
            nodeId: NODE_ADDRESS,
            solarSystemId: 30000004,
            solarSystemName: 'O3H-1FN',
          },
        ],
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.byTurretId.get('0xactive')).toEqual({
      turretId: '0xactive',
      solarSystemId: 30000004,
      solarSystemName: 'O3H-1FN',
      resolutionSource: 'node',
    });
    expect(result.current.byTurretId.get('0xorphaned')).toEqual({
      turretId: '0xorphaned',
      solarSystemId: 30000005,
      solarSystemName: 'I9T-0FN',
      resolutionSource: 'retained',
    });
  });
});
