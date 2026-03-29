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

describe('TurretCard', () => {
  beforeEach(() => {
    installResizeObserverMock();
    hooks.useTypeInfo.mockReturnValue({
      id: '92404',
      name: 'Heavy Turret',
      iconUrl: 'https://assets.example.com/heavy-turret.png',
    });
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
    expect(screen.getAllByText('Heavy Turret').length).toBeGreaterThan(0);
    expect(screen.getByAltText(/heavy turret icon/i)).toBeTruthy();
    expect(screen.getByText('Status:')).toBeTruthy();
    expect(screen.getByText('offline')).toBeTruthy();
    expect(screen.getByText('Network Node')).toBeTruthy();
    expect(screen.getByText(/orphaned node assignment/i)).toBeTruthy();
    expect(screen.queryByText('Item')).toBeNull();
  });

  it('shows the solar system field as unassigned when no network-node mapping exists', () => {
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
        nodes={[]}
      />,
    );

    expect(screen.getByText('Solar System')).toBeTruthy();
    expect(screen.getByText('Unassigned')).toBeTruthy();
    expect(screen.queryByText('J102')).toBeNull();
  });

  it('uses a centered cover fit for the turret icon image', () => {
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

    expect(screen.getByAltText(/heavy turret icon/i).className).toContain('object-cover');
    expect(screen.getByAltText(/heavy turret icon/i).className).toContain('object-center');
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

  it('does not truncate the title in its own markup just to accommodate the status badge', () => {
    render(
      <TurretCard
        turret={{
          id: '0x2',
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

    expect(screen.getByRole('heading', { name: 'Heavy Turret' }).className).not.toContain(
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

    expect(screen.getByTestId('turret-card-0x2').getAttribute('aria-selected')).toBe('true');
    expect(screen.getByTestId('turret-card-0x2').getAttribute('data-selected')).toBe('true');
  });
});
