import { describe, expect, it } from 'vitest';

import {
  GET_CHARACTER_AND_OWNED_OBJECTS,
  GET_TURRET_EVENTS,
  TURRET_STATUSES,
  isTurretData,
  toTurretStatus,
} from './index';

describe('shared-types', () => {
  it('exports the expected GraphQL contracts', () => {
    expect(GET_CHARACTER_AND_OWNED_OBJECTS).toContain('query GetCharacterAndOwnedObjects');
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
});
