import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TurretDetail } from './TurretDetail';

const baseProps = {
  turret: {
    id: '0xturret',
    itemId: '42',
    name: 'Alpha Bastion',
    status: 'online' as const,
    locationHash: 'J101',
    isOnline: true,
    typeId: 'turret.mk1',
    energySourceId: 'node-7',
  },
  nodes: [{ nodeId: 'node-7', solarSystemId: 31002477 }],
  eventsState: {
    events: [
      {
        txDigest: '0xabc',
        eventSeq: 1,
        checkpointSequenceNumber: 1,
        eventType: 'TurretCreatedEvent',
        jsonData: {
          turret_id: '0xturret',
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
  afterEach(() => {
    cleanup();
  });

  it('renders drawer details and events', () => {
    render(<TurretDetail {...baseProps} />);

    expect(screen.getByTestId('turret-detail')).toBeTruthy();
    expect(screen.getByText('Alpha Bastion')).toBeTruthy();
    expect(screen.getByText('TurretCreatedEvent')).toBeTruthy();
  });

  it('allows node actions and map navigation', () => {
    render(<TurretDetail {...baseProps} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'node-7' })[0]);
    fireEvent.click(screen.getByRole('button', { name: /view system on map/i }));

    expect(baseProps.onAssignNode).toHaveBeenCalledWith('node-7', 31002477);
    expect(baseProps.onLocationSelect).toHaveBeenCalledWith(31002477);
  });
});
