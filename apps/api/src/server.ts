import { createApp } from './app';
import { createDatabasePool, ensureSchema } from './db';
import { createRepositoriesFromPool } from './repositories';

async function main(): Promise<void> {
  const pool = createDatabasePool();
  await ensureSchema(pool);
  const app = createApp(createRepositoriesFromPool(pool));
  const port = Number(process.env.PORT ?? '3001');

  app.listen(port, () => {
    console.log(`sentinel-api listening on ${port}`);
  });
}

void main();
