import type { NetworkNodeMapping, TurretEvent } from '@frontier-sentinel/shared-types';

export interface NetworkNodeRepository {
  all(): Promise<NetworkNodeMapping[]>;
  upsert(nodeId: string, solarSystemId: number): Promise<NetworkNodeMapping>;
  delete(nodeId: string): Promise<boolean>;
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

export interface Repositories {
  networkNodes: NetworkNodeRepository;
  turretEvents: TurretEventRepository;
}
