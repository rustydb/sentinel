import {
  isTurretIntelligenceSummary,
  type TurretIntelligenceSummary,
} from '@frontier-sentinel/shared-types';
import { describe, expect, it } from 'vitest';

import { createApiHandlers } from './routes';
import { createInMemoryRepositories } from './repositories';

interface MockResponse<TBody = unknown> {
  statusCode: number;
  body: TBody | undefined;
  headers: Record<string, string>;
  status: (code: number) => MockResponse<TBody>;
  json: (payload: TBody) => MockResponse<TBody>;
  send: (payload?: TBody) => MockResponse<TBody>;
  set: (name: string, value: string) => MockResponse<TBody>;
}

function isTurretIntelligenceResponseBody(
  value: unknown,
): value is { data: TurretIntelligenceSummary[] } {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const maybeData = (value as { data?: unknown }).data;
  return Array.isArray(maybeData) && maybeData.every(isTurretIntelligenceSummary);
}

function createMockResponse<TBody = unknown>(): MockResponse<TBody> {
  return {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(this: MockResponse<TBody>, code: number) {
      this.statusCode = code;
      return this;
    },
    json(this: MockResponse<TBody>, payload: TBody) {
      this.body = payload;
      return this;
    },
    send(this: MockResponse<TBody>, payload?: TBody) {
      this.body = payload;
      return this;
    },
    set(this: MockResponse<TBody>, name: string, value: string) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
  };
}

describe('API', () => {
  it('returns service health', () => {
    const handlers = createApiHandlers(createInMemoryRepositories());
    const response = createMockResponse();

    handlers.health({} as never, response as never);

    expect(response.statusCode).toBe(200);
    expect((response.body as { status: string }).status).toBe('ok');
  });

  it('supports CRUD for network node mappings', async () => {
    const handlers = createApiHandlers(createInMemoryRepositories());

    const createResponse = createMockResponse();
    await handlers.upsertNetworkNode(
      {
        params: { id: 'node-7' },
        body: { solarSystemId: 31002477, solarSystemName: 'Jita' },
      } as never,
      createResponse as never,
    );
    expect(createResponse.statusCode).toBe(201);

    const listResponse = createMockResponse();
    await handlers.listNetworkNodes({} as never, listResponse as never);
    expect(
      (
        listResponse.body as {
          data: Array<{ nodeId: string; solarSystemId: number; solarSystemName: string | null }>;
        }
      ).data,
    ).toEqual([{ nodeId: 'node-7', solarSystemId: 31002477, solarSystemName: 'Jita' }]);
    expect(listResponse.headers['cache-control']).toBe('no-store');
    expect(listResponse.headers.pragma).toBe('no-cache');
    expect(listResponse.headers.expires).toBe('0');

    const deleteResponse = createMockResponse();
    await handlers.deleteNetworkNode(
      { params: { id: 'node-7' } } as never,
      deleteResponse as never,
    );
    expect(deleteResponse.statusCode).toBe(204);
  });

  it('stores and returns retained turret solar-system mappings', async () => {
    const handlers = createApiHandlers(createInMemoryRepositories());

    await handlers.upsertNetworkNode(
      {
        params: { id: 'node-7' },
        body: { solarSystemId: 31002477, solarSystemName: 'Jita' },
      } as never,
      createMockResponse() as never,
    );

    const syncResponse = createMockResponse();
    await handlers.syncTurretSolarSystems(
      {
        body: {
          turrets: [{ turretId: '0xturret-1', nodeId: 'node-7' }],
        },
      } as never,
      syncResponse as never,
    );

    expect(syncResponse.statusCode).toBe(200);
    expect((syncResponse.body as { data: { updated: number } }).data.updated).toBe(1);

    const listResponse = createMockResponse();
    await handlers.listTurretSolarSystems(
      { query: { ids: '0xturret-1' } } as never,
      listResponse as never,
    );

    expect((listResponse.body as { data: Array<{ solarSystemName: string | null }> }).data).toEqual(
      [
        {
          turretId: '0xturret-1',
          solarSystemId: 31002477,
          solarSystemName: 'Jita',
          sourceNodeId: 'node-7',
        },
      ],
    );
    expect(listResponse.headers['cache-control']).toBe('no-store');
  });

  it('returns paginated turret events', async () => {
    const handlers = createApiHandlers(
      createInMemoryRepositories({
        events: [
          {
            txDigest: '0xabc',
            eventSeq: 1,
            checkpointSequenceNumber: 5,
            eventType: 'TurretStatusChanged',
            jsonData: { turretId: '0xturret', status: 'online' },
            timestamp: '2026-03-26T12:00:00.000Z',
          },
        ],
      }),
    );
    const response = createMockResponse();

    await handlers.listTurretEvents(
      { params: { turretId: '0xturret' }, query: {} } as never,
      response as never,
    );

    expect(response.statusCode).toBe(200);
    expect((response.body as { data: unknown[] }).data).toHaveLength(1);
    expect(
      (response.body as { pagination: { nextPage: number | null } }).pagination.nextPage,
    ).toBeNull();
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('returns turret intelligence summaries including engaged status and aggressor counts', async () => {
    const turretId = '0xturret';
    const handlers = createApiHandlers(
      createInMemoryRepositories({
        events: [
          {
            txDigest: '0xengaged',
            eventSeq: 2,
            checkpointSequenceNumber: 9,
            eventType: 'PriorityListUpdatedEvent',
            jsonData: {
              turret_id: turretId,
              priority_list: [
                {
                  target_item_id: '7001',
                  character_id: 4123,
                  character_name: 'Captain Rusty',
                  character_tribe: 128,
                  type_id: '92404',
                  is_aggressor: true,
                  behavior_change: 'STARTED_ATTACK',
                },
              ],
            },
            timestamp: new Date().toISOString(),
          },
          {
            txDigest: '0xolder',
            eventSeq: 1,
            checkpointSequenceNumber: 8,
            eventType: 'PriorityListUpdatedEvent',
            jsonData: {
              turret_id: turretId,
              priority_list: [
                {
                  target_item_id: '7002',
                  character_id: 0,
                  type_id: '92401',
                  is_aggressor: true,
                  behavior_change: 'ENTERED',
                },
              ],
            },
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    );
    const response = createMockResponse();

    await handlers.listTurretIntelligence({ query: { ids: turretId } } as never, response as never);

    expect(response.statusCode).toBe(200);
    const body = response.body;
    if (!isTurretIntelligenceResponseBody(body)) {
      throw new Error('Expected turret intelligence response body');
    }

    const summaries: TurretIntelligenceSummary[] = body.data;
    expect(summaries).toHaveLength(1);
    expect(response.headers['cache-control']).toBe('no-store');
    const summary: TurretIntelligenceSummary | undefined = summaries[0];
    if (!summary) {
      throw new Error('Expected a turret intelligence summary');
    }

    expect(summary).toMatchObject({
      turretId,
      latestPriorityEvent: {
        txDigest: '0xengaged',
        eventSeq: 2,
        checkpointSequenceNumber: 9,
      },
      targetItemId: '7001',
      targetCharacterId: 4123,
      targetDisplayName: 'Captain Rusty',
      isNpc: false,
      tribeId: 128,
      tribeName: 'Vherokior',
      targetTypeId: '92404',
      isAggressor: true,
      behaviorChange: 'STARTED_ATTACK',
      statusOverride: 'ENGAGED',
      aggressorsPast24Hours: 2,
    });
    expect(summary.latestPriorityEvent.timestamp).toEqual(expect.any(String));
  });

  it('keeps p95 response time under 200ms for health requests', () => {
    const handlers = createApiHandlers(createInMemoryRepositories());
    const samples: number[] = [];

    for (let index = 0; index < 25; index += 1) {
      const start = performance.now();
      const response = createMockResponse();
      handlers.health({} as never, response as never);
      expect(response.statusCode).toBe(200);
      samples.push(performance.now() - start);
    }

    const ordered = [...samples].sort((left, right) => left - right);
    const p95 = ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * 0.95))];
    expect(p95).toBeLessThan(200);
  });
});
