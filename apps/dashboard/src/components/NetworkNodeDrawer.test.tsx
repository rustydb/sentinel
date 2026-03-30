import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { NetworkNodeDrawer } from './NetworkNodeDrawer';

vi.mock('../hooks/useTypeInfo', () => ({
  useTypeInfo: () => ({
    id: '92401',
    name: 'Network Node',
    iconUrl: 'https://assets.example.com/network-node.png',
  }),
}));

describe('NetworkNodeDrawer', () => {
  it('renders an empty state when no nodes are available', () => {
    render(
      <NetworkNodeDrawer
        open
        nodes={[]}
        onClose={vi.fn()}
        onAssign={vi.fn().mockResolvedValue(undefined)}
        onUnassign={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByRole('complementary').className).toContain('bg-sentinel-shell');
    expect(screen.getByText(/no current network nodes detected/i)).toBeTruthy();
  });

  it('renders node cards and supports assignment flow', async () => {
    const onAssign = vi.fn().mockResolvedValue(undefined);
    render(
      <NetworkNodeDrawer
        open
        nodes={[
          {
            nodeId: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
            solarSystemId: 0,
            solarSystemName: null,
            typeId: '92401',
            displayName: 'Node Prime',
          },
        ]}
        onClose={vi.fn()}
        onAssign={onAssign}
        onUnassign={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^assign$/i }));
    fireEvent.change(screen.getByPlaceholderText(/search by system name/i), {
      target: { value: 'O3H' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'O3H-1FN' }));

    await waitFor(() => {
      expect(onAssign).toHaveBeenCalledWith(
        '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        {
          solarSystemId: 30000004,
          solarSystemName: 'O3H-1FN',
        },
      );
    });
  });
});
