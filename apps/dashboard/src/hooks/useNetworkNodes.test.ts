// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useNetworkNodes } from './useNetworkNodes';

describe('useNetworkNodes', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hydrates node metadata from direct object lookups and normalizes numeric type ids', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: [
              {
                nodeId: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                solarSystemId: 30000004,
                solarSystemName: 'O3H-1FN',
              },
            ],
          }),
          { status: 200 },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            data: {
              object: {
                address: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
                asMoveObject: {
                  contents: {
                    type: {
                      repr: '0xd12::node::NetworkNode',
                    },
                    json: {
                      type_id: 92401,
                      metadata: {
                        name: 'Node Prime',
                      },
                    },
                  },
                },
              },
            },
          }),
          { status: 200 },
        ),
      );

    const { result } = renderHook(() =>
      useNetworkNodes({
        apiBaseUrl: '',
        graphQlEndpoint: '/graphql',
        candidateNodeIds: ['0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'],
      }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/api/network-nodes',
      expect.objectContaining({ cache: 'no-store' }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      '/graphql',
      expect.objectContaining({
        method: 'POST',
        cache: 'no-store',
      }),
    );
    expect(result.current.nodes).toEqual([
      {
        nodeId: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        solarSystemId: 30000004,
        solarSystemName: 'O3H-1FN',
        typeId: '92401',
        displayName: 'Node Prime',
      },
    ]);
  });
});
