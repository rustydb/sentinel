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

import App from './App';

const WALLET_ADDRESS = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const NODE_ADDRESS = '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
const clipboardWriteText = vi.fn();

describe('App', () => {
  beforeEach(() => {
    installResizeObserverMock();
    clipboardWriteText.mockReset();
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: clipboardWriteText.mockResolvedValue(undefined),
      },
      configurable: true,
    });

    hooks.useConnection.mockReturnValue({
      currentAccount: { address: WALLET_ADDRESS },
      handleConnect: vi.fn(),
      handleDisconnect: vi.fn(),
      hasEveVault: true,
      isConnected: true,
    });
    hooks.useCurrentWallet.mockReturnValue({ name: 'Eve Vault' });
    hooks.useTurrets.mockReturnValue({
      turrets: [
        {
          id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
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
    });
    hooks.useNetworkNodes.mockReturnValue({
      nodes: [],
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
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('keeps the wallet address responsive in the dashboard header', async () => {
    render(<App />);

    emitResizeForAll(120);

    await waitFor(() => {
      expect(screen.getByTitle(WALLET_ADDRESS).textContent).toContain('…');
    });
  });

  it('copies the full wallet address from the dashboard header', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /copy wallet address/i }));

    await waitFor(() => {
      expect(clipboardWriteText).toHaveBeenCalledWith(WALLET_ADDRESS);
    });
  });

  it('uses the shared responsive-address pattern for both wallet and turret node surfaces', () => {
    render(<App />);

    expect(screen.getByRole('button', { name: /copy wallet address/i })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /copy node address/i })).toBeNull();
    expect(screen.getByTitle(NODE_ADDRESS)).toBeTruthy();
  });
});
