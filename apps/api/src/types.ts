import type {
  NetworkNodeMapping,
  TurretEvent,
  TurretIntelligenceSummary,
  TurretSolarSystemMapping,
} from '@sentinel/shared-types';

export interface SolarSystemAssignmentInput {
  solarSystemId: number;
  solarSystemName: string | null;
}

export interface TurretNodeRelation {
  turretId: string;
  nodeId: string | null;
}

export interface NetworkNodeRepository {
  all(): Promise<NetworkNodeMapping[]>;
  upsert(nodeId: string, assignment: SolarSystemAssignmentInput): Promise<NetworkNodeMapping>;
  delete(nodeId: string): Promise<boolean>;
}

export interface TurretSolarSystemRepository {
  listByTurretIds(turretIds: string[]): Promise<TurretSolarSystemMapping[]>;
  sync(turrets: TurretNodeRelation[]): Promise<number>;
  clearBySourceNode(nodeId: string): Promise<number>;
}

export interface TurretEventRepository {
  listByTurretId(
    turretId: string,
    page: number,
    pageSize: number,
  ): Promise<{
    events: TurretEvent[];
    nextPage: number | null;
  }>;
}

export interface TurretIntelligenceRepository {
  listByTurretIds(turretIds: string[]): Promise<TurretIntelligenceSummary[]>;
}

export interface Repositories {
  networkNodes: NetworkNodeRepository;
  turretSolarSystems: TurretSolarSystemRepository;
  turretEvents: TurretEventRepository;
  turretIntelligence: TurretIntelligenceRepository;
}
