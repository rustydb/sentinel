import { describe, expect, it } from 'vitest';

import {
  GET_CHARACTER_AND_OWNED_OBJECTS,
  GET_OBJECTS_BY_IDS,
  GET_TURRET_EVENTS,
  TURRET_STATUSES,
  isTurretData,
  resolveSolarSystemName,
  searchSolarSystems,
  toTurretStatus,
} from './index';

describe('shared-types', () => {
  it('exports the expected GraphQL contracts', () => {
    expect(GET_CHARACTER_AND_OWNED_OBJECTS).toContain('query GetCharacterAndOwnedObjects');
    expect(GET_OBJECTS_BY_IDS).toContain('query GetObjectsByIds');
    expect(GET_TURRET_EVENTS).toContain('query GetTurretEvents');
  });

  it('validates turret data shapes', () => {
    expect(
      isTurretData({
        id: '0x1',
        itemId: '42',
        status: 'online',
        typeId: 'turret',
        energySourceId: 'node-1',
        isOnline: true,
      }),
    ).toBe(true);
    expect(isTurretData({ id: '0x1' })).toBe(false);
  });

  it('normalizes unknown statuses to offline', () => {
    expect(TURRET_STATUSES).toContain('online');
    expect(toTurretStatus('online')).toBe('online');
    expect(toTurretStatus('mystery')).toBe('offline');
  });

  it('searches and resolves solar systems by bundled catalog data', () => {
    expect(searchSolarSystems('jita', 'utopia', 5)).toEqual([]);
    expect(resolveSolarSystemName(31002477, 'utopia')).toBeNull();
  });
});
