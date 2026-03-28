import * as z from 'zod';
import type { Express, Request, Response } from 'express';

import type { Repositories } from './types';

const nodePayloadSchema = z.object({
  solarSystemId: z.number().int().positive(),
});

function parsePage(search: string | undefined): number {
  const page = Number(search ?? '1');
  return Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
}

function pageQueryValue(page: Request['query']['page']): string | undefined {
  return typeof page === 'string' ? page : undefined;
}

export function createApiHandlers(repositories: Repositories) {
  return {
    health(_request: Request, response: Response) {
      response.json({
        status: 'ok',
        service: 'frontier-sentinel-api',
        timestamp: new Date().toISOString(),
      });
    },

    async listNetworkNodes(_request: Request, response: Response) {
      response.json({ data: await repositories.networkNodes.all() });
    },

    async upsertNetworkNode(request: Request, response: Response) {
      const parsed = nodePayloadSchema.safeParse(request.body);
      if (!parsed.success) {
        response.status(400).json({ error: 'Invalid payload', issues: parsed.error.flatten() });
        return;
      }

      const record = await repositories.networkNodes.upsert(
        request.params.id,
        parsed.data.solarSystemId,
      );
      response.status(201).json({ data: record });
    },

    async deleteNetworkNode(request: Request, response: Response) {
      const deleted = await repositories.networkNodes.delete(request.params.id);
      response.status(deleted ? 204 : 404).send();
    },

    async listTurretEvents(request: Request, response: Response) {
      const page = parsePage(pageQueryValue(request.query.page));
      const pageSize = 10;
      const result = await repositories.turretEvents.listByTurretId(
        request.params.turretId,
        page,
        pageSize,
      );
      response.json({
        data: result.events,
        pagination: {
          page,
          pageSize,
          nextPage: result.nextPage,
        },
      });
    },
  };
}

export function registerRoutes(app: Express, repositories: Repositories): void {
  const handlers = createApiHandlers(repositories);

  app.get('/api/health', (request: Request, response: Response) => {
    handlers.health(request, response);
  });

  app.get('/api/network-nodes', async (request: Request, response: Response) => {
    await handlers.listNetworkNodes(request, response);
  });

  app.post('/api/network-nodes/:id/solar-system', async (request: Request, response: Response) => {
    await handlers.upsertNetworkNode(request, response);
  });

  app.delete(
    '/api/network-nodes/:id/solar-system',
    async (request: Request, response: Response) => {
      await handlers.deleteNetworkNode(request, response);
    },
  );

  app.get('/api/events/:turretId', async (request: Request, response: Response) => {
    await handlers.listTurretEvents(request, response);
  });
}
