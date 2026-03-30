import type { TurretData, TurretIntelligenceSummary } from '@frontier-sentinel/shared-types';
import { useMemo, useState } from 'react';

import type { NetworkNodeView } from './useNetworkNodes';
import type { ResolvedTurretSolarSystem } from './useTurretSolarSystems';
import type { TurretTypeCatalogEntry } from './useTurretTypeCatalog';

export type DisplayTurretStatus = 'online' | 'offline' | 'engaged';

export interface TurretFilterState {
  searchText: string;
  solarSystemQuery: string;
  solarSystems: string[];
  selectedNetworkNodeId: string | null;
  statuses: DisplayTurretStatus[];
  classNames: string[];
}

export interface TurretFilterOption {
  value: string;
  label: string;
}

interface UseTurretFiltersOptions {
  turrets: TurretData[];
  solarSystemsByTurretId: Map<string, ResolvedTurretSolarSystem>;
  nodes: NetworkNodeView[];
  turretIntelligenceByTurretId: Map<string, TurretIntelligenceSummary>;
  turretTypeCatalogByTypeId: Map<string, TurretTypeCatalogEntry>;
}

interface TurretFilterController {
  state: TurretFilterState;
  setSearchText: (value: string) => void;
  setSolarSystemQuery: (value: string) => void;
  addSolarSystem: (value: string) => void;
  removeSolarSystem: (value: string) => void;
  setSelectedNetworkNode: (nodeId: string | null) => void;
  setStatus: (value: DisplayTurretStatus | null) => void;
  setClassName: (value: string | null) => void;
  clearSearchText: () => void;
  clearSolarSystemQuery: () => void;
  clearSolarSystems: () => void;
  clearSelectedNetworkNode: () => void;
  clearStatus: () => void;
  clearClassName: () => void;
  clearAll: () => void;
  filteredTurrets: TurretData[];
  hasActiveFilters: boolean;
  statusOptions: TurretFilterOption[];
  classOptions: TurretFilterOption[];
  selectedNetworkNode: NetworkNodeView | null;
}

const DEFAULT_FILTER_STATE: TurretFilterState = {
  searchText: '',
  solarSystemQuery: '',
  solarSystems: [],
  selectedNetworkNodeId: null,
  statuses: [],
  classNames: [],
};

function normalize(input: string): string {
  return input.trim().toLowerCase();
}

function includesNormalized(source: string, query: string): boolean {
  return normalize(source).includes(normalize(query));
}

function appendUniqueNormalized(values: string[], nextValue: string): string[] {
  const trimmedValue = nextValue.trim();
  if (!trimmedValue) {
    return values;
  }

  if (values.some((value) => normalize(value) === normalize(trimmedValue))) {
    return values;
  }

  return [...values, trimmedValue];
}

function toggleFilterSelection<T extends string>(
  currentValues: T[],
  nextValue: T | null,
  allValues: readonly T[],
): T[] {
  if (nextValue === null) {
    return [];
  }

  if (currentValues.length === 0) {
    return allValues.length === 1 ? [] : [nextValue];
  }

  const nextValues = currentValues.includes(nextValue)
    ? currentValues.filter((value) => value !== nextValue)
    : [...currentValues, nextValue];

  if (nextValues.length === 0 || nextValues.length === allValues.length) {
    return [];
  }

  return allValues.filter((value) => nextValues.includes(value));
}

export function readTurretStatus(
  turret: TurretData,
  turretIntelligenceByTurretId: Map<string, TurretIntelligenceSummary>,
): DisplayTurretStatus {
  const intelligence = turretIntelligenceByTurretId.get(turret.id);
  if (intelligence?.statusOverride === 'ENGAGED') {
    return 'engaged';
  }

  return turret.status === 'online' ? 'online' : 'offline';
}

function readTurretClassLabel(
  turret: TurretData,
  turretTypeCatalogByTypeId: Map<string, TurretTypeCatalogEntry>,
): string {
  const entry = turretTypeCatalogByTypeId.get(turret.typeId);
  if (!entry) {
    return 'LOADING ...';
  }

  if (entry.isLoading) {
    return 'LOADING ...';
  }

  if (entry.error) {
    return 'ERROR!';
  }

  return entry.typeInfo?.name?.trim() || turret.typeId;
}

function readTurretSolarSystemLabel(
  turret: TurretData,
  solarSystemsByTurretId: Map<string, ResolvedTurretSolarSystem>,
): string {
  const resolved = solarSystemsByTurretId.get(turret.id);
  if (!resolved || resolved.solarSystemId === null) {
    return 'Unassigned';
  }

  return resolved.solarSystemName ?? String(resolved.solarSystemId);
}

export function useTurretFilters({
  turrets,
  solarSystemsByTurretId,
  nodes,
  turretIntelligenceByTurretId,
  turretTypeCatalogByTypeId,
}: UseTurretFiltersOptions): TurretFilterController {
  const [state, setState] = useState<TurretFilterState>(DEFAULT_FILTER_STATE);

  const nodesById = useMemo(
    () => new Map(nodes.map((node) => [node.nodeId, node] as const)),
    [nodes],
  );
  const selectedNetworkNode =
    state.selectedNetworkNodeId != null
      ? (nodesById.get(state.selectedNetworkNodeId) ?? null)
      : null;

  const filteredTurrets = useMemo(() => {
    const searchText = normalize(state.searchText);

    return turrets.filter((turret) => {
      const displayStatus = readTurretStatus(turret, turretIntelligenceByTurretId);
      const solarSystemLabel = readTurretSolarSystemLabel(turret, solarSystemsByTurretId);
      const classLabel = readTurretClassLabel(turret, turretTypeCatalogByTypeId);
      const matchesSearchText =
        searchText.length === 0 ||
        includesNormalized(turret.id, searchText) ||
        includesNormalized(turret.name ?? '', searchText) ||
        includesNormalized(turret.itemId, searchText);
      const matchesSolarSystem =
        state.solarSystems.length === 0 ||
        state.solarSystems.some(
          (solarSystem) =>
            includesNormalized(solarSystemLabel, solarSystem) ||
            includesNormalized(
              solarSystemsByTurretId.get(turret.id)?.solarSystemId?.toString() ?? '',
              solarSystem,
            ),
        );
      const matchesNetworkNode =
        state.selectedNetworkNodeId === null
          ? true
          : turret.energySourceId === state.selectedNetworkNodeId;
      const matchesStatus =
        state.statuses.length === 0 ? true : state.statuses.includes(displayStatus);
      const matchesClass =
        state.classNames.length === 0 ? true : state.classNames.includes(classLabel);

      return (
        matchesSearchText &&
        matchesSolarSystem &&
        matchesNetworkNode &&
        matchesStatus &&
        matchesClass
      );
    });
  }, [
    solarSystemsByTurretId,
    state.classNames,
    state.searchText,
    state.selectedNetworkNodeId,
    state.solarSystems,
    state.statuses,
    turretIntelligenceByTurretId,
    turretTypeCatalogByTypeId,
    turrets,
  ]);

  const statusOptions = useMemo(
    () =>
      (['online', 'offline', 'engaged'] as const).map((status) => ({
        value: status,
        label: status.toUpperCase(),
      })),
    [],
  );

  const classOptions = useMemo(() => {
    const availableClasses = new Set<string>();
    for (const turret of turrets) {
      const classLabel = readTurretClassLabel(turret, turretTypeCatalogByTypeId);
      if (classLabel !== 'LOADING ...' && classLabel !== 'ERROR!') {
        availableClasses.add(classLabel);
      }
    }

    return [...availableClasses]
      .sort((left, right) => left.localeCompare(right))
      .map((className) => ({
        value: className,
        label: className.toUpperCase(),
      }));
  }, [turretTypeCatalogByTypeId, turrets]);

  const hasActiveFilters =
    state.searchText.trim().length > 0 ||
    state.solarSystems.length > 0 ||
    state.selectedNetworkNodeId !== null ||
    state.statuses.length > 0 ||
    state.classNames.length > 0;

  return {
    state,
    setSearchText: (searchText) => setState((current) => ({ ...current, searchText })),
    setSolarSystemQuery: (solarSystemQuery) =>
      setState((current) => ({ ...current, solarSystemQuery })),
    addSolarSystem: (solarSystem) =>
      setState((current) => ({
        ...current,
        solarSystems: appendUniqueNormalized(current.solarSystems, solarSystem),
        solarSystemQuery: '',
      })),
    removeSolarSystem: (solarSystem) =>
      setState((current) => ({
        ...current,
        solarSystems: current.solarSystems.filter(
          (value) => normalize(value) !== normalize(solarSystem),
        ),
      })),
    setSelectedNetworkNode: (selectedNetworkNodeId) =>
      setState((current) => ({ ...current, selectedNetworkNodeId })),
    setStatus: (status) =>
      setState((current) => ({
        ...current,
        statuses: toggleFilterSelection(current.statuses, status, ['online', 'offline', 'engaged']),
      })),
    setClassName: (className) =>
      setState((current) => ({
        ...current,
        classNames: toggleFilterSelection(
          current.classNames,
          className,
          classOptions.map((option) => option.value),
        ),
      })),
    clearSearchText: () => setState((current) => ({ ...current, searchText: '' })),
    clearSolarSystemQuery: () => setState((current) => ({ ...current, solarSystemQuery: '' })),
    clearSolarSystems: () => setState((current) => ({ ...current, solarSystems: [] })),
    clearSelectedNetworkNode: () =>
      setState((current) => ({ ...current, selectedNetworkNodeId: null })),
    clearStatus: () => setState((current) => ({ ...current, statuses: [] })),
    clearClassName: () => setState((current) => ({ ...current, classNames: [] })),
    clearAll: () => setState(DEFAULT_FILTER_STATE),
    filteredTurrets,
    hasActiveFilters,
    statusOptions,
    classOptions,
    selectedNetworkNode,
  };
}
