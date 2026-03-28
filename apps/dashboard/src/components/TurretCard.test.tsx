import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TurretCard } from './TurretCard';

describe('TurretCard', () => {
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

    expect(screen.getByText('Raven Gate')).toBeInTheDocument();
    expect(screen.getByText(/orphaned node assignment/i)).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
