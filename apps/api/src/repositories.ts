import type {
  NetworkNodeMapping,
  TurretEvent,
  TurretSolarSystemMapping,
} from '@frontier-sentinel/shared-types';
import type { Pool } from 'pg';

import type {
  NetworkNodeRepository,
  Repositories,
  SolarSystemAssignmentInput,
  TurretEventRepository,
  TurretNodeRelation,
  TurretSolarSystemRepository,
} from './types';

export class InMemoryNetworkNodeRepository implements NetworkNodeRepository {
  readonly store = new Map<string, SolarSystemAssignmentInput>();

  all(): Promise<NetworkNodeMapping[]> {
    return Promise.resolve(
      [...this.store.entries()].map(([nodeId, assignment]) => ({
        nodeId,
        solarSystemId: assignment.solarSystemId,
        solarSystemName: assignment.solarSystemName,
      })),
    );
  }

  upsert(nodeId: string, assignment: SolarSystemAssignmentInput): Promise<NetworkNodeMapping> {
    this.store.set(nodeId, assignment);
    return Promise.resolve({
      nodeId,
      solarSystemId: assignment.solarSystemId,
      solarSystemName: assignment.solarSystemName,
    });
  }

  delete(nodeId: string): Promise<boolean> {
    return Promise.resolve(this.store.delete(nodeId));
  }
}

export class InMemoryTurretSolarSystemRepository implements TurretSolarSystemRepository {
  readonly store = new Map<string, TurretSolarSystemMapping>();

  constructor(private readonly networkNodes: InMemoryNetworkNodeRepository) {}

  listByTurretIds(turretIds: string[]): Promise<TurretSolarSystemMapping[]> {
    return Promise.resolve(
      turretIds
        .map((turretId) => this.store.get(turretId))
        .filter((value): value is TurretSolarSystemMapping => value != null),
    );
  }

  sync(turrets: TurretNodeRelation[]): Promise<number> {
    let updated = 0;

    for (const turret of turrets) {
      if (!turret.nodeId) {
        continue;
      }

      const assignment = this.networkNodes.store.get(turret.nodeId);
      if (!assignment) {
        continue;
      }

      this.store.set(turret.turretId, {
        turretId: turret.turretId,
        solarSystemId: assignment.solarSystemId,
        solarSystemName: assignment.solarSystemName,
        sourceNodeId: turret.nodeId,
      });
      updated += 1;
    }

    return Promise.resolve(updated);
  }

  clearBySourceNode(nodeId: string): Promise<number> {
    let cleared = 0;
    for (const [turretId, mapping] of this.store.entries()) {
      if (mapping.sourceNodeId === nodeId) {
        this.store.delete(turretId);
        cleared += 1;
      }
    }
    return Promise.resolve(cleared);
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
      'SELECT node_id AS "nodeId", solar_system_id AS "solarSystemId", solar_system_name AS "solarSystemName" FROM network_node_mappings ORDER BY node_id ASC',
    );
    return result.rows;
  }

  async upsert(
    nodeId: string,
    assignment: SolarSystemAssignmentInput,
  ): Promise<NetworkNodeMapping> {
    const result = await this.pool.query<NetworkNodeMapping>(
      `
        INSERT INTO network_node_mappings (node_id, solar_system_id, solar_system_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (node_id)
        DO UPDATE SET
          solar_system_id = EXCLUDED.solar_system_id,
          solar_system_name = EXCLUDED.solar_system_name,
          updated_at = NOW()
        RETURNING
          node_id AS "nodeId",
          solar_system_id AS "solarSystemId",
          solar_system_name AS "solarSystemName"
      `,
      [nodeId, assignment.solarSystemId, assignment.solarSystemName],
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

class PostgresTurretSolarSystemRepository implements TurretSolarSystemRepository {
  constructor(private readonly pool: Pool) {}

  async listByTurretIds(turretIds: string[]): Promise<TurretSolarSystemMapping[]> {
    if (turretIds.length === 0) {
      return [];
    }

    const result = await this.pool.query<TurretSolarSystemMapping>(
      `
        SELECT
          turret_id AS "turretId",
          solar_system_id AS "solarSystemId",
          solar_system_name AS "solarSystemName",
          source_node_id AS "sourceNodeId"
        FROM turret_solar_system_mappings
        WHERE turret_id = ANY($1::text[])
        ORDER BY turret_id ASC
      `,
      [turretIds],
    );

    return result.rows;
  }

  async sync(turrets: TurretNodeRelation[]): Promise<number> {
    let updated = 0;

    for (const turret of turrets) {
      if (!turret.nodeId) {
        continue;
      }

      const result = await this.pool.query(
        `
          INSERT INTO turret_solar_system_mappings (
            turret_id,
            solar_system_id,
            solar_system_name,
            source_node_id
          )
          SELECT
            $1,
            network_node_mappings.solar_system_id,
            network_node_mappings.solar_system_name,
            $2
          FROM network_node_mappings
          WHERE network_node_mappings.node_id = $2
          ON CONFLICT (turret_id)
          DO UPDATE SET
            solar_system_id = EXCLUDED.solar_system_id,
            solar_system_name = EXCLUDED.solar_system_name,
            source_node_id = EXCLUDED.source_node_id,
            updated_at = NOW()
        `,
        [turret.turretId, turret.nodeId],
      );

      updated += result.rowCount ?? 0;
    }

    return updated;
  }

  async clearBySourceNode(nodeId: string): Promise<number> {
    const result = await this.pool.query(
      'DELETE FROM turret_solar_system_mappings WHERE source_node_id = $1',
      [nodeId],
    );
    return result.rowCount ?? 0;
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
    turretSolarSystems: new PostgresTurretSolarSystemRepository(pool),
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
    networkNodes.store.set(entry.nodeId, {
      solarSystemId: entry.solarSystemId,
      solarSystemName: 'Unknown',
    });
  }

  return {
    networkNodes,
    turretSolarSystems: new InMemoryTurretSolarSystemRepository(networkNodes),
    turretEvents: new InMemoryTurretEventRepository(seed.events),
  };
}
