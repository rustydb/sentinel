import { describe, expect, it } from 'vitest';

import { createApiHandlers } from './routes';
import { createInMemoryRepositories } from './repositories';

function createMockResponse() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
    send(payload?: unknown) {
      this.body = payload;
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
      { params: { id: 'node-7' }, body: { solarSystemId: 31002477 } } as never,
      createResponse as never,
    );
    expect(createResponse.statusCode).toBe(201);

    const listResponse = createMockResponse();
    await handlers.listNetworkNodes({} as never, listResponse as never);
    expect(
      (listResponse.body as { data: Array<{ nodeId: string; solarSystemId: number }> }).data,
    ).toEqual([{ nodeId: 'node-7', solarSystemId: 31002477 }]);

    const deleteResponse = createMockResponse();
    await handlers.deleteNetworkNode(
      { params: { id: 'node-7' } } as never,
      deleteResponse as never,
    );
    expect(deleteResponse.statusCode).toBe(204);
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
