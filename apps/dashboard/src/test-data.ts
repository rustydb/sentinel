import type {
  NetworkNodeMapping,
  ShellStatisticsSnapshot,
  TurretData,
  TurretEvent,
  TurretIntelligenceSummary,
  TurretSolarSystemMapping,
} from '@sentinel/shared-types';

export interface DemoNetworkNode {
  nodeId: string;
  solarSystemId: number;
  solarSystemName: string;
  typeId: string;
  displayName: string;
}

export interface DemoResolvedTurretSolarSystem {
  turretId: string;
  solarSystemId: number | null;
  solarSystemName: string | null;
  resolutionSource: 'node' | 'retained' | 'none';
}

const ALPHA_NODE_ID = '0x0413288062cb50edd1629957cd566d841b49d88241c36b8dc46084ceb698486e';
const BETA_NODE_ID = '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd';

const ALPHA_TURRET_ID = '0x4c5a81b8b7e928cbbd29c4e74aba4447f4cb9d81d52167d2644758061baf8914';
const ORPHAN_TURRET_ID = '0x06c29785207a87fba7795b940686efa9c5df0a67115ac0df258bb46c6529f37b';
const BETA_TURRET_ID = '0x5555555555555555555555555555555555555555555555555555555555555555';
const GAMMA_TURRET_ID = '0x6666666666666666666666666666666666666666666666666666666666666666';

export const sampleTurrets: TurretData[] = [
  {
    id: ALPHA_TURRET_ID,
    itemId: '1000000021544',
    name: 'Alpha Bastion',
    status: 'online',
    locationHash: 'LMvNKnXexwKPj5wK+MCokil5EP6M4MAOqngAKw1Hed4=',
    isOnline: true,
    typeId: '92401',
    energySourceId: ALPHA_NODE_ID,
    extension:
      '0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75::turret_ext::AutoDefense',
    aggressor: null,
  },
  {
    id: ORPHAN_TURRET_ID,
    itemId: '1000000018041',
    status: 'offline',
    locationHash: 'yNaAVIxZS+xVpaEP7PSK+6DSPDQxcEfuIgbL6t/E14E=',
    isOnline: false,
    typeId: '92404',
    energySourceId: 'orphaned',
    extension: undefined,
    aggressor: null,
  },
  {
    id: BETA_TURRET_ID,
    itemId: '1000000032222',
    name: 'Beta Bastion',
    status: 'online',
    locationHash: 'V0l0aGluIHRoZSBiZWFjb24sIHRoZSBiYXN0aW9uIHN0aXJzLg==',
    isOnline: true,
    typeId: '92404',
    energySourceId: BETA_NODE_ID,
    extension: undefined,
    aggressor: null,
  },
  {
    id: GAMMA_TURRET_ID,
    itemId: '1000000032223',
    name: 'Gamma Bastion',
    status: 'offline',
    locationHash: 'VGVtcG9yYXJpbHkgbG9jYXRlZCBnYW1tYSBiYXN0aW9uLg==',
    isOnline: false,
    typeId: '92404',
    energySourceId: BETA_NODE_ID,
    extension: undefined,
    aggressor: null,
  },
];

export const sampleNodes: NetworkNodeMapping[] = [
  {
    nodeId: ALPHA_NODE_ID,
    solarSystemId: 30000016,
    solarSystemName: 'O60-F49',
  },
  {
    nodeId: BETA_NODE_ID,
    solarSystemId: 30000042,
    solarSystemName: 'EQ5-N6N',
  },
];

export const sampleNetworkNodes: DemoNetworkNode[] = [
  {
    nodeId: ALPHA_NODE_ID,
    solarSystemId: 30000016,
    solarSystemName: 'O60-F49',
    typeId: '92401',
    displayName: 'Network Node',
  },
  {
    nodeId: BETA_NODE_ID,
    solarSystemId: 30000042,
    solarSystemName: 'EQ5-N6N',
    typeId: '92401',
    displayName: 'Network Node',
  },
];

export const sampleRetainedTurretSolarSystems: TurretSolarSystemMapping[] = [
  {
    turretId: ORPHAN_TURRET_ID,
    solarSystemId: 30000036,
    solarSystemName: 'ELS-5C8',
    sourceNodeId: null,
  },
];

export const sampleResolvedTurretSolarSystems: DemoResolvedTurretSolarSystem[] = [
  {
    turretId: ALPHA_TURRET_ID,
    solarSystemId: 30000016,
    solarSystemName: 'O60-F49',
    resolutionSource: 'node',
  },
  {
    turretId: ORPHAN_TURRET_ID,
    solarSystemId: 30000036,
    solarSystemName: 'ELS-5C8',
    resolutionSource: 'retained',
  },
  {
    turretId: BETA_TURRET_ID,
    solarSystemId: 30000042,
    solarSystemName: 'EQ5-N6N',
    resolutionSource: 'node',
  },
  {
    turretId: GAMMA_TURRET_ID,
    solarSystemId: 30000042,
    solarSystemName: 'EQ5-N6N',
    resolutionSource: 'node',
  },
];

export const sampleEvents: TurretEvent[] = [
  {
    txDigest: '0xaaa',
    eventSeq: 1,
    checkpointSequenceNumber: 99,
    eventType: 'TurretCreatedEvent',
    jsonData: {
      turret_id: '0x4c5a81b8b7e928cbbd29c4e74aba4447f4cb9d81d52167d2644758061baf8914',
      turret_key: { tenant: 'utopia', item_id: '1000000021544' },
      type_id: '92401',
      owner_cap_id: '0xowner-cap-alpha',
    },
    timestamp: '2026-03-26T12:00:00.000Z',
  },
  {
    txDigest: '0xbbb',
    eventSeq: 2,
    checkpointSequenceNumber: 100,
    eventType: 'PriorityListUpdatedEvent',
    jsonData: {
      turret_id: '0x4c5a81b8b7e928cbbd29c4e74aba4447f4cb9d81d52167d2644758061baf8914',
      priority_list: [
        {
          target_item_id: '700000001',
          priority_weight: '95',
          character_id: '0x8f3a2c7d6e11b9a4d4f0c2a8d5b7e9f10a6c3d2b8f4e1a0c7d9b6e5f2a1c4d3e',
          character_name: 'The Slayer',
          character_tribe: 128,
          tribe_name: 'Vherokior',
          type_id: '12001',
          is_aggressor: true,
          behavior_change: 'STARTED_ATTACK',
        },
        { target_item_id: '700000014', priority_weight: '80' },
      ],
    },
    timestamp: '2026-03-26T12:05:00.000Z',
  },
  {
    txDigest: '0xddd',
    eventSeq: 4,
    checkpointSequenceNumber: 102,
    eventType: 'PriorityListUpdatedEvent',
    jsonData: {
      turret_id: '0x06c29785207a87fba7795b940686efa9c5df0a67115ac0df258bb46c6529f37b',
      priority_list: [
        {
          target_item_id: '700000022',
          priority_weight: '99',
          character_id: 0,
          type_id: '12099',
          is_aggressor: false,
          behavior_change: 'ENTERED',
        },
      ],
    },
    timestamp: '2026-03-26T12:07:00.000Z',
  },
  {
    txDigest: '0xeee',
    eventSeq: 5,
    checkpointSequenceNumber: 103,
    eventType: 'PriorityListUpdatedEvent',
    jsonData: {
      turret_id: BETA_TURRET_ID,
      priority_list: [
        {
          target_item_id: '700000031',
          priority_weight: '97',
          character_id: '0x2b7c9e1f4a6d8c0b3e5f7a9d1c4e6f8b0a2d4c6e8f1b3a5d7c9e0f2a4b6d8c1e',
          character_name: 'Commander Vale',
          character_tribe: 147,
          tribe_name: 'Sebiestor',
          type_id: '12015',
          is_aggressor: true,
          behavior_change: 'STARTED_ATTACK',
        },
      ],
    },
    timestamp: '2026-03-26T12:08:00.000Z',
  },
  {
    txDigest: '0xfff',
    eventSeq: 6,
    checkpointSequenceNumber: 104,
    eventType: 'PriorityListUpdatedEvent',
    jsonData: {
      turret_id: GAMMA_TURRET_ID,
      priority_list: [
        {
          target_item_id: '700000044',
          priority_weight: '88',
          character_id: 0,
          type_id: '12099',
          is_aggressor: false,
          behavior_change: 'ENTERED',
        },
      ],
    },
    timestamp: '2026-03-26T12:09:00.000Z',
  },
  {
    txDigest: '0xccc',
    eventSeq: 7,
    checkpointSequenceNumber: 105,
    eventType: 'ExtensionAuthorizedEvent',
    jsonData: {
      assembly_id: ALPHA_TURRET_ID,
      assembly_key: { tenant: 'utopia', item_id: '1000000021544' },
      extension_type:
        '0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75::turret_ext::AutoDefense',
      previous_extension: null,
      owner_cap_id: '0xowner-cap-alpha',
    },
    timestamp: '2026-03-26T12:06:00.000Z',
  },
];

export const sampleTurretIntelligence: TurretIntelligenceSummary[] = [
  {
    turretId: ALPHA_TURRET_ID,
    latestPriorityEvent: {
      txDigest: '0xbbb',
      eventSeq: 2,
      checkpointSequenceNumber: 100,
      timestamp: '2026-03-26T12:05:00.000Z',
    },
    targetItemId: '700000001',
    targetCharacterId: 41001,
    targetDisplayName: 'The Slayer',
    isNpc: false,
    tribeId: 128,
    tribeName: 'Vherokior',
    targetTypeId: '12001',
    isAggressor: true,
    behaviorChange: 'STARTED_ATTACK',
    statusOverride: 'ENGAGED',
    aggressorsPast24Hours: 3,
  },
  {
    turretId: ORPHAN_TURRET_ID,
    latestPriorityEvent: {
      txDigest: '0xddd',
      eventSeq: 4,
      checkpointSequenceNumber: 102,
      timestamp: '2026-03-26T12:07:00.000Z',
    },
    targetItemId: '700000022',
    targetCharacterId: 0,
    targetDisplayName: 'NPC',
    isNpc: true,
    tribeId: null,
    tribeName: null,
    targetTypeId: '12099',
    isAggressor: false,
    behaviorChange: 'ENTERED',
    statusOverride: null,
    aggressorsPast24Hours: 1,
  },
  {
    turretId: BETA_TURRET_ID,
    latestPriorityEvent: {
      txDigest: '0xeee',
      eventSeq: 5,
      checkpointSequenceNumber: 103,
      timestamp: '2026-03-26T12:08:00.000Z',
    },
    targetItemId: '700000031',
    targetCharacterId: 51234,
    targetDisplayName: 'Commander Vale',
    isNpc: false,
    tribeId: 147,
    tribeName: 'Sebiestor',
    targetTypeId: '12015',
    isAggressor: true,
    behaviorChange: 'STARTED_ATTACK',
    statusOverride: 'ENGAGED',
    aggressorsPast24Hours: 2,
  },
  {
    turretId: GAMMA_TURRET_ID,
    latestPriorityEvent: {
      txDigest: '0xfff',
      eventSeq: 6,
      checkpointSequenceNumber: 104,
      timestamp: '2026-03-26T12:09:00.000Z',
    },
    targetItemId: '700000044',
    targetCharacterId: 0,
    targetDisplayName: 'NPC',
    isNpc: true,
    tribeId: null,
    tribeName: null,
    targetTypeId: '12099',
    isAggressor: false,
    behaviorChange: 'ENTERED',
    statusOverride: null,
    aggressorsPast24Hours: 1,
  },
];

export const sampleTurretStats: ShellStatisticsSnapshot = {
  totalTurrets: 4,
  engagedTurrets: 2,
  onlineTurrets: 2,
  offlineTurrets: 2,
  aggressorsPast24Hours: 7,
};

export const sampleTurretFilterFixtures = [
  {
    label: 'identity',
    query: 'Alpha Bastion',
    expectedTurretIds: [ALPHA_TURRET_ID],
  },
  {
    label: 'solar-system',
    query: 'O60-F49',
    expectedTurretIds: [ALPHA_TURRET_ID],
  },
  {
    label: 'known-network-node',
    query: 'orphaned',
    expectedTurretIds: [ORPHAN_TURRET_ID],
  },
  {
    label: 'status',
    query: 'engaged',
    expectedTurretIds: [ALPHA_TURRET_ID, BETA_TURRET_ID],
  },
  {
    label: 'class',
    query: '92404',
    expectedTurretIds: [ORPHAN_TURRET_ID, BETA_TURRET_ID, GAMMA_TURRET_ID],
  },
] as const;
