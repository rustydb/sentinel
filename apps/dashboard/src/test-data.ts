import type { NetworkNodeMapping, TurretData, TurretEvent } from '@frontier-sentinel/shared-types';

export const sampleTurrets: TurretData[] = [
  {
    id: '0x4c5a81b8b7e928cbbd29c4e74aba4447f4cb9d81d52167d2644758061baf8914',
    itemId: '1000000021544',
    name: 'Alpha Bastion',
    status: 'online',
    locationHash: 'LMvNKnXexwKPj5wK+MCokil5EP6M4MAOqngAKw1Hed4=',
    isOnline: true,
    typeId: '92401',
    energySourceId: '0x0413288062cb50edd1629957cd566d841b49d88241c36b8dc46084ceb698486e',
    extension:
      '0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75::turret_ext::AutoDefense',
    aggressor: null,
  },
  {
    id: '0x06c29785207a87fba7795b940686efa9c5df0a67115ac0df258bb46c6529f37b',
    itemId: '1000000018041',
    status: 'offline',
    locationHash: 'yNaAVIxZS+xVpaEP7PSK+6DSPDQxcEfuIgbL6t/E14E=',
    isOnline: false,
    typeId: '92404',
    energySourceId: 'orphaned',
    extension: undefined,
    aggressor: null,
  },
];

export const sampleNodes: NetworkNodeMapping[] = [];

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
        { target_item_id: '700000001', priority_weight: '95' },
        { target_item_id: '700000014', priority_weight: '80' },
      ],
    },
    timestamp: '2026-03-26T12:05:00.000Z',
  },
  {
    txDigest: '0xccc',
    eventSeq: 3,
    checkpointSequenceNumber: 101,
    eventType: 'ExtensionAuthorizedEvent',
    jsonData: {
      assembly_id: '0x4c5a81b8b7e928cbbd29c4e74aba4447f4cb9d81d52167d2644758061baf8914',
      assembly_key: { tenant: 'utopia', item_id: '1000000021544' },
      extension_type:
        '0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75::turret_ext::AutoDefense',
      previous_extension: null,
      owner_cap_id: '0xowner-cap-alpha',
    },
    timestamp: '2026-03-26T12:06:00.000Z',
  },
];
