import type { NetworkNodeMapping, TurretEvent } from '@frontier-sentinel/shared-types';
import type { Pool } from 'pg';

import type { NetworkNodeRepository, Repositories, TurretEventRepository } from './types';

export class InMemoryNetworkNodeRepository implements NetworkNodeRepository {
  readonly store = new Map<string, number>();

  all(): Promise<NetworkNodeMapping[]> {
    return Promise.resolve(
      [...this.store.entries()].map(([nodeId, solarSystemId]) => ({ nodeId, solarSystemId })),
    );
  }

  upsert(nodeId: string, solarSystemId: number): Promise<NetworkNodeMapping> {
    this.store.set(nodeId, solarSystemId);
    return Promise.resolve({ nodeId, solarSystemId });
  }

  delete(nodeId: string): Promise<boolean> {
    return Promise.resolve(this.store.delete(nodeId));
  }
}

export class InMemoryTurretEventRepository implements TurretEventRepository {
  constructor(private readonly events: TurretEvent[] = []) {}

  listByTurretId(
    turretId: string,
    page: number,
    pageSize: number,
  ): Promise<{
    events: TurretEvent[];
    nextPage: number | null;
  }> {
    const filtered = this.events.filter((event) => {
      const eventTurretId =
        event.jsonData.turret_id ?? event.jsonData.assembly_id ?? event.jsonData.turretId;
      return typeof eventTurretId === 'string' && eventTurretId === turretId;
    });
    const start = Math.max(0, (page - 1) * pageSize);
    const slice = filtered.slice(start, start + pageSize);
    return Promise.resolve({
      events: slice,
      nextPage: start + pageSize < filtered.length ? page + 1 : null,
    });
  }
}

class PostgresNetworkNodeRepository implements NetworkNodeRepository {
  constructor(private readonly pool: Pool) {}

  async all(): Promise<NetworkNodeMapping[]> {
    const result = await this.pool.query<NetworkNodeMapping>(
      'SELECT node_id AS "nodeId", solar_system_id AS "solarSystemId" FROM network_node_mappings ORDER BY node_id ASC',
    );
    return result.rows;
  }

  async upsert(nodeId: string, solarSystemId: number): Promise<NetworkNodeMapping> {
    const result = await this.pool.query<NetworkNodeMapping>(
      `
        INSERT INTO network_node_mappings (node_id, solar_system_id)
        VALUES ($1, $2)
        ON CONFLICT (node_id)
        DO UPDATE SET solar_system_id = EXCLUDED.solar_system_id, updated_at = NOW()
        RETURNING node_id AS "nodeId", solar_system_id AS "solarSystemId"
      `,
      [nodeId, solarSystemId],
    );
    return result.rows[0];
  }

  async delete(nodeId: string): Promise<boolean> {
    const result = await this.pool.query('DELETE FROM network_node_mappings WHERE node_id = $1', [
      nodeId,
    ]);
    return (result.rowCount ?? 0) > 0;
  }
}

class PostgresTurretEventRepository implements TurretEventRepository {
  constructor(private readonly pool: Pool) {}

  async listByTurretId(turretId: string, page: number, pageSize: number) {
    const offset = Math.max(0, (page - 1) * pageSize);
    const result = await this.pool.query<TurretEvent>(
      `
        SELECT
          tx_digest AS "txDigest",
          event_seq AS "eventSeq",
          checkpoint_sequence_number AS "checkpointSequenceNumber",
          event_type AS "eventType",
          json_data AS "jsonData",
          timestamp::text AS "timestamp"
        FROM turret_events
        WHERE COALESCE(json_data ->> 'turret_id', json_data ->> 'assembly_id', json_data ->> 'turretId') = $1
        ORDER BY checkpoint_sequence_number DESC, event_seq DESC
        LIMIT $2 OFFSET $3
      `,
      [turretId, pageSize + 1, offset],
    );

    const events = result.rows.slice(0, pageSize);
    return {
      events,
      nextPage: result.rows.length > pageSize ? page + 1 : null,
    };
  }
}

export function createRepositoriesFromPool(pool: Pool): Repositories {
  return {
    networkNodes: new PostgresNetworkNodeRepository(pool),
    turretEvents: new PostgresTurretEventRepository(pool),
  };
}

export function createInMemoryRepositories(
  seed: {
    networkNodes?: Array<{ nodeId: string; solarSystemId: number }>;
    events?: TurretEvent[];
  } = {},
): Repositories {
  const networkNodes = new InMemoryNetworkNodeRepository();
  for (const entry of seed.networkNodes ?? []) {
    networkNodes.store.set(entry.nodeId, entry.solarSystemId);
  }

  return {
    networkNodes,
    turretEvents: new InMemoryTurretEventRepository(seed.events),
  };
}
