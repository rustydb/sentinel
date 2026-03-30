import type {
  NetworkNodeMapping,
  TurretEvent,
  TurretIntelligenceSummary,
  TurretSolarSystemMapping,
} from '@frontier-sentinel/shared-types';
import type { Pool } from 'pg';

import type {
  NetworkNodeRepository,
  Repositories,
  SolarSystemAssignmentInput,
  TurretEventRepository,
  TurretIntelligenceRepository,
  TurretNodeRelation,
  TurretSolarSystemRepository,
} from './types';

interface PriorityTargetCandidate {
  target_item_id?: unknown;
  item_id?: unknown;
  character_id?: unknown;
  character_tribe?: unknown;
  tribe_id?: unknown;
  character_name?: unknown;
  characterName?: unknown;
  name?: unknown;
  tribe_name?: unknown;
  tribeName?: unknown;
  type_id?: unknown;
  is_aggressor?: unknown;
  behavior_change?: unknown;
  behaviour_change?: unknown;
}

const TRIBE_NAMES = new Map<number, string>([
  [1, 'Amarr'],
  [2, 'Ni-Kunni'],
  [4, 'Khanid'],
  [8, 'Gallente'],
  [16, 'Civire'],
  [32, 'Sebiestor'],
  [64, 'Brutor'],
  [128, 'Vherokior'],
]);

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readBoolean(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null;
}

function parsePriorityList(value: unknown): PriorityTargetCandidate[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (entry): entry is PriorityTargetCandidate => !!entry && typeof entry === 'object',
  );
}

function normalizeBehaviorChange(value: unknown): TurretIntelligenceSummary['behaviorChange'] {
  const raw = readString(value);
  switch (raw) {
    case 'UNSPECIFIED':
    case 'ENTERED':
    case 'STARTED_ATTACK':
    case 'STOPPED_ATTACK':
      return raw;
    default:
      return null;
  }
}

function resolveTribeName(tribeId: number | null, fallback: unknown): string | null {
  const explicit = readString(fallback);
  if (explicit) {
    return explicit;
  }

  if (tribeId == null) {
    return null;
  }

  return TRIBE_NAMES.get(tribeId) ?? `Tribe ${tribeId}`;
}

function deriveSummaryFromEvent(
  turretId: string,
  event: TurretEvent | null,
  aggressorsPast24Hours: number,
): TurretIntelligenceSummary {
  if (!event) {
    return {
      turretId,
      latestPriorityEvent: null,
      targetItemId: null,
      targetCharacterId: null,
      targetDisplayName: null,
      isNpc: false,
      tribeId: null,
      tribeName: null,
      targetTypeId: null,
      isAggressor: null,
      behaviorChange: null,
      statusOverride: null,
      aggressorsPast24Hours,
    };
  }

  const priorityList = parsePriorityList(event.jsonData.priority_list);
  const target = priorityList[0];
  const characterId = readNumber(target?.character_id);
  const tribeId = readNumber(target?.character_tribe ?? target?.tribe_id);
  const isNpc = characterId === 0;
  const behaviorChange = normalizeBehaviorChange(
    target?.behavior_change ?? target?.behaviour_change,
  );
  const explicitDisplayName =
    readString(target?.character_name) ??
    readString(target?.characterName) ??
    readString(target?.name);

  return {
    turretId,
    latestPriorityEvent: {
      txDigest: event.txDigest,
      eventSeq: event.eventSeq,
      checkpointSequenceNumber: event.checkpointSequenceNumber,
      timestamp: event.timestamp,
    },
    targetItemId: readString(target?.target_item_id) ?? readString(target?.item_id),
    targetCharacterId: characterId,
    targetDisplayName: isNpc
      ? 'NPC'
      : (explicitDisplayName ?? (characterId != null ? `Character ${characterId}` : null)),
    isNpc,
    tribeId,
    tribeName: resolveTribeName(tribeId, target?.tribe_name ?? target?.tribeName),
    targetTypeId: readString(target?.type_id),
    isAggressor: readBoolean(target?.is_aggressor),
    behaviorChange,
    statusOverride: behaviorChange === 'STARTED_ATTACK' ? 'ENGAGED' : null,
    aggressorsPast24Hours,
  };
}

function countAggressorsInEvents(events: TurretEvent[], sinceDate: Date): number {
  return events.reduce((count, event) => {
    const eventDate = new Date(event.timestamp);
    if (Number.isNaN(eventDate.getTime()) || eventDate < sinceDate) {
      return count;
    }

    const priorityList = parsePriorityList(event.jsonData.priority_list);
    return (
      count +
      priorityList.filter((candidate) => readBoolean(candidate.is_aggressor) === true).length
    );
  }, 0);
}

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

export class InMemoryTurretIntelligenceRepository implements TurretIntelligenceRepository {
  constructor(private readonly events: TurretEvent[] = []) {}

  listByTurretIds(turretIds: string[]): Promise<TurretIntelligenceSummary[]> {
    const sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return Promise.resolve(
      turretIds.map((turretId) => {
        const events = this.events
          .filter((event) => {
            const eventTurretId =
              event.jsonData.turret_id ?? event.jsonData.assembly_id ?? event.jsonData.turretId;
            return typeof eventTurretId === 'string' && eventTurretId === turretId;
          })
          .filter(
            (event) =>
              event.eventType.includes('PriorityListUpdatedEvent') ||
              Array.isArray(event.jsonData.priority_list),
          )
          .sort((left, right) => {
            if (right.checkpointSequenceNumber !== left.checkpointSequenceNumber) {
              return right.checkpointSequenceNumber - left.checkpointSequenceNumber;
            }

            return right.eventSeq - left.eventSeq;
          });

        const latest = events[0] ?? null;
        const aggressorsPast24Hours = countAggressorsInEvents(events, sinceDate);
        return deriveSummaryFromEvent(turretId, latest, aggressorsPast24Hours);
      }),
    );
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

class PostgresTurretIntelligenceRepository implements TurretIntelligenceRepository {
  constructor(private readonly pool: Pool) {}

  async listByTurretIds(turretIds: string[]): Promise<TurretIntelligenceSummary[]> {
    if (turretIds.length === 0) {
      return [];
    }

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
        WHERE COALESCE(json_data ->> 'turret_id', json_data ->> 'assembly_id', json_data ->> 'turretId') = ANY($1::text[])
          AND (
            event_type LIKE '%PriorityListUpdatedEvent%'
            OR json_data ? 'priority_list'
          )
        ORDER BY checkpoint_sequence_number DESC, event_seq DESC
      `,
      [turretIds],
    );

    const eventsByTurretId = new Map<string, TurretEvent[]>();

    for (const event of result.rows) {
      const turretIdValue =
        event.jsonData.turret_id ?? event.jsonData.assembly_id ?? event.jsonData.turretId;
      if (typeof turretIdValue !== 'string') {
        continue;
      }

      const existing = eventsByTurretId.get(turretIdValue) ?? [];
      existing.push(event);
      eventsByTurretId.set(turretIdValue, existing);
    }

    const sinceDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return turretIds.map((turretId) => {
      const events = eventsByTurretId.get(turretId) ?? [];
      const latest = events[0] ?? null;
      const aggressorsPast24Hours = countAggressorsInEvents(events, sinceDate);
      return deriveSummaryFromEvent(turretId, latest, aggressorsPast24Hours);
    });
  }
}

export function createRepositoriesFromPool(pool: Pool): Repositories {
  return {
    networkNodes: new PostgresNetworkNodeRepository(pool),
    turretSolarSystems: new PostgresTurretSolarSystemRepository(pool),
    turretEvents: new PostgresTurretEventRepository(pool),
    turretIntelligence: new PostgresTurretIntelligenceRepository(pool),
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
    turretIntelligence: new InMemoryTurretIntelligenceRepository(seed.events),
  };
}
