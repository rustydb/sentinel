import { useConnection } from '@evefrontier/dapp-kit';
import { useCurrentWallet } from '@mysten/dapp-kit-react';
import type { TurretData } from '@frontier-sentinel/shared-types';
import { useDeferredValue } from 'react';
import { useState } from 'react';

import { DashboardScreen } from './components/DashboardScreen';
import { useNetworkNodes } from './hooks/useNetworkNodes';
import { useTurretEvents } from './hooks/useTurretEvents';
import { useTurretSolarSystems } from './hooks/useTurretSolarSystems';
import { useTurrets } from './hooks/useTurrets';

const EVE_WALLET_DOWNLOAD_URL =
  'https://github.com/evefrontier/evevault/releases/download/v0.0.6/eve-vault-chrome.zip';
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

function toggleSelectedTurret(
  current: TurretData | null,
  nextTurret: TurretData,
): TurretData | null {
  return current?.id === nextTurret.id ? null : nextTurret;
}

export default function App() {
  const [selectedTurret, setSelectedTurret] = useState<TurretData | null>(null);
  const { currentAccount, handleConnect, handleDisconnect, hasEveVault, isConnected } =
    useConnection();
  const currentWallet = useCurrentWallet();

  const usingSupportedWallet = isSupportedWalletName(currentWallet?.name);
  const connected = isConnected && usingSupportedWallet;
  const walletAddress = currentAccount?.address ?? 'Not connected';
  const graphQlEndpoint = import.meta.env.VITE_GRAPHQL_URL ?? '/graphql';

  const { turrets, loading, error, characterName } = useTurrets({
    owner: connected ? currentAccount?.address : undefined,
    endpoint: graphQlEndpoint,
    enabled: connected,
  });
  const eventsState = useTurretEvents({ turretId: selectedTurret?.id, enabled: connected });
  const deferredTurrets = useDeferredValue(turrets);
  const candidateNodeIds = deferredTurrets
    .map((turret) => turret.energySourceId)
    .filter((nodeId): nodeId is string => /^0x[a-fA-F0-9]{64}$/.test(nodeId));
  const networkNodes = useNetworkNodes({
    enabled: connected,
    candidateNodeIds,
    graphQlEndpoint,
  });
  const turretSolarSystems = useTurretSolarSystems({
    turrets: deferredTurrets,
    nodeMappings: networkNodes.mappings,
    apiBaseUrl: '',
    enabled: connected,
  });

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
    <DashboardScreen
      turrets={deferredTurrets}
      loading={loading}
      error={error}
      characterName={characterName ?? 'Loading character'}
      walletAddress={walletAddress}
      onDisconnect={handleDisconnect}
      selectedTurret={selectedTurret}
      onSelectTurret={(turret) => setSelectedTurret(toggleSelectedTurret(selectedTurret, turret))}
      onCloseTurret={() => setSelectedTurret(null)}
      nodes={networkNodes.nodes}
      drawerLoading={networkNodes.loading}
      eventsState={eventsState}
      solarSystemsByTurretId={turretSolarSystems.byTurretId}
      onAssignSolarSystem={networkNodes.assignNode}
      onUnassignSolarSystem={networkNodes.unassignNode}
      onResetEvents={eventsState.reset}
    />
  );
}
