// @vitest-environment jsdom

import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { TurretIntelligenceSummary } from '@sentinel/shared-types';

import type { NetworkNodeView } from './useNetworkNodes';
import type { ResolvedTurretSolarSystem } from './useTurretSolarSystems';
import type { TurretTypeCatalogEntry } from './useTurretTypeCatalog';
import { useTurretFilters } from './useTurretFilters';

const TURRET_A = '0x1111111111111111111111111111111111111111111111111111111111111111';
const TURRET_B = '0x2222222222222222222222222222222222222222222222222222222222222222';

const solarSystemsByTurretId = new Map<string, ResolvedTurretSolarSystem>([
  [
    TURRET_A,
    {
      turretId: TURRET_A,
      solarSystemId: 30000004,
      solarSystemName: 'O3H-1FN',
      resolutionSource: 'node',
    },
  ],
  [
    TURRET_B,
    {
      turretId: TURRET_B,
      solarSystemId: null,
      solarSystemName: null,
      resolutionSource: 'none',
    },
  ],
]);

const nodes: NetworkNodeView[] = [
  {
    nodeId: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    solarSystemId: 30000004,
    solarSystemName: 'O3H-1FN',
    typeId: '92401',
    displayName: 'Node Prime',
  },
];

const turretIntelligenceByTurretId = new Map<string, TurretIntelligenceSummary>([
  [
    TURRET_A,
    {
      turretId: TURRET_A,
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
      statusOverride: 'ENGAGED',
      aggressorsPast24Hours: 0,
    },
  ],
  [
    TURRET_B,
    {
      turretId: TURRET_B,
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
      aggressorsPast24Hours: 0,
    },
  ],
]);

const turretTypeCatalogByTypeId = new Map<string, TurretTypeCatalogEntry>([
  [
    'turret.mk1',
    {
      typeId: 'turret.mk1',
      typeInfo: {
        id: '92404',
        name: 'Heavy Turret',
        iconUrl: null,
      },
      isLoading: false,
      error: null,
    },
  ],
  [
    'turret.mk2',
    {
      typeId: 'turret.mk2',
      typeInfo: {
        id: '92405',
        name: 'Light Turret',
        iconUrl: null,
      },
      isLoading: false,
      error: null,
    },
  ],
]);

const turrets = [
  {
    id: TURRET_A,
    itemId: '1001',
    name: 'Alpha Bastion',
    status: 'online' as const,
    isOnline: true,
    typeId: 'turret.mk1',
    energySourceId: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    aggressor: null,
  },
  {
    id: TURRET_B,
    itemId: '1002',
    name: 'Beta Bastion',
    status: 'offline' as const,
    isOnline: false,
    typeId: 'turret.mk2',
    energySourceId: 'orphaned',
    aggressor: null,
  },
];

describe('useTurretFilters', () => {
  it('filters by identity, location, status, class, and selected node', () => {
    const { result } = renderHook(() =>
      useTurretFilters({
        turrets,
        solarSystemsByTurretId,
        nodes,
        turretIntelligenceByTurretId,
        turretTypeCatalogByTypeId,
      }),
    );

    act(() => {
      result.current.setSearchText('alpha');
    });
    expect(result.current.filteredTurrets).toHaveLength(1);

    act(() => {
      result.current.clearSearchText();
      result.current.addSolarSystem('O3H-1FN');
    });
    expect(result.current.filteredTurrets.map((turret) => turret.id)).toEqual([TURRET_A]);

    act(() => {
      result.current.clearSolarSystems();
      result.current.setSelectedNetworkNode(
        '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      );
    });
    expect(result.current.filteredTurrets.map((turret) => turret.id)).toEqual([TURRET_A]);

    act(() => {
      result.current.clearSelectedNetworkNode();
      result.current.setStatus('engaged');
    });
    expect(result.current.filteredTurrets.map((turret) => turret.id)).toEqual([TURRET_A]);
    expect(result.current.state.statuses).toEqual(['engaged']);

    act(() => {
      result.current.clearStatus();
      result.current.setClassName('Heavy Turret');
    });
    expect(result.current.filteredTurrets.map((turret) => turret.id)).toEqual([TURRET_A]);
    expect(result.current.state.classNames).toEqual(['Heavy Turret']);
  });

  it('tracks active filters and clear-all behavior', () => {
    const { result } = renderHook(() =>
      useTurretFilters({
        turrets,
        solarSystemsByTurretId,
        nodes,
        turretIntelligenceByTurretId,
        turretTypeCatalogByTypeId,
      }),
    );

    act(() => {
      result.current.setSearchText('alpha');
      result.current.setClassName('Heavy Turret');
    });

    expect(result.current.hasActiveFilters).toBe(true);
    expect(result.current.filteredTurrets).toHaveLength(1);

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filteredTurrets).toHaveLength(2);
  });

  it('exposes fixed status options and class options from available turret classes', () => {
    const { result } = renderHook(() =>
      useTurretFilters({
        turrets,
        solarSystemsByTurretId,
        nodes,
        turretIntelligenceByTurretId,
        turretTypeCatalogByTypeId,
      }),
    );

    expect(result.current.statusOptions).toEqual([
      { value: 'online', label: 'ONLINE' },
      { value: 'offline', label: 'OFFLINE' },
      { value: 'engaged', label: 'ENGAGED' },
    ]);
    expect(result.current.classOptions).toEqual([
      { value: 'Heavy Turret', label: 'HEAVY TURRET' },
      { value: 'Light Turret', label: 'LIGHT TURRET' },
    ]);
  });

  it('treats all statuses and classes as selected by default and collapses back to all when every option is chosen', () => {
    const { result } = renderHook(() =>
      useTurretFilters({
        turrets,
        solarSystemsByTurretId,
        nodes,
        turretIntelligenceByTurretId,
        turretTypeCatalogByTypeId,
      }),
    );

    expect(result.current.state.statuses).toEqual([]);
    expect(result.current.state.classNames).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.setStatus('online');
      result.current.setClassName('Heavy Turret');
    });

    expect(result.current.state.statuses).toEqual(['online']);
    expect(result.current.state.classNames).toEqual(['Heavy Turret']);
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.setStatus('offline');
    });

    expect(result.current.state.statuses).toEqual(['online', 'offline']);

    act(() => {
      result.current.setStatus('engaged');
    });

    expect(result.current.state.statuses).toEqual([]);

    act(() => {
      result.current.setClassName('Light Turret');
    });

    expect(result.current.state.classNames).toEqual([]);

    act(() => {
      result.current.setStatus(null);
      result.current.setClassName(null);
    });

    expect(result.current.state.statuses).toEqual([]);
    expect(result.current.state.classNames).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it('filters by multiple selected solar systems and ignores the picker query until a system is selected', () => {
    const { result } = renderHook(() =>
      useTurretFilters({
        turrets,
        solarSystemsByTurretId,
        nodes,
        turretIntelligenceByTurretId,
        turretTypeCatalogByTypeId,
      }),
    );

    act(() => {
      result.current.setSolarSystemQuery('O3H');
    });

    expect(result.current.filteredTurrets).toHaveLength(2);
    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.addSolarSystem('O3H-1FN');
    });

    expect(result.current.state.solarSystems).toEqual(['O3H-1FN']);
    expect(result.current.state.solarSystemQuery).toBe('');
    expect(result.current.filteredTurrets.map((turret) => turret.id)).toEqual([TURRET_A]);
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.addSolarSystem('Unassigned');
    });

    expect(result.current.state.solarSystems).toEqual(['O3H-1FN', 'Unassigned']);
    expect(result.current.filteredTurrets.map((turret) => turret.id)).toEqual([TURRET_A, TURRET_B]);

    act(() => {
      result.current.removeSolarSystem('O3H-1FN');
    });

    expect(result.current.state.solarSystems).toEqual(['Unassigned']);
    expect(result.current.filteredTurrets.map((turret) => turret.id)).toEqual([TURRET_B]);
  });
});
