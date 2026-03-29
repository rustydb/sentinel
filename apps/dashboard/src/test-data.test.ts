import { describe, expect, it } from 'vitest';

import {
  sampleEvents,
  sampleNodes,
  sampleRetainedTurretSolarSystems,
  sampleTurrets,
} from './test-data';

function isSuiAddress(value: string): boolean {
  return /^0x[a-f0-9]{64}$/i.test(value);
}

describe('test-data', () => {
  it('keeps demo turret and node identifiers aligned with responsive address expectations', () => {
    expect(sampleTurrets.every((turret) => isSuiAddress(turret.id))).toBe(true);
    expect(
      sampleTurrets.every(
        (turret) => turret.energySourceId === 'orphaned' || isSuiAddress(turret.energySourceId),
      ),
    ).toBe(true);
    expect(sampleNodes.every((node) => isSuiAddress(node.nodeId))).toBe(true);
  });

  it('keeps demo events aligned with the demo turret identifiers', () => {
    const firstTurretId = sampleTurrets[0]?.id;
    const eventTurretIds = sampleEvents
      .map((event) => event.jsonData)
      .flatMap((jsonData) => {
        const turretId = jsonData.turret_id;
        const assemblyId = jsonData.assembly_id;
        return [turretId, assemblyId].filter((value): value is string => typeof value === 'string');
      });

    expect(firstTurretId).toBeTruthy();
    expect(eventTurretIds).toContain(firstTurretId);
  });

  it('keeps retained solar-system mappings aligned with demo turret identifiers', () => {
    expect(
      sampleRetainedTurretSolarSystems.every((entry) =>
        sampleTurrets.some((turret) => turret.id === entry.turretId),
      ),
    ).toBe(true);
  });
});
