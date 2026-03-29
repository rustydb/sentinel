import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TurretDetail } from './TurretDetail';
import { emitResizeForAll, installResizeObserverMock } from '../test-utils/resizeObserver';

const hooks = vi.hoisted(() => ({
  useTypeInfo: vi.fn(),
}));

vi.mock('../hooks/useTypeInfo', () => ({
  useTypeInfo: hooks.useTypeInfo,
}));

const TURRET_ADDRESS = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const NODE_ADDRESS = '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
const clipboardWriteText = vi.fn();

function createProps() {
  return {
    turret: {
      id: TURRET_ADDRESS,
      itemId: '42',
      name: 'Alpha Bastion',
      status: 'online' as const,
      locationHash: 'J101',
      isOnline: true,
      typeId: 'turret.mk1',
      energySourceId: NODE_ADDRESS,
    },
    currentSolarSystem: {
      turretId: TURRET_ADDRESS,
      solarSystemId: 30000004,
      solarSystemName: 'O3H-1FN',
      resolutionSource: 'node' as const,
    },
    eventsState: {
      events: [
        {
          txDigest: '0xabc',
          eventSeq: 1,
          checkpointSequenceNumber: 1,
          eventType: 'TurretCreatedEvent',
          jsonData: {
            turret_id: TURRET_ADDRESS,
            turret_key: { tenant: 'utopia', item_id: '42' },
            owner_cap_id: '0xowner-cap',
          },
          timestamp: '2026-03-26T12:00:00.000Z',
        },
      ],
      loading: false,
      error: null,
      page: 1,
      nextPage: null,
      next: vi.fn(),
      reset: vi.fn(),
    },
    onAssignSolarSystem: vi.fn().mockResolvedValue(undefined),
    onUnassignSolarSystem: vi.fn().mockResolvedValue(undefined),
    onClose: vi.fn(),
  };
}

describe('TurretDetail', () => {
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
    clipboardWriteText.mockReset();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: clipboardWriteText.mockResolvedValue(undefined),
      },
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders drawer details and events', () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    expect(screen.getByTestId('turret-detail')).toBeTruthy();
    expect(screen.getByText('Alpha Bastion')).toBeTruthy();
    expect(screen.getByText('TurretCreatedEvent')).toBeTruthy();
    expect(screen.getByText('O3H-1FN')).toBeTruthy();
  });

  it('does not use the raw turret id as the large title when a custom name is missing', () => {
    const props = createProps();
    props.turret.name = '';
    render(<TurretDetail {...props} />);

    expect(screen.getByText('Heavy Turret')).toBeTruthy();
    expect(screen.getByTitle(TURRET_ADDRESS)).toBeTruthy();
  });

  it('allows solar-system reassignment from the detail panel', async () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /reassign/i }));
    fireEvent.change(screen.getByPlaceholderText(/search by system name/i), {
      target: { value: 'O3H' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'O3H-1FN' }));

    await waitFor(() => {
      expect(props.onAssignSolarSystem).toHaveBeenCalledWith(NODE_ADDRESS, {
        solarSystemId: 30000004,
        solarSystemName: 'O3H-1FN',
      });
    });
  });

  it('abbreviates turret addresses in the detail drawer when space is tight', async () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    emitResizeForAll(120);

    await waitFor(() => {
      expect(screen.getByTitle(TURRET_ADDRESS).textContent).toContain('...');
    });
  });

  it('copies the full turret address from the detail drawer', async () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /copy turret address/i }));

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(TURRET_ADDRESS);
    });
  });

  it('uses the shared copy controls for turret and node address surfaces', () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    expect(screen.getByRole('button', { name: /copy turret address/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /copy assigned node address/i })).toBeTruthy();
  });

  it('lets the selected turret and assigned node address rows grow to fill available width', () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    const addressRows = screen.getAllByTestId('responsive-address');
    expect(addressRows[0]?.className).toContain('w-full');
    expect(addressRows[1]?.className).toContain('w-full');
  });
});
