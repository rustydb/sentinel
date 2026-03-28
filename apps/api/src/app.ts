import express from 'express';

import { registerRoutes } from './routes';
import type { Repositories } from './types';

export function createApp(repositories: Repositories) {
  const app = express();
  app.use(express.json());
  registerRoutes(app, repositories);
  return app;
}
