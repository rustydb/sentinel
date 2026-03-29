// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { emitResizeForAll, installResizeObserverMock } from './test-utils/resizeObserver';

const hooks = vi.hoisted(() => ({
  useConnection: vi.fn(),
  useCurrentWallet: vi.fn(),
  useTurrets: vi.fn(),
  useNetworkNodes: vi.fn(),
  useTurretEvents: vi.fn(),
  useTurretSolarSystems: vi.fn(),
  useTypeInfo: vi.fn(),
}));

vi.mock('@evefrontier/dapp-kit', () => ({
  useConnection: hooks.useConnection,
}));

vi.mock('@mysten/dapp-kit-react', () => ({
  useCurrentWallet: hooks.useCurrentWallet,
}));

vi.mock('./hooks/useTurrets', () => ({
  useTurrets: hooks.useTurrets,
}));

vi.mock('./hooks/useNetworkNodes', () => ({
  useNetworkNodes: hooks.useNetworkNodes,
}));

vi.mock('./hooks/useTurretEvents', () => ({
  useTurretEvents: hooks.useTurretEvents,
}));

vi.mock('./hooks/useTurretSolarSystems', () => ({
  useTurretSolarSystems: hooks.useTurretSolarSystems,
}));

vi.mock('./hooks/useTypeInfo', () => ({
  useTypeInfo: hooks.useTypeInfo,
}));

import App from './App';

const WALLET_ADDRESS = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const NODE_ADDRESS = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const TURRET_ADDRESS = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
const CHARACTER_NAME = 'Commander Nova';
const clipboardWriteText = vi.fn();
const disconnectMock = vi.fn();

describe('App', () => {
  beforeEach(() => {
    installResizeObserverMock();
    clipboardWriteText.mockReset();
    disconnectMock.mockReset();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: clipboardWriteText.mockResolvedValue(undefined),
      },
      configurable: true,
    });

    hooks.useConnection.mockReturnValue({
      currentAccount: { address: WALLET_ADDRESS },
      handleConnect: vi.fn(),
      handleDisconnect: disconnectMock,
      hasEveVault: true,
      isConnected: true,
    });
    hooks.useCurrentWallet.mockReturnValue({ name: 'Eve Vault' });
    hooks.useTurrets.mockReturnValue({
      turrets: [
        {
          id: TURRET_ADDRESS,
          itemId: '1001',
          name: 'Alpha Bastion',
          status: 'online',
          locationHash: 'J101',
          isOnline: true,
          typeId: 'turret.mk1',
          energySourceId: NODE_ADDRESS,
          aggressor: null,
        },
      ],
      loading: false,
      error: null,
      characterName: CHARACTER_NAME,
      characterAddress: '0xcharacter',
    });
    hooks.useNetworkNodes.mockReturnValue({
      nodes: [
        {
          nodeId: NODE_ADDRESS,
          solarSystemId: 30000004,
          solarSystemName: 'O3H-1FN',
          typeId: '92401',
          displayName: 'Node Prime',
        },
      ],
      mappings: [
        {
          nodeId: NODE_ADDRESS,
          solarSystemId: 30000004,
          solarSystemName: 'O3H-1FN',
        },
      ],
      loading: false,
      assignNode: vi.fn(),
      unassignNode: vi.fn(),
    });
    hooks.useTurretEvents.mockReturnValue({
      events: [],
      loading: false,
      error: null,
      page: 1,
      nextPage: null,
      next: vi.fn(),
      reset: vi.fn(),
    });
    hooks.useTurretSolarSystems.mockReturnValue({
      byTurretId: new Map([
        [
          TURRET_ADDRESS,
          {
            turretId: TURRET_ADDRESS,
            solarSystemId: 30000004,
            solarSystemName: 'O3H-1FN',
            resolutionSource: 'node',
          },
        ],
      ]),
      loading: false,
      error: null,
    });
    hooks.useTypeInfo.mockReturnValue({
      typeInfo: {
        id: '92404',
        name: 'Heavy Turret',
        iconUrl: 'https://assets.example.com/heavy-turret.png',
      },
      isLoading: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('shows the character name in the wallet dropdown trigger', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: new RegExp(CHARACTER_NAME, 'i') })).toBeTruthy();
  });

  it('keeps the wallet address responsive inside the wallet dropdown', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(CHARACTER_NAME, 'i') }));
    emitResizeForAll(120);

    await waitFor(() => {
      expect(screen.getByTitle(WALLET_ADDRESS).textContent).toContain('...');
    });
  });

  it('copies the full wallet address from the wallet dropdown', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(CHARACTER_NAME, 'i') }));
    fireEvent.click(screen.getByRole('button', { name: /copy wallet address/i }));

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(WALLET_ADDRESS);
    });
  });

  it('shows the wallet address and disconnect action when the dropdown is expanded', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(CHARACTER_NAME, 'i') }));

    expect(screen.getByText(/sui address/i)).toBeTruthy();
    expect(screen.getByRole('button', { name: /^disconnect$/i })).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /^disconnect$/i }));
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the selected turret card highlighted until it is toggled off or replaced', () => {
    render(<App />);

    const card = screen.getByTestId(`turret-card-${TURRET_ADDRESS}`);

    expect(card.getAttribute('aria-selected')).toBe('false');
    fireEvent.click(card);
    expect(card.getAttribute('aria-selected')).toBe('true');
    fireEvent.click(card);
    expect(card.getAttribute('aria-selected')).toBe('false');
  });

  it('opens the network node drawer from the header', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /network nodes/i }));

    expect(screen.getByRole('heading', { name: /network nodes/i })).toBeTruthy();
    expect(screen.getByText('Node Prime')).toBeTruthy();
  });

  it('renders the resolved solar-system friendly name on turret cards', () => {
    render(<App />);

    expect(screen.getByText('O3H-1FN')).toBeTruthy();
  });
});
