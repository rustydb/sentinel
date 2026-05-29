// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NetworkNodeDrawer } from './NetworkNodeDrawer';

vi.mock('../hooks/useTypeInfo', () => ({
  useTypeInfo: () => ({
    id: '92401',
    name: 'Network Node',
    iconUrl: 'https://assets.example.com/network-node.png',
  }),
}));

describe('NetworkNodeDrawer', () => {
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ id: 30000004, name: 'O3H-1FN', world: 'utopia', matchText: 'O3H-1FN' }],
          }),
      }),
    );
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
  });

  it('renders an empty state when no nodes are available', () => {
    render(
      <NetworkNodeDrawer
        open
        nodes={[]}
        selectedNodeId={null}
        onClose={vi.fn()}
        onSelectNode={vi.fn()}
        onAssign={vi.fn().mockResolvedValue(undefined)}
        onUnassign={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByRole('complementary').className).toContain('bg-sentinel-shell');
    expect(screen.getByText(/no current network nodes detected/i)).toBeTruthy();
  });

  it('renders node cards, toggles node filtering, and supports assignment flow', async () => {
    const onAssign = vi.fn().mockResolvedValue(undefined);
    const onSelectNode = vi.fn();
    const { rerender } = render(
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
        selectedNodeId={null}
        onClose={vi.fn()}
        onSelectNode={onSelectNode}
        onAssign={onAssign}
        onUnassign={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const filterButton = screen.getAllByRole('button', { name: /filter by node/i })[0];

    fireEvent.click(filterButton);
    expect(onSelectNode).toHaveBeenCalledWith(
      '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    );
    expect(filterButton.getAttribute('aria-pressed')).toBe('false');

    onSelectNode.mockClear();

    rerender(
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
        selectedNodeId="0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
        onClose={vi.fn()}
        onSelectNode={onSelectNode}
        onAssign={onAssign}
        onUnassign={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const activeFilterButton = screen.getAllByRole('button', { name: /filter by node/i })[0];
    expect(activeFilterButton.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(activeFilterButton);
    expect(onSelectNode).toHaveBeenCalledWith(null);

    fireEvent.click(screen.getByRole('button', { name: /^assign$/i }));
    fireEvent.change(screen.getByPlaceholderText(/search by system name/i), {
      target: { value: 'O3H' },
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'O3H-1FN' })).toBeTruthy();
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
