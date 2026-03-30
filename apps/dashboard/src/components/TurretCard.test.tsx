import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TurretCard } from './TurretCard';
import { emitResizeForAll, installResizeObserverMock } from '../test-utils/resizeObserver';

const hooks = vi.hoisted(() => ({
  useTypeInfo: vi.fn(),
}));

vi.mock('../hooks/useTypeInfo', () => ({
  useTypeInfo: hooks.useTypeInfo,
}));

const NODE_ADDRESS = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const TURRET_ADDRESS = '0x2222222222222222222222222222222222222222222222222222222222222222';

describe('TurretCard', () => {
  beforeEach(() => {
    installResizeObserverMock();
    hooks.useTypeInfo.mockReturnValue({
      typeInfo: {
        id: '92404',
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

  it('renders turret state and orphaned indicator', () => {
    render(
      <TurretCard
        intelligence={{
          turretId: '0x1111111111111111111111111111111111111111111111111111111111111111',
          latestPriorityEvent: null,
          targetItemId: null,
          targetCharacterId: null,
          targetDisplayName: 'NPC',
          isNpc: true,
          tribeId: null,
          tribeName: null,
          targetTypeId: null,
          isAggressor: null,
          behaviorChange: null,
          statusOverride: null,
          aggressorsPast24Hours: 0,
        }}
        turret={{
          id: '0x1111111111111111111111111111111111111111111111111111111111111111',
          itemId: '42',
          name: 'Raven Gate',
          status: 'offline',
          locationHash: 'J101',
          isOnline: false,
          typeId: 'turret.mk1',
          energySourceId: 'orphaned',
          aggressor: null,
        }}
      />,
    );

    expect(screen.getByText('RAVEN GATE')).toBeTruthy();
    expect(screen.getByText('Class:')).toBeTruthy();
    expect(screen.getAllByText('Heavy Turret').length).toBeGreaterThan(0);
    expect(screen.getByAltText(/heavy turret icon/i)).toBeTruthy();
    expect(screen.getByText('Status:')).toBeTruthy();
    expect(screen.getByText('offline')).toBeTruthy();
    expect(screen.getByText('Network Node')).toBeTruthy();
    expect(screen.getByText('Recent Target')).toBeTruthy();
    expect(screen.getByText('NPC')).toBeTruthy();
    expect(screen.getByText(/orphaned node assignment/i)).toBeTruthy();
  });

  it('shows the solar system field as unassigned when no mapping exists', () => {
    render(
      <TurretCard
        turret={{
          id: TURRET_ADDRESS,
          itemId: '43',
          name: 'Nova Wall',
          status: 'online',
          locationHash: 'J102',
          isOnline: true,
          typeId: 'turret.mk2',
          energySourceId: NODE_ADDRESS,
          aggressor: 'Sleepers',
        }}
      />,
    );

    expect(screen.getByText('Solar System')).toBeTruthy();
    expect(screen.getByText('Unassigned')).toBeTruthy();
  });

  it('renders the resolved solar-system friendly name when available', () => {
    render(
      <TurretCard
        intelligence={{
          turretId: TURRET_ADDRESS,
          latestPriorityEvent: null,
          targetItemId: null,
          targetCharacterId: null,
          targetDisplayName: 'Captain Rusty',
          isNpc: false,
          tribeId: null,
          tribeName: null,
          targetTypeId: null,
          isAggressor: true,
          behaviorChange: 'STARTED_ATTACK',
          statusOverride: 'ENGAGED',
          aggressorsPast24Hours: 3,
        }}
        turret={{
          id: TURRET_ADDRESS,
          itemId: '43',
          name: 'Nova Wall',
          status: 'online',
          locationHash: 'J102',
          isOnline: true,
          typeId: 'turret.mk2',
          energySourceId: NODE_ADDRESS,
          aggressor: 'Sleepers',
        }}
        solarSystem={{
          turretId: TURRET_ADDRESS,
          solarSystemId: 30000004,
          solarSystemName: 'O3H-1FN',
          resolutionSource: 'node',
        }}
      />,
    );

    expect(screen.getByText('O3H-1FN')).toBeTruthy();
    expect(screen.getByText('NOVA WALL')).toBeTruthy();
    expect(screen.getByText('Class:')).toBeTruthy();
    expect(screen.getByText('Heavy Turret')).toBeTruthy();
    expect(screen.getByText('engaged')).toBeTruthy();
    expect(screen.getByText('Aggressors 24H')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('falls back to the turret id in the title when there is no custom name', async () => {
    render(
      <TurretCard
        turret={{
          id: TURRET_ADDRESS,
          itemId: '43',
          name: null,
          status: 'online',
          locationHash: 'J102',
          isOnline: true,
          typeId: 'turret.mk2',
          energySourceId: NODE_ADDRESS,
          aggressor: 'Sleepers',
        }}
      />,
    );

    emitResizeForAll(220);

    await waitFor(() => {
      expect(screen.getByRole('heading').textContent).not.toBe(TURRET_ADDRESS);
      expect(screen.getByRole('heading').textContent).toContain('...');
    });
    expect(screen.getByText('Class:')).toBeTruthy();
    expect(screen.getByText('Heavy Turret')).toBeTruthy();
  });

  it('uses a centered cover fit for the turret icon image', () => {
    render(
      <TurretCard
        turret={{
          id: TURRET_ADDRESS,
          itemId: '43',
          name: 'Nova Wall',
          status: 'online',
          locationHash: 'J102',
          isOnline: true,
          typeId: 'turret.mk2',
          energySourceId: NODE_ADDRESS,
          aggressor: 'Sleepers',
        }}
      />,
    );

    expect(screen.getByAltText(/heavy turret icon/i).className).toContain('object-cover');
    expect(screen.getByAltText(/heavy turret icon/i).className).toContain('object-center');
  });

  it('notifies selection', () => {
    const onSelect = vi.fn();
    render(
      <TurretCard
        turret={{
          id: TURRET_ADDRESS,
          itemId: '43',
          name: 'Nova Wall',
          status: 'online',
          locationHash: 'J102',
          isOnline: true,
          typeId: 'turret.mk2',
          energySourceId: NODE_ADDRESS,
          aggressor: 'Sleepers',
        }}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByTestId(`turret-card-${TURRET_ADDRESS}`));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('abbreviates address-valued node identifiers in narrow cards', async () => {
    render(
      <TurretCard
        turret={{
          id: TURRET_ADDRESS,
          itemId: '43',
          name: 'Nova Wall',
          status: 'online',
          locationHash: 'J102',
          isOnline: true,
          typeId: 'turret.mk2',
          energySourceId: NODE_ADDRESS,
          aggressor: 'Sleepers',
        }}
      />,
    );

    emitResizeForAll(120);

    await waitFor(() => {
      expect(screen.getByTitle(NODE_ADDRESS).textContent).toContain('...');
    });
  });

  it('keeps compact cards free of copy controls for address-valued node identifiers', () => {
    render(
      <TurretCard
        turret={{
          id: TURRET_ADDRESS,
          itemId: '43',
          name: 'Nova Wall',
          status: 'online',
          locationHash: 'J102',
          isOnline: true,
          typeId: 'turret.mk2',
          energySourceId: NODE_ADDRESS,
          aggressor: 'Sleepers',
        }}
      />,
    );

    expect(screen.queryByRole('button', { name: /copy node address/i })).toBeNull();
  });

  it('does not truncate the title just to accommodate the status badge', () => {
    render(
      <TurretCard
        turret={{
          id: TURRET_ADDRESS,
          itemId: '43',
          name: 'Heavy Turret',
          status: 'offline',
          locationHash: 'J102',
          isOnline: false,
          typeId: 'turret.mk2',
          energySourceId: NODE_ADDRESS,
          aggressor: 'Sleepers',
        }}
      />,
    );

    expect(screen.getByRole('heading', { name: 'HEAVY TURRET' }).className).not.toContain(
      'truncate',
    );
  });

  it('lets the turret id address row grow to fill the card header width', () => {
    render(
      <TurretCard
        turret={{
          id: NODE_ADDRESS,
          itemId: '43',
          name: 'Nova Wall',
          status: 'online',
          locationHash: 'J102',
          isOnline: true,
          typeId: 'turret.mk2',
          energySourceId: NODE_ADDRESS,
          aggressor: 'Sleepers',
        }}
      />,
    );

    const addressRows = screen.getAllByTestId('responsive-address');
    expect(addressRows[0]?.className).toContain('w-full');
  });

  it('marks the card as selected when requested', () => {
    render(
      <TurretCard
        selected
        turret={{
          id: TURRET_ADDRESS,
          itemId: '43',
          name: 'Nova Wall',
          status: 'online',
          locationHash: 'J102',
          isOnline: true,
          typeId: 'turret.mk2',
          energySourceId: NODE_ADDRESS,
          aggressor: 'Sleepers',
        }}
      />,
    );

    expect(screen.getByTestId(`turret-card-${TURRET_ADDRESS}`).getAttribute('aria-selected')).toBe(
      'true',
    );
    expect(screen.getByTestId(`turret-card-${TURRET_ADDRESS}`).getAttribute('data-selected')).toBe(
      'true',
    );
  });
});
