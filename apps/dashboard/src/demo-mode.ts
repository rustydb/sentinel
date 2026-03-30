import type {
  ShellStatisticsSnapshot,
  TurretData,
  TurretIntelligenceSummary,
} from '@sentinel/shared-types';

import type { TurretTypeCatalogEntry } from './hooks/useTurretTypeCatalog';
import {
  sampleEvents,
  sampleNetworkNodes,
  sampleNodes,
  sampleResolvedTurretSolarSystems,
  sampleTurretIntelligence,
  sampleTurretStats,
  sampleTurrets,
} from './test-data';
import type { ResolvedTurretSolarSystem } from './hooks/useTurretSolarSystems';

export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';
export const DEMO_WALLET_ADDRESS =
  '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd';
export const DEMO_CHARACTER_NAME = 'The Slayer';

export const demoTurrets = sampleTurrets;
export const demoNodeMappings = sampleNodes;
export const demoNetworkNodes = sampleNetworkNodes;
export const demoEventsState = {
  events: sampleEvents,
  loading: false,
  error: null,
  page: 1,
  nextPage: null,
  next: () => undefined,
  reset: () => undefined,
};
export const demoNodeActions = {
  assignNode: () => Promise.resolve(),
  unassignNode: () => Promise.resolve(),
};
export const demoSolarSystemsByTurretId = new Map<string, ResolvedTurretSolarSystem>(
  sampleResolvedTurretSolarSystems.map((entry) => [
    entry.turretId,
    {
      turretId: entry.turretId,
      solarSystemId: entry.solarSystemId,
      solarSystemName: entry.solarSystemName,
      resolutionSource: entry.resolutionSource,
    },
  ]),
);
export const demoTurretIntelligenceByTurretId = new Map<string, TurretIntelligenceSummary>(
  sampleTurretIntelligence.map((entry) => [entry.turretId, entry]),
);
export const demoTurretStats: ShellStatisticsSnapshot = sampleTurretStats;
export const demoTurretTypeCatalogByTypeId = new Map<string, TurretTypeCatalogEntry>([
  [
    '92401',
    {
      typeId: '92401',
      typeInfo: {
        id: '92401',
        name: 'Heavy Turret',
        iconUrl: null,
      },
      isLoading: false,
      error: null,
    },
  ],
  [
    '92404',
    {
      typeId: '92404',
      typeInfo: {
        id: '92404',
        name: 'Light Turret',
        iconUrl: null,
      },
      isLoading: false,
      error: null,
    },
  ],
]);

export function getDemoCandidateNodeIds(turrets: TurretData[]): string[] {
  return turrets
    .map((turret) => turret.energySourceId)
    .filter((nodeId): nodeId is string => /^0x[a-fA-F0-9]{64}$/.test(nodeId));
}
