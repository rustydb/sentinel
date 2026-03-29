import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TurretDetail } from './TurretDetail';
import { emitResizeForAll, installResizeObserverMock } from '../test-utils/resizeObserver';

const TURRET_ADDRESS = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const NODE_ADDRESS = '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc';
const clipboardWriteText = vi.fn();

const baseProps = {
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
  nodes: [{ nodeId: NODE_ADDRESS, solarSystemId: 31002477 }],
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
  onAssignNode: vi.fn().mockResolvedValue(undefined),
  onUnassignNode: vi.fn().mockResolvedValue(undefined),
  onClose: vi.fn(),
  onLocationSelect: vi.fn(),
};

describe('TurretDetail', () => {
  beforeEach(() => {
    installResizeObserverMock();
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
    render(<TurretDetail {...baseProps} />);

    expect(screen.getByTestId('turret-detail')).toBeTruthy();
    expect(screen.getByText('Alpha Bastion')).toBeTruthy();
    expect(screen.getByText('TurretCreatedEvent')).toBeTruthy();
  });

  it('allows node actions and map navigation', () => {
    render(<TurretDetail {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: `Assign ${NODE_ADDRESS}` }));
    fireEvent.click(screen.getByRole('button', { name: /view system on map/i }));

    expect(baseProps.onAssignNode).toHaveBeenCalledWith(NODE_ADDRESS, 31002477);
    expect(baseProps.onLocationSelect).toHaveBeenCalledWith(31002477);
  });

  it('abbreviates turret addresses in the detail drawer when space is tight', async () => {
    render(<TurretDetail {...baseProps} />);

    emitResizeForAll(120);

    await waitFor(() => {
      expect(screen.getByTitle(TURRET_ADDRESS).textContent).toContain('…');
    });
  });

  it('copies the full turret address from the detail drawer', async () => {
    render(<TurretDetail {...baseProps} />);

    fireEvent.click(screen.getByRole('button', { name: /copy turret address/i }));

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(TURRET_ADDRESS);
    });
  });

  it('uses the shared copy controls for turret and node address surfaces', () => {
    render(<TurretDetail {...baseProps} />);

    expect(screen.getByRole('button', { name: /copy turret address/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /copy assigned node address/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /copy available node address/i })).toBeTruthy();
  });

  it('lets the selected turret and assigned node address rows grow to fill available width', () => {
    render(<TurretDetail {...baseProps} />);

    const addressRows = screen.getAllByTestId('responsive-address');
    expect(addressRows[0]?.className).toContain('w-full');
    expect(addressRows[1]?.className).toContain('w-full');
  });
});
