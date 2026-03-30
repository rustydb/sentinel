import { Pool } from 'pg';

const DEFAULT_CONNECTION = 'postgres://sentinel:sentinel@localhost:5432/sentinel';

export const NETWORK_NODE_MAPPINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS network_node_mappings (
    node_id TEXT PRIMARY KEY,
    solar_system_id INTEGER NOT NULL,
    solar_system_name TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
`;

export const NETWORK_NODE_MAPPINGS_NAME_COLUMN = `
  ALTER TABLE network_node_mappings
  ADD COLUMN IF NOT EXISTS solar_system_name TEXT;
`;

export const TURRET_SOLAR_SYSTEM_MAPPINGS_TABLE = `
  CREATE TABLE IF NOT EXISTS turret_solar_system_mappings (
    turret_id TEXT PRIMARY KEY,
    solar_system_id INTEGER NOT NULL,
    solar_system_name TEXT,
    source_node_id TEXT,
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
  await pool.query(NETWORK_NODE_MAPPINGS_NAME_COLUMN);
  await pool.query(TURRET_SOLAR_SYSTEM_MAPPINGS_TABLE);
}
