import { useConnection } from '@evefrontier/dapp-kit';
import { useCurrentWallet } from '@mysten/dapp-kit-react';
import type { TurretData } from '@frontier-sentinel/shared-types';
import { sampleEvents, sampleNodes, sampleTurrets } from './test-data';
import { startTransition, useDeferredValue, useEffect, useRef, useState } from 'react';

import { MapEmbed } from './components/MapEmbed';
import { ResponsiveAddress } from './components/ResponsiveAddress';
import { TurretDetail } from './components/TurretDetail';
import { TurretList } from './components/TurretCard';
import { useNetworkNodes } from './hooks/useNetworkNodes';
import { useTurretEvents } from './hooks/useTurretEvents';
import { useTurrets } from './hooks/useTurrets';

const search = new URLSearchParams(window.location.search);
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' || search.get('demo') === 'true';
const EVE_WALLET_DOWNLOAD_URL =
  'https://github.com/evefrontier/evevault/releases/download/v0.0.6/eve-vault-chrome.zip';
const DEMO_WALLET_ADDRESS = '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd';
const DEMO_CHARACTER_NAME = 'Captain Rusty';
const ACTION_BUTTON_CLASS =
  'sentinel-action-button border-2 border-sentinel-ink px-3 py-2 uppercase';
const PRIMARY_ACTION_BUTTON_CLASS =
  'sentinel-action-button sentinel-action-button--primary border-4 border-sentinel-ink px-6 py-4 text-lg uppercase';
const DANGER_ACTION_BUTTON_CLASS =
  'sentinel-action-button sentinel-action-button--danger border-2 border-sentinel-danger px-3 py-2 uppercase text-sentinel-danger';

function isSupportedWalletName(walletName: string | undefined): boolean {
  if (!walletName) {
    return false;
  }

  return walletName.includes('Eve Vault') || walletName.includes('EVE Frontier Client Wallet');
}

function WalletConnect({ onConnect, canConnect }: { onConnect: () => void; canConnect: boolean }) {
  return (
    <section className="mx-auto flex min-h-[40vh] max-w-2xl flex-col justify-center border-4 border-sentinel-ink bg-white p-8 shadow-[12px_12px_0_0_#111111]">
      <p className="text-xs uppercase tracking-[0.4em] text-sentinel-muted">
        EVE frontier asset telemetry
      </p>
      <h1 className="mt-4 text-5xl uppercase leading-none">Frontier Sentinel</h1>
      <p className="mt-6 max-w-xl text-lg uppercase">
        Connect EVE Vault to inspect your turret smart assemblies, event history, and map coverage.
      </p>
      <button
        type="button"
        className={`${PRIMARY_ACTION_BUTTON_CLASS} mt-8 w-fit disabled:cursor-not-allowed disabled:bg-sentinel-muted disabled:text-sentinel-paper disabled:shadow-none`}
        onClick={onConnect}
        disabled={!canConnect}
      >
        Connect EVE Vault
      </button>
    </section>
  );
}

function DashboardError({ error }: { error: Error }) {
  return (
    <div className="border-4 border-sentinel-danger bg-white p-6 text-sentinel-danger">
      <p className="text-xs uppercase tracking-[0.3em]">Telemetry fault</p>
      <p className="mt-3 text-lg uppercase">{error.message}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-48 animate-pulse border-4 border-sentinel-ink bg-sentinel-paper p-5"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-4 border-dashed border-sentinel-ink p-8 text-center uppercase">
      No turret assemblies detected for this wallet.
    </div>
  );
}

function WalletDropdown({
  characterName,
  walletAddress,
  onDisconnect,
}: {
  characterName: string;
  walletAddress: string;
  onDisconnect: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!(menuRef.current instanceof HTMLElement)) {
        return;
      }

      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative w-full max-w-md">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${ACTION_BUTTON_CLASS} flex w-full items-center justify-between gap-3`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate">{characterName}</span>
        <span aria-hidden="true" className="text-lg leading-none">
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-20 mt-3 flex min-w-[22rem] max-w-[26rem] flex-col gap-4 border-4 border-sentinel-ink bg-white p-5 shadow-[10px_10px_0_0_#111111]"
          role="menu"
        >
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Sui address</p>
            <ResponsiveAddress
              address={walletAddress}
              as="div"
              className="mt-3 min-w-0 text-base"
              copyLabel="wallet address"
            />
          </div>
          <button
            type="button"
            className={`${DANGER_ACTION_BUTTON_CLASS} w-full justify-center text-center`}
            onClick={onDisconnect}
          >
            Disconnect
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default function App() {
  const [selectedTurret, setSelectedTurret] = useState<TurretData | null>(null);
  const [selectedSystemId, setSelectedSystemId] = useState<number | null>(null);
  const { currentAccount, handleConnect, handleDisconnect, hasEveVault, isConnected } =
    useConnection();
  const currentWallet = useCurrentWallet();

  const usingSupportedWallet = DEMO_MODE || isSupportedWalletName(currentWallet?.name);
  const connected = DEMO_MODE || (isConnected && usingSupportedWallet);
  const walletAddress = currentAccount?.address ?? 'Not connected';
  const displayedWalletAddress = DEMO_MODE ? DEMO_WALLET_ADDRESS : walletAddress;
  const graphQlEndpoint = import.meta.env.VITE_GRAPHQL_URL ?? '/graphql';

  const { turrets, loading, error, characterName } = useTurrets({
    owner: connected && !DEMO_MODE ? currentAccount?.address : undefined,
    endpoint: graphQlEndpoint,
    enabled: connected && !DEMO_MODE,
  });
  const networkNodes = useNetworkNodes({ enabled: !DEMO_MODE });
  const eventsState = useTurretEvents({ turretId: selectedTurret?.id, enabled: !DEMO_MODE });
  const deferredTurrets = useDeferredValue(DEMO_MODE ? sampleTurrets : turrets);

  const currentTurrets = deferredTurrets;
  const currentNodes = DEMO_MODE ? sampleNodes : networkNodes.nodes;
  const nodeActions = DEMO_MODE
    ? {
        assignNode: () => Promise.resolve(),
        unassignNode: () => Promise.resolve(),
      }
    : networkNodes;
  const currentEventsState = DEMO_MODE
    ? {
        events: sampleEvents,
        loading: false,
        error: null,
        page: 1,
        nextPage: null,
        next: () => undefined,
        reset: () => undefined,
      }
    : eventsState;
  const displayedCharacterName = DEMO_MODE
    ? DEMO_CHARACTER_NAME
    : (characterName ?? 'Loading character');

  if (!connected) {
    return (
      <main className="min-h-screen bg-sentinel-canvas px-6 py-10 text-sentinel-ink">
        <WalletConnect onConnect={handleConnect} canConnect={hasEveVault} />
        {!hasEveVault ? (
          <p className="mx-auto mt-4 max-w-2xl border-2 border-sentinel-danger bg-white p-4 text-sm uppercase text-sentinel-danger">
            EVE Wallet is required. Install the extension and reload this page.
          </p>
        ) : null}
        {!hasEveVault ? (
          <p className="mx-auto mt-3 max-w-2xl text-sm uppercase">
            <a
              className={ACTION_BUTTON_CLASS}
              href={EVE_WALLET_DOWNLOAD_URL}
              target="_blank"
              rel="noreferrer"
            >
              Download EVE Wallet Extension
            </a>
          </p>
        ) : null}
        {isConnected && !usingSupportedWallet ? (
          <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-3 border-2 border-sentinel-danger bg-white p-4 text-sm uppercase text-sentinel-danger">
            <p>Connected wallet is not supported. Frontier Sentinel requires EVE Wallet.</p>
            <button
              type="button"
              className={`w-fit ${DANGER_ACTION_BUTTON_CLASS}`}
              onClick={handleDisconnect}
            >
              Disconnect Current Wallet
            </button>
          </div>
        ) : null}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-sentinel-canvas px-6 py-8 text-sentinel-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-4 border-sentinel-ink bg-sentinel-paper p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-sentinel-muted">
              Security Dashboard
            </p>
            <h1 className="mt-3 text-4xl uppercase">Frontier Sentinel</h1>
          </div>
          <div className="min-w-0 text-sm uppercase lg:max-w-xl">
            <p>Turrets: {currentTurrets.length}</p>
            <div className="mt-3">
              <WalletDropdown
                characterName={displayedCharacterName}
                walletAddress={displayedWalletAddress}
                onDisconnect={handleDisconnect}
              />
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="space-y-6">
            {loading ? <LoadingSkeleton /> : null}
            {error ? <DashboardError error={error} /> : null}
            {!loading && !error && currentTurrets.length === 0 ? <EmptyState /> : null}
            {!loading && !error && currentTurrets.length > 0 ? (
              <TurretList
                turrets={currentTurrets}
                nodes={currentNodes}
                selectedTurretId={selectedTurret?.id ?? null}
                onSelect={(turret) => {
                  startTransition(() => {
                    setSelectedTurret((current) => (current?.id === turret.id ? null : turret));
                    currentEventsState.reset();
                  });
                }}
              />
            ) : null}
          </section>

          <MapEmbed selectedSystemId={selectedSystemId} />
        </div>
      </div>

      <TurretDetail
        turret={selectedTurret}
        nodes={currentNodes}
        eventsState={currentEventsState}
        onAssignNode={nodeActions.assignNode}
        onUnassignNode={nodeActions.unassignNode}
        onClose={() => setSelectedTurret(null)}
        onLocationSelect={setSelectedSystemId}
      />
    </main>
  );
}
