import { describe, expect, it } from 'vitest';

import {
  sampleEvents,
  sampleNetworkNodes,
  sampleResolvedTurretSolarSystems,
  sampleNodes,
  sampleRetainedTurretSolarSystems,
  sampleTurretIntelligence,
  sampleTurretStats,
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

  it('keeps active node-backed solar-system fixtures aligned for demo map focus', () => {
    const activeTurrets = sampleTurrets.filter((turret) => turret.energySourceId !== 'orphaned');
    expect(activeTurrets).toHaveLength(3);

    expect(
      activeTurrets.every((turret) =>
        sampleNodes.some((node) => node.nodeId === turret.energySourceId),
      ),
    ).toBe(true);

    expect(
      sampleResolvedTurretSolarSystems.filter((entry) => entry.resolutionSource === 'node'),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          solarSystemId: 30000016,
          solarSystemName: 'O60-F49',
        }),
        expect.objectContaining({
          solarSystemId: 30000042,
          solarSystemName: 'EQ5-N6N',
        }),
      ]),
    );
  });

  it('keeps demo network-node cards aligned with node mappings', () => {
    expect(sampleNetworkNodes).toHaveLength(2);
    expect(sampleNetworkNodes.every((node) => node.displayName === 'Network Node')).toBe(true);
    expect(
      sampleNetworkNodes.every((node) =>
        sampleNodes.some(
          (mapping) =>
            mapping.nodeId === node.nodeId &&
            mapping.solarSystemId === node.solarSystemId &&
            mapping.solarSystemName === node.solarSystemName,
        ),
      ),
    ).toBe(true);
  });

  it('covers recent-target intelligence scenarios for both player and NPC contacts', () => {
    expect(sampleTurretIntelligence).toHaveLength(4);

    const captainRusty = sampleTurretIntelligence.find(
      (entry) => entry.latestPriorityEvent.txDigest === '0xbbb',
    );
    const orphanNpc = sampleTurretIntelligence.find(
      (entry) => entry.latestPriorityEvent.txDigest === '0xddd',
    );
    const commanderVale = sampleTurretIntelligence.find(
      (entry) => entry.latestPriorityEvent.txDigest === '0xeee',
    );
    const gammaNpc = sampleTurretIntelligence.find(
      (entry) => entry.latestPriorityEvent.txDigest === '0xfff',
    );

    expect(captainRusty).toMatchObject({
      targetDisplayName: 'Captain Rusty',
      isNpc: false,
      statusOverride: 'ENGAGED',
    });
    expect(orphanNpc).toMatchObject({
      targetDisplayName: 'NPC',
      isNpc: true,
      statusOverride: null,
    });
    expect(commanderVale).toMatchObject({
      targetDisplayName: 'Commander Vale',
      isNpc: false,
      statusOverride: 'ENGAGED',
    });
    expect(gammaNpc).toMatchObject({
      targetDisplayName: 'NPC',
      isNpc: true,
      statusOverride: null,
    });
  });

  it('keeps demo statistics aligned with the current threat summary fixtures', () => {
    expect(sampleTurretStats).toEqual({
      totalTurrets: 4,
      engagedTurrets: 2,
      onlineTurrets: 2,
      offlineTurrets: 2,
      aggressorsPast24Hours: 7,
    });
  });
});
