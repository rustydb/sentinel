import { Pool } from 'pg';

const DEFAULT_CONNECTION = 'postgres://sentinel:sentinel@localhost:5432/frontier_sentinel';

export const NETWORK_NODE_MAPPINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS network_node_mappings (
    node_id TEXT PRIMARY KEY,
    solar_system_id INTEGER NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export function createDatabasePool(
  connectionString = process.env.DATABASE_URL ?? DEFAULT_CONNECTION,
): Pool {
  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 10_000,
  });
}

export async function ensureSchema(pool: Pool): Promise<void> {
  await pool.query(NETWORK_NODE_MAPPINGS_TABLE);
}
