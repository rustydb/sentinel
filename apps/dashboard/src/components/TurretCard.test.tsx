import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { TurretCard } from './TurretCard';
import { emitResizeForAll, installResizeObserverMock } from '../test-utils/resizeObserver';

const NODE_ADDRESS = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

describe('TurretCard', () => {
  beforeEach(() => {
    installResizeObserverMock();
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders turret state and orphaned indicator', () => {
    render(
      <TurretCard
        turret={{
          id: '0x1',
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

    expect(screen.getByText('Raven Gate')).toBeTruthy();
    expect(screen.getByText(/orphaned node assignment/i)).toBeTruthy();
  });

  it('notifies selection', () => {
    const onSelect = vi.fn();
    render(
      <TurretCard
        turret={{
          id: '0x2',
          itemId: '43',
          name: 'Nova Wall',
          status: 'online',
          locationHash: 'J102',
          isOnline: true,
          typeId: 'turret.mk2',
          energySourceId: 'node-7',
          aggressor: 'Sleepers',
        }}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByTestId('turret-card-0x2'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('abbreviates address-valued node identifiers in narrow cards', async () => {
    render(
      <TurretCard
        turret={{
          id: '0x2',
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
      expect(screen.getByTitle(NODE_ADDRESS).textContent).toContain('…');
    });
  });

  it('keeps compact cards free of copy controls for address-valued node identifiers', () => {
    render(
      <TurretCard
        turret={{
          id: '0x2',
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
});
