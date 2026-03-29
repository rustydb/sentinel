// @vitest-environment jsdom

import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTurrets } from './useTurrets';

describe('useTurrets', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests the shared GraphQL contract and maps turrets', async () => {
    const ownerCapsPayload = {
      data: {
        address: {
          objects: {
            nodes: [
              {
                contents: {
                  extract: {
                    asAddress: {
                      asObject: {
                        address: '0xcharacter',
                        asMoveObject: {
                          contents: {
                            json: {
                              name: 'Commander Nova',
                            },
                          },
                        },
                      },
                      objects: {
                        pageInfo: {
                          hasNextPage: false,
                          endCursor: null,
                        },
                        nodes: [
                          {
                            contents: {
                              extract: {
                                asAddress: {
                                  asObject: {
                                    asMoveObject: {
                                      contents: {
                                        type: {
                                          repr: '0xd12::turret::Turret',
                                        },
                                        json: {
                                          id: '0xturret',
                                          key: {
                                            item_id: '1001',
                                            tenant: 'utopia',
                                          },
                                          status: {
                                            status: {
                                              '@variant': 'ONLINE',
                                            },
                                          },
                                          type_id: 'turret.mk1',
                                          energy_source_id: 'node-7',
                                          location: {
                                            location_hash: 'J101',
                                          },
                                          metadata: {
                                            name: 'Alpha Bastion',
                                          },
                                        },
                                      },
                                    },
                                  },
                                },
                              },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    };

    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify(ownerCapsPayload), { status: 200 }));

    const { result } = renderHook(() => useTurrets({ owner: '0xfrontier', endpoint: '/graphql' }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      '/graphql',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result.current.characterName).toBe('Commander Nova');
    expect(result.current.turrets[0]?.name).toBe('Alpha Bastion');
    expect(result.current.turrets[0]?.energySourceId).toBe('node-7');
  });
});
