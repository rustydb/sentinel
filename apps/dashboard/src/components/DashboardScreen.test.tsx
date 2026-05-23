// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { DashboardBuildInfo } from '../buildInfo';
import { DashboardScreen } from './DashboardScreen';
import { installResizeObserverMock } from '../test-utils/resizeObserver';

const hooks = vi.hoisted(() => ({
  useTypeInfo: vi.fn(),
}));

vi.mock('../hooks/useTypeInfo', () => ({
  useTypeInfo: hooks.useTypeInfo,
}));

describe('DashboardScreen', () => {
  const buildInfo: DashboardBuildInfo = {
    version: '0.2.0',
    commitHash: 'a1b2c3d',
    dirty: true,
    href: 'https://github.com/rustydb/sentinel/commit/a1b2c3d',
    linkLabel: 'Open the GitHub commit for dashboard build a1b2c3d',
  };

  beforeEach(() => {
    installResizeObserverMock();
    hooks.useTypeInfo.mockReturnValue({
      typeInfo: {
        id: '92401',
        name: 'Heavy Turret',
        iconUrl: 'https://assets.example.com/heavy-turret.png',
      },
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders the authenticated shell with logo, search controls, and metrics', () => {
    render(
      <DashboardScreen
        turrets={[
          {
            id: '0x1111111111111111111111111111111111111111111111111111111111111111',
            itemId: '42',
            name: 'Alpha Bastion',
            status: 'online',
            isOnline: true,
            typeId: '92401',
            energySourceId: 'orphaned',
          },
        ]}
        loading={false}
        error={null}
        characterName="Captain Rusty"
        walletAddress="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        onDisconnect={vi.fn()}
        selectedTurret={null}
        onSelectTurret={vi.fn()}
        onCloseTurret={vi.fn()}
        nodes={[]}
        drawerLoading={false}
        eventsState={{
          events: [],
          loading: false,
          error: null,
          page: 1,
          nextPage: null,
          next: vi.fn(),
          reset: vi.fn(),
        }}
        solarSystemsByTurretId={new Map()}
        turretIntelligenceByTurretId={new Map()}
        stats={{
          totalTurrets: 1,
          engagedTurrets: 0,
          onlineTurrets: 1,
          offlineTurrets: 0,
          aggressorsPast24Hours: 0,
        }}
        buildInfo={buildInfo}
        onAssignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onUnassignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onResetEvents={vi.fn()}
      />,
    );

    expect(screen.getByAltText(/sentinel logo/i)).toBeTruthy();
    expect(screen.getByRole('textbox', { name: /search turrets/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /advanced search options/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /collapse metrics/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /collapse metrics/i })).toBeTruthy();
    expect(screen.getByRole('link', { name: buildInfo.linkLabel }).getAttribute('href')).toBe(
      buildInfo.href,
    );
    expect(screen.getByText('v0.2.0 (a1b2c3d-dirty)')).toBeTruthy();
  });

  it('collapses the metrics panel by default on mobile screens', () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(768);

    render(
      <DashboardScreen
        turrets={[
          {
            id: '0x1111111111111111111111111111111111111111111111111111111111111111',
            itemId: '42',
            name: 'Alpha Bastion',
            status: 'online',
            isOnline: true,
            typeId: '92401',
            energySourceId: 'orphaned',
          },
        ]}
        loading={false}
        error={null}
        characterName="Captain Rusty"
        walletAddress="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        onDisconnect={vi.fn()}
        selectedTurret={null}
        onSelectTurret={vi.fn()}
        onCloseTurret={vi.fn()}
        nodes={[]}
        drawerLoading={false}
        eventsState={{
          events: [],
          loading: false,
          error: null,
          page: 1,
          nextPage: null,
          next: vi.fn(),
          reset: vi.fn(),
        }}
        solarSystemsByTurretId={new Map()}
        turretIntelligenceByTurretId={new Map()}
        stats={{
          totalTurrets: 1,
          engagedTurrets: 0,
          onlineTurrets: 1,
          offlineTurrets: 0,
          aggressorsPast24Hours: 0,
        }}
        onAssignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onUnassignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onResetEvents={vi.fn()}
      />,
    );

    expect(screen.queryByTestId('statistics-panel')).toBeNull();
    expect(screen.getByRole('button', { name: /expand metrics/i })).toBeTruthy();
  });

  it('adds bottom clearance while the turret detail panel is open', () => {
    const turret = {
      id: '0x1111111111111111111111111111111111111111111111111111111111111111',
      itemId: '42',
      name: 'Alpha Bastion',
      status: 'online' as const,
      isOnline: true,
      typeId: '92401',
      energySourceId: 'orphaned',
    };

    const { container } = render(
      <DashboardScreen
        turrets={[turret]}
        loading={false}
        error={null}
        characterName="Captain Rusty"
        walletAddress="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        onDisconnect={vi.fn()}
        selectedTurret={turret}
        onSelectTurret={vi.fn()}
        onCloseTurret={vi.fn()}
        nodes={[]}
        drawerLoading={false}
        eventsState={{
          events: [],
          loading: false,
          error: null,
          page: 1,
          nextPage: null,
          next: vi.fn(),
          reset: vi.fn(),
        }}
        solarSystemsByTurretId={new Map()}
        turretIntelligenceByTurretId={new Map()}
        stats={{
          totalTurrets: 1,
          engagedTurrets: 0,
          onlineTurrets: 1,
          offlineTurrets: 0,
          aggressorsPast24Hours: 0,
        }}
        onAssignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onUnassignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onResetEvents={vi.fn()}
      />,
    );

    expect(container.querySelector('main')?.getAttribute('style')).toContain(
      'padding-bottom: 640px',
    );
  });

  it('lets the user collapse and re-open the metrics panel', () => {
    render(
      <DashboardScreen
        turrets={[
          {
            id: '0x1111111111111111111111111111111111111111111111111111111111111111',
            itemId: '42',
            name: 'Alpha Bastion',
            status: 'online',
            isOnline: true,
            typeId: '92401',
            energySourceId: 'orphaned',
          },
        ]}
        loading={false}
        error={null}
        characterName="Captain Rusty"
        walletAddress="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        onDisconnect={vi.fn()}
        selectedTurret={null}
        onSelectTurret={vi.fn()}
        onCloseTurret={vi.fn()}
        nodes={[]}
        drawerLoading={false}
        eventsState={{
          events: [],
          loading: false,
          error: null,
          page: 1,
          nextPage: null,
          next: vi.fn(),
          reset: vi.fn(),
        }}
        solarSystemsByTurretId={new Map()}
        turretIntelligenceByTurretId={new Map()}
        stats={{
          totalTurrets: 1,
          engagedTurrets: 0,
          onlineTurrets: 1,
          offlineTurrets: 0,
          aggressorsPast24Hours: 0,
        }}
        onAssignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onUnassignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onResetEvents={vi.fn()}
      />,
    );

    expect(screen.getByTestId('statistics-panel')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /collapse metrics/i }));
    expect(screen.queryByTestId('statistics-panel')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /expand metrics/i }));
    expect(screen.getByTestId('statistics-panel')).toBeTruthy();
  });

  it('scrolls the selected turret card into the safe viewport when the detail panel opens', () => {
    const turret = {
      id: '0x1111111111111111111111111111111111111111111111111111111111111111',
      itemId: '42',
      name: 'Alpha Bastion',
      status: 'online' as const,
      isOnline: true,
      typeId: '92401',
      energySourceId: 'orphaned',
    };
    const scrollByMock = vi.fn();

    vi.stubGlobal('scrollBy', scrollByMock);
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(900);

    const originalGetBoundingClientRect = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      'getBoundingClientRect',
    )?.value as (this: HTMLElement) => DOMRect;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (this.dataset.testid === `turret-card-${turret.id}`) {
        return {
          x: 0,
          y: 700,
          top: 700,
          left: 0,
          width: 600,
          height: 180,
          right: 600,
          bottom: 880,
          toJSON: () => ({}),
        };
      }

      if (this.dataset.testid === 'turret-detail') {
        return {
          x: 0,
          y: 520,
          top: 520,
          left: 0,
          width: 1200,
          height: 320,
          right: 1200,
          bottom: 840,
          toJSON: () => ({}),
        };
      }

      if (this.tagName === 'HEADER') {
        return {
          x: 0,
          y: 16,
          top: 16,
          left: 0,
          width: 1200,
          height: 180,
          right: 1200,
          bottom: 196,
          toJSON: () => ({}),
        };
      }

      return Reflect.apply(originalGetBoundingClientRect, this, []);
    });

    render(
      <DashboardScreen
        turrets={[turret]}
        loading={false}
        error={null}
        characterName="Captain Rusty"
        walletAddress="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        onDisconnect={vi.fn()}
        selectedTurret={turret}
        onSelectTurret={vi.fn()}
        onCloseTurret={vi.fn()}
        nodes={[]}
        drawerLoading={false}
        eventsState={{
          events: [],
          loading: false,
          error: null,
          page: 1,
          nextPage: null,
          next: vi.fn(),
          reset: vi.fn(),
        }}
        solarSystemsByTurretId={new Map()}
        turretIntelligenceByTurretId={new Map()}
        stats={{
          totalTurrets: 1,
          engagedTurrets: 0,
          onlineTurrets: 1,
          offlineTurrets: 0,
          aggressorsPast24Hours: 0,
        }}
        onAssignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onUnassignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onResetEvents={vi.fn()}
      />,
    );

    expect(scrollByMock).toHaveBeenCalled();
  });

  it('keeps the detail panel anchored when the selected turret snapshot refreshes with the same id', () => {
    const initialTurret = {
      id: '0x1111111111111111111111111111111111111111111111111111111111111111',
      itemId: '42',
      name: 'Alpha Bastion',
      status: 'online' as const,
      isOnline: true,
      typeId: '92401',
      energySourceId: 'orphaned',
    };
    const refreshedTurret = {
      ...initialTurret,
      name: 'Alpha Bastion II',
      status: 'offline' as const,
      isOnline: false,
    };

    const { rerender } = render(
      <DashboardScreen
        turrets={[initialTurret]}
        loading={false}
        error={null}
        characterName="Captain Rusty"
        walletAddress="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        onDisconnect={vi.fn()}
        selectedTurret={initialTurret}
        onSelectTurret={vi.fn()}
        onCloseTurret={vi.fn()}
        nodes={[]}
        drawerLoading={false}
        eventsState={{
          events: [],
          loading: false,
          error: null,
          page: 1,
          nextPage: null,
          next: vi.fn(),
          reset: vi.fn(),
        }}
        solarSystemsByTurretId={new Map()}
        turretIntelligenceByTurretId={new Map()}
        stats={{
          totalTurrets: 1,
          engagedTurrets: 0,
          onlineTurrets: 1,
          offlineTurrets: 0,
          aggressorsPast24Hours: 0,
        }}
        onAssignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onUnassignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onResetEvents={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: /alpha bastion/i })).toBeTruthy();

    rerender(
      <DashboardScreen
        turrets={[refreshedTurret]}
        loading={false}
        error={null}
        characterName="Captain Rusty"
        walletAddress="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        onDisconnect={vi.fn()}
        selectedTurret={refreshedTurret}
        onSelectTurret={vi.fn()}
        onCloseTurret={vi.fn()}
        nodes={[]}
        drawerLoading={false}
        eventsState={{
          events: [],
          loading: false,
          error: null,
          page: 1,
          nextPage: null,
          next: vi.fn(),
          reset: vi.fn(),
        }}
        solarSystemsByTurretId={new Map()}
        turretIntelligenceByTurretId={new Map()}
        stats={{
          totalTurrets: 1,
          engagedTurrets: 0,
          onlineTurrets: 1,
          offlineTurrets: 0,
          aggressorsPast24Hours: 0,
        }}
        onAssignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onUnassignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onResetEvents={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { level: 2, name: /alpha bastion ii/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /dismiss turret detail/i })).toBeTruthy();
  });

  it('shows a friendly no-results message when filters remove every turret', () => {
    render(
      <DashboardScreen
        turrets={[]}
        totalTurrets={1}
        loading={false}
        error={null}
        characterName="Captain Rusty"
        walletAddress="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        onDisconnect={vi.fn()}
        selectedTurret={null}
        onSelectTurret={vi.fn()}
        onCloseTurret={vi.fn()}
        nodes={[]}
        drawerLoading={false}
        eventsState={{
          events: [],
          loading: false,
          error: null,
          page: 1,
          nextPage: null,
          next: vi.fn(),
          reset: vi.fn(),
        }}
        solarSystemsByTurretId={new Map()}
        turretIntelligenceByTurretId={new Map()}
        stats={{
          totalTurrets: 1,
          engagedTurrets: 0,
          onlineTurrets: 1,
          offlineTurrets: 0,
          aggressorsPast24Hours: 0,
        }}
        onAssignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onUnassignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onResetEvents={vi.fn()}
        filters={{
          searchText: 'alpha',
          solarSystemQuery: '',
          solarSystems: [],
          selectedNetworkNodeId: null,
          statuses: [],
          classNames: [],
        }}
        hasActiveFilters
        statusOptions={[]}
        classOptions={[]}
        onSearchTextChange={vi.fn()}
        onSolarSystemQueryChange={vi.fn()}
        onAddSolarSystem={vi.fn()}
        onRemoveSolarSystem={vi.fn()}
        onStatusChange={vi.fn()}
        onClassNameChange={vi.fn()}
        onSelectedNetworkNodeChange={vi.fn()}
        onClearAllFilters={vi.fn()}
      />,
    );

    expect(screen.getByText(/no turrets match the current criteria/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /clear all filters/i })).toBeTruthy();
  });

  it('keeps a hidden selected turret explicit when filters exclude it', () => {
    const turret = {
      id: '0x1111111111111111111111111111111111111111111111111111111111111111',
      itemId: '42',
      name: 'Alpha Bastion',
      status: 'online' as const,
      isOnline: true,
      typeId: '92401',
      energySourceId: 'orphaned',
    };

    render(
      <DashboardScreen
        turrets={[]}
        totalTurrets={1}
        loading={false}
        error={null}
        characterName="Captain Rusty"
        walletAddress="0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        onDisconnect={vi.fn()}
        selectedTurret={turret}
        onSelectTurret={vi.fn()}
        onCloseTurret={vi.fn()}
        nodes={[]}
        drawerLoading={false}
        eventsState={{
          events: [],
          loading: false,
          error: null,
          page: 1,
          nextPage: null,
          next: vi.fn(),
          reset: vi.fn(),
        }}
        solarSystemsByTurretId={new Map()}
        turretIntelligenceByTurretId={new Map()}
        stats={{
          totalTurrets: 1,
          engagedTurrets: 0,
          onlineTurrets: 1,
          offlineTurrets: 0,
          aggressorsPast24Hours: 0,
        }}
        onAssignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onUnassignSolarSystem={vi.fn().mockResolvedValue(undefined)}
        onResetEvents={vi.fn()}
        filters={{
          searchText: 'beta',
          solarSystemQuery: '',
          solarSystems: [],
          selectedNetworkNodeId: null,
          statuses: [],
          classNames: [],
        }}
        hasActiveFilters
        statusOptions={[]}
        classOptions={[]}
        onSearchTextChange={vi.fn()}
        onSolarSystemQueryChange={vi.fn()}
        onAddSolarSystem={vi.fn()}
        onRemoveSolarSystem={vi.fn()}
        onStatusChange={vi.fn()}
        onClassNameChange={vi.fn()}
        onSelectedNetworkNodeChange={vi.fn()}
        onClearAllFilters={vi.fn()}
      />,
    );

    expect(screen.getByText(/selected turret is hidden by the current filters/i)).toBeTruthy();
  });
});
