// @vitest-environment jsdom

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTurrets } from './useTurrets';

function getRequestBody(init: RequestInit | undefined): string | null {
  return typeof init?.body === 'string' ? init.body : null;
}

describe('useTurrets', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
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

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(ownerCapsPayload), { status: 200 }),
    );

    const { result } = renderHook(() =>
      useTurrets({ owner: '0xfrontier', world: 'utopia', endpoint: '/graphql' }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const firstFetchCall = vi.mocked(globalThis.fetch).mock.calls[0];

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect(firstFetchCall).toBeDefined();
    expect(firstFetchCall?.[0]).toBe('/graphql');
    expect(firstFetchCall?.[1]?.method).toBe('POST');
    expect(firstFetchCall?.[1]?.cache).toBe('no-store');
    expect(getRequestBody(firstFetchCall?.[1])).toContain(
      '0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75::character::PlayerProfile',
    );
    expect(result.current.characterName).toBe('Commander Nova');
    expect(result.current.turrets[0]?.name).toBe('Alpha Bastion');
    expect(result.current.turrets[0]?.energySourceId).toBe('node-7');
  });

  it('keeps refreshed turret data visible without re-entering the loading state', async () => {
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

    const refreshPayload = {
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
      .mockResolvedValueOnce(new Response(JSON.stringify(ownerCapsPayload), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(refreshPayload), { status: 200 }));

    const { result, rerender } = renderHook(
      ({ refreshTick }: { refreshTick: number }) =>
        useTurrets({ owner: '0xfrontier', world: 'utopia', endpoint: '/graphql', refreshTick }),
      {
        initialProps: { refreshTick: 0 },
      },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.turrets).toHaveLength(1);

    act(() => {
      rerender({ refreshTick: 1 });
    });

    expect(result.current.loading).toBe(false);
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('uses the stillness package id when the active world is stillness', async () => {
    vi.stubEnv(
      'VITE_STILLNESS_TURRET_PACKAGE_ID',
      '0xstillnesspackage0000000000000000000000000000000000000000000000000001',
    );

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          data: {
            address: {
              objects: {
                nodes: [],
              },
            },
          },
        }),
        { status: 200 },
      ),
    );

    const { result } = renderHook(() =>
      useTurrets({ owner: '0xfrontier', world: 'stillness', endpoint: '/graphql' }),
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const stillnessFetchCall = vi.mocked(globalThis.fetch).mock.calls[0];

    expect(stillnessFetchCall).toBeDefined();
    expect(stillnessFetchCall?.[0]).toBe('/graphql');
    expect(getRequestBody(stillnessFetchCall?.[1])).toContain(
      '0xstillnesspackage0000000000000000000000000000000000000000000000000001::character::PlayerProfile',
    );
  });
});
