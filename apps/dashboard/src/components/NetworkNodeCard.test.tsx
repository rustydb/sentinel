import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NetworkNodeCard } from './NetworkNodeCard';

const hooks = vi.hoisted(() => ({
  useTypeInfo: vi.fn(),
}));

vi.mock('../hooks/useTypeInfo', () => ({
  useTypeInfo: hooks.useTypeInfo,
}));

describe('NetworkNodeCard', () => {
  beforeEach(() => {
    hooks.useTypeInfo.mockReturnValue({
      typeInfo: {
        id: '92401',
        name: 'Network Node',
        iconUrl: 'https://assets.example.com/network-node.png',
      },
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows assignment state and supports unassign', async () => {
    const onUnassign = vi.fn().mockResolvedValue(undefined);
    render(
      <NetworkNodeCard
        node={{
          nodeId: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          solarSystemId: 30000004,
          solarSystemName: 'O3H-1FN',
          typeId: '92401',
          displayName: 'Node Prime',
        }}
        onAssign={vi.fn().mockResolvedValue(undefined)}
        onUnassign={onUnassign}
      />,
    );

    expect(screen.getByText('O3H-1FN')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /unassign/i }));

    await waitFor(() => {
      expect(onUnassign).toHaveBeenCalledWith(
        '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      );
    });
  });

  it('falls back to the node id when the name is generic', () => {
    render(
      <NetworkNodeCard
        node={{
          nodeId: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
          solarSystemId: 0,
          solarSystemName: null,
          typeId: '92401',
          displayName: 'Network Node',
        }}
        onAssign={vi.fn().mockResolvedValue(undefined)}
        onUnassign={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(
      screen.getByTitle('0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc'),
    ).toBeTruthy();
    expect(screen.queryByText(/^network node$/i)).toBeNull();
  });
});
