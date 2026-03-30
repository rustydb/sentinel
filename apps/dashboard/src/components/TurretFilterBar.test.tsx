// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TurretFilterBar } from './TurretFilterBar';

describe('TurretFilterBar', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders active filter controls and allows clearing them', () => {
    const onClearAll = vi.fn();
    const onSearchTextChange = vi.fn();
    const onSolarSystemQueryChange = vi.fn();
    const onAddSolarSystem = vi.fn();
    const onRemoveSolarSystem = vi.fn();
    const onStatusChange = vi.fn();
    const onClassNameChange = vi.fn();
    const onClearSelectedNetworkNode = vi.fn();

    render(
      <TurretFilterBar
        filters={{
          searchText: 'alpha',
          solarSystemQuery: 'O3H',
          solarSystems: ['ELS-5C8'],
          selectedNetworkNodeId:
            '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          statuses: ['online'],
          classNames: [],
        }}
        statusOptions={[
          { value: 'online', label: 'ONLINE' },
          { value: 'offline', label: 'OFFLINE' },
          { value: 'engaged', label: 'ENGAGED' },
        ]}
        classOptions={[{ value: 'Heavy Turret', label: 'HEAVY TURRET' }]}
        selectedNetworkNode={{
          nodeId: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
          solarSystemId: 30000004,
          solarSystemName: 'O3H-1FN',
          typeId: '92401',
          displayName: 'Node Prime',
        }}
        hasActiveFilters
        onSearchTextChange={onSearchTextChange}
        onSolarSystemQueryChange={onSolarSystemQueryChange}
        onAddSolarSystem={onAddSolarSystem}
        onRemoveSolarSystem={onRemoveSolarSystem}
        onStatusChange={onStatusChange}
        onClassNameChange={onClassNameChange}
        onClearSelectedNetworkNode={onClearSelectedNetworkNode}
        onClearAll={onClearAll}
      />,
    );

    expect(screen.getByDisplayValue('alpha')).toBeTruthy();
    expect(screen.getByRole('button', { name: /advanced search options/i })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /advanced search options/i }));
    expect(screen.getByRole('button', { name: /^online$/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /all classes/i })).toBeTruthy();
    expect(screen.getByText(/node prime/i)).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /clear all/i }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: /advanced search options/i }));

    fireEvent.change(screen.getByPlaceholderText(/search for turret id or name/i), {
      target: { value: 'beta' },
    });
    expect(onSearchTextChange).toHaveBeenCalledWith('beta');

    fireEvent.click(screen.getByRole('button', { name: /advanced search options/i }));
    fireEvent.click(screen.getByRole('button', { name: /^online$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^engaged$/i }));
    expect(onStatusChange).toHaveBeenCalledWith('engaged');

    fireEvent.click(screen.getByRole('button', { name: /all classes/i }));
    fireEvent.click(screen.getByRole('button', { name: /heavy turret/i }));
    expect(onClassNameChange).toHaveBeenCalledWith('Heavy Turret');

    fireEvent.focus(screen.getByDisplayValue('O3H'));
    fireEvent.click(screen.getByRole('button', { name: 'O3H-1FN' }));
    expect(onAddSolarSystem).toHaveBeenCalledWith('O3H-1FN');

    fireEvent.click(screen.getByRole('button', { name: /remove els-5c8/i }));
    expect(onRemoveSolarSystem).toHaveBeenCalledWith('ELS-5C8');

    fireEvent.click(screen.getByRole('button', { name: /^clear$/i }));
    expect(onClearSelectedNetworkNode).toHaveBeenCalledTimes(1);
  });
});
