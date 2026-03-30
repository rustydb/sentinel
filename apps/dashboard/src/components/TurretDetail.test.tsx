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
    intelligence: {
      turretId: TURRET_ADDRESS,
      latestPriorityEvent: {
        txDigest: '0xpriority',
        eventSeq: 3,
        checkpointSequenceNumber: 10,
        timestamp: '2026-03-26T12:05:00.000Z',
      },
      targetItemId: '7001',
      targetCharacterId: 41001,
      targetDisplayName: 'Captain Rusty',
      isNpc: false,
      tribeId: 128,
      tribeName: 'Vherokior',
      targetTypeId: '92404',
      isAggressor: true,
      behaviorChange: 'STARTED_ATTACK' as const,
      statusOverride: 'ENGAGED' as const,
      aggressorsPast24Hours: 3,
    },
    eventsState: {
      events: [
        {
          txDigest: '0xpriority',
          eventSeq: 3,
          checkpointSequenceNumber: 10,
          eventType:
            '0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75::turret::PriorityListUpdatedEvent',
          jsonData: {
            turret_id: TURRET_ADDRESS,
            name: 'Alpha Bastion',
            priority_list: [],
          },
          timestamp: '2026-03-26T12:05:00.000Z',
        },
        {
          txDigest: '0xabc',
          eventSeq: 1,
          checkpointSequenceNumber: 1,
          eventType:
            '0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75::turret::TurretCreatedEvent',
          jsonData: {
            turret_id: TURRET_ADDRESS,
            name: 'Alpha Bastion',
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
    const expectedDate = new Date('2026-03-26T12:05:00.000Z').toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const expectedTime = new Date('2026-03-26T12:05:00.000Z').toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    expect(screen.getByTestId('turret-detail')).toBeTruthy();
    expect(screen.getByText('Alpha Bastion')).toBeTruthy();
    expect(screen.getByText('::turret::PriorityListUpdatedEvent')).toBeTruthy();
    expect(screen.getByText('O3H-1FN')).toBeTruthy();
    expect(screen.getByText('Captain Rusty')).toBeTruthy();
    expect(screen.getByText('Vherokior')).toBeTruthy();
    expect(screen.queryByText('Target Type')).toBeNull();
    expect(screen.getByText('Target').className).not.toContain('uppercase');
    expect(screen.getByText('Captain Rusty').className).not.toContain('uppercase');
    expect(screen.getByText('Tribe').className).not.toContain('uppercase');
    expect(screen.getByText('Vherokior').className).not.toContain('uppercase');
    expect(screen.getByText('Yes')).toBeTruthy();
    expect(screen.getByText('Date')).toBeTruthy();
    expect(screen.getByText('Time')).toBeTruthy();
    expect(screen.getByText('Event')).toBeTruthy();
    expect(screen.getByRole('switch', { name: /event time zone/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /copy solar system/i })).toBeTruthy();
    expect(screen.getAllByText(expectedDate).length).toBeGreaterThan(0);
    expect(screen.getAllByText(expectedTime).length).toBeGreaterThan(0);
  });

  it('renders None for target, aggressor, and tribe when no target contact exists', () => {
    const props = createProps();
    props.intelligence.targetDisplayName = null;
    props.intelligence.isAggressor = null;
    props.intelligence.tribeName = null;
    props.intelligence.targetCharacterId = null;
    render(<TurretDetail {...props} />);

    expect(screen.getAllByText('None')).toHaveLength(2);
    expect(screen.getByText('Aggressor').parentElement?.textContent).toContain('N/A');
    expect(screen.getByText('Tribe').parentElement?.textContent).toContain('None');
  });

  it('expands event payload rows like a blind and keeps the JSON syntax-highlighted', () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    const priorityToggle = screen.getByRole('button', {
      name: /toggle payload for ::turret::prioritylistupdatedevent/i,
    });
    const createdToggle = screen.getByRole('button', {
      name: /toggle payload for ::turret::turretcreatedevent/i,
    });

    expect(priorityToggle.getAttribute('aria-expanded')).toBe('false');
    expect(createdToggle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(priorityToggle);

    expect(priorityToggle.getAttribute('aria-expanded')).toBe('true');
    expect(createdToggle.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getByText('"priority_list"').className).toContain('text-sentinel-accent');

    fireEvent.click(createdToggle);

    expect(priorityToggle.getAttribute('aria-expanded')).toBe('false');
    expect(createdToggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('toggles event timestamps between local time and UTC', () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    const switchButton = screen.getByRole('switch', { name: /event time zone/i });
    const timestamp = '2026-03-26T12:05:00.000Z';
    const localDate = new Date(timestamp).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const localTime = new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const utcDate = new Date(timestamp).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });
    const utcTime = new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });

    expect(switchButton.getAttribute('aria-checked')).toBe('false');
    expect(screen.getAllByText(localDate).length).toBeGreaterThan(0);
    expect(screen.getAllByText(localTime).length).toBeGreaterThan(0);

    fireEvent.click(switchButton);

    expect(
      screen.getByRole('switch', { name: /event time zone/i }).getAttribute('aria-checked'),
    ).toBe('true');
    expect(screen.getAllByText(utcDate).length).toBeGreaterThan(0);
    expect(screen.getAllByText(utcTime).length).toBeGreaterThan(0);
  });

  it('does not use the raw turret id as the large title when a custom name is missing', () => {
    const props = createProps();
    props.turret.name = '';
    render(<TurretDetail {...props} />);

    expect(screen.getByRole('heading', { name: 'Heavy Turret' })).toBeTruthy();
    expect(screen.getAllByTitle(TURRET_ADDRESS)[0]).toBeTruthy();
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
      expect(screen.getAllByTitle(TURRET_ADDRESS)[0]?.textContent).toContain('...');
    });
  });

  it('shows a compact event summary for each event row', () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    expect(screen.getByText('::turret::PriorityListUpdatedEvent')).toBeTruthy();
    expect(screen.getByText('::turret::TurretCreatedEvent')).toBeTruthy();
  });

  it('lets the event log sort by date and time', () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    fireEvent.click(screen.getAllByRole('button', { name: /date/i })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: /time/i })[0]);

    expect(screen.getAllByRole('button', { name: /date/i })[0]).toBeTruthy();
    expect(screen.getAllByRole('button', { name: /time/i })[0]).toBeTruthy();
  });

  it('keeps event log rows compact and aligned', () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    const eventRows = screen.getAllByText('::turret::PriorityListUpdatedEvent');
    expect(eventRows[0]?.className).toContain('text-xs');
  });

  it('copies the full turret address from the detail drawer', async () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /copy turret address/i }));

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(TURRET_ADDRESS);
    });
  });

  it('copies the solar system label from the detail drawer', async () => {
    const props = createProps();
    render(<TurretDetail {...props} />);

    fireEvent.click(screen.getByRole('button', { name: /copy solar system/i }));

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith('O3H-1FN');
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
