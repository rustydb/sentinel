import { useConnection } from '@evefrontier/dapp-kit';
import { useCurrentWallet } from '@mysten/dapp-kit-react';
import type { EveWorldName, TurretData } from '@sentinel/shared-types';
import { useDeferredValue, useEffect, useState } from 'react';

import sentinelLogo from '../../../assets/logo.png';
import { dashboardBuildInfo } from './buildInfo';
import { DashboardScreen } from './components/DashboardScreen';
import { useDashboardRefresh } from './hooks/useDashboardRefresh';
import { useNetworkNodes } from './hooks/useNetworkNodes';
import {
  type UseTurretIntelligenceResult,
  useTurretIntelligence,
} from './hooks/useTurretIntelligence';
import { type UseTurretEventsResult, useTurretEvents } from './hooks/useTurretEvents';
import { useTurretFilters } from './hooks/useTurretFilters';
import { useTurretSolarSystems } from './hooks/useTurretSolarSystems';
import { useTurretTypeCatalog } from './hooks/useTurretTypeCatalog';
import { useTurrets } from './hooks/useTurrets';
import { resolveCurrentWorld } from './world';
import { WorldProvider } from './worldContext';

const EVE_WALLET_DOWNLOAD_URL =
  'https://github.com/evefrontier/evevault/releases/latest/download/eve-vault-chrome.zip';
const ACTION_BUTTON_CLASS =
  'sentinel-action-button border-2 border-sentinel-ink px-3 py-2 uppercase';
const PRIMARY_ACTION_BUTTON_CLASS =
  'sentinel-action-button sentinel-action-button--primary border-2 border-sentinel-line px-6 py-4 text-lg uppercase';
const DANGER_ACTION_BUTTON_CLASS =
  'sentinel-action-button sentinel-action-button--danger border border-sentinel-danger px-3 py-2 uppercase text-sentinel-danger';

function isSupportedWalletName(walletName: string | undefined): boolean {
  if (!walletName) {
    return false;
  }

  return walletName.includes('Eve Vault') || walletName.includes('EVE Frontier Client Wallet');
}

function WalletConnect({ onConnect, canConnect }: { onConnect: () => void; canConnect: boolean }) {
  return (
    <section className="mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-full max-w-3xl">
        <img
          src={sentinelLogo}
          alt="Sentinel logo"
          className="mx-auto h-auto w-full max-w-[21rem] object-contain drop-shadow-[0_0_24px_rgba(255,106,33,0.18)] sm:max-w-[24rem]"
        />
        <h1 className="mt-6 text-4xl uppercase text-sentinel-glow sm:text-[3.35rem]">Sentinel</h1>
        <p className="mt-3 text-[0.7rem] uppercase tracking-[0.55em] text-sentinel-muted">
          EVE Frontier Defense Telemetry
        </p>

        <div className="mt-10 border-2 border-sentinel-line bg-sentinel-shell/95 p-6 text-left shadow-[8px_8px_0_0_#050608] sm:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-sentinel-line pb-4">
            <p className="text-[0.68rem] uppercase tracking-[0.42em] text-sentinel-muted">
              Security Clearance Terminal
            </p>
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-sentinel-accent">
              Restricted
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.38em] text-sentinel-muted">
                Access status
              </p>
              <div className="space-y-3 border border-sentinel-line bg-sentinel-panel-inset px-4 py-5">
                <p className="text-2xl uppercase leading-tight text-sentinel-glow sm:text-3xl">
                  No active security clearance.
                </p>
                <p className="text-lg uppercase text-sentinel-danger sm:text-xl">Access denied.</p>
                <p className="text-sm uppercase tracking-[0.25em] text-sentinel-muted">
                  Enter security clearance to proceed.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3 lg:items-end">
              <p className="max-w-sm text-xs uppercase tracking-[0.25em] text-sentinel-muted lg:text-right">
                Vault authentication is required.
              </p>
              <button
                type="button"
                className={`${PRIMARY_ACTION_BUTTON_CLASS} w-full max-w-sm disabled:cursor-not-allowed disabled:bg-sentinel-muted disabled:text-sentinel-paper disabled:shadow-none lg:w-auto`}
                onClick={onConnect}
                disabled={!canConnect}
              >
                Connect EVE Vault
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function toggleSelectedTurret(
  currentTurretId: string | null,
  nextTurret: TurretData,
): string | null {
  return currentTurretId === nextTurret.id ? null : nextTurret.id;
}

export default function App() {
  const [selectedTurretId, setSelectedTurretId] = useState<string | null>(null);
  const { currentAccount, handleConnect, handleDisconnect, hasEveVault, isConnected } =
    useConnection();
  const currentWallet = useCurrentWallet();

  const usingSupportedWallet = isSupportedWalletName(currentWallet?.name);
  const connected = isConnected && usingSupportedWallet;
  const requestedWorld: EveWorldName = resolveCurrentWorld(currentAccount);
  const walletAddress = currentAccount?.address ?? 'Not connected';
  const graphQlEndpoint = import.meta.env.VITE_GRAPHQL_URL ?? '/graphql';
  const { refreshTick } = useDashboardRefresh({ enabled: connected });

  const {
    turrets,
    loading,
    error,
    characterName,
    world: syncedWorld,
  } = useTurrets({
    owner: connected ? currentAccount?.address : undefined,
    world: requestedWorld,
    endpoint: graphQlEndpoint,
    enabled: connected,
    refreshTick,
  });
  const currentWorld: EveWorldName = syncedWorld ?? requestedWorld;
  const eventsState: UseTurretEventsResult = useTurretEvents({
    turretId: selectedTurretId ?? undefined,
    enabled: connected,
    refreshTick,
  });
  const deferredTurrets = useDeferredValue(turrets);
  const candidateNodeIds = deferredTurrets
    .map((turret) => turret.energySourceId)
    .filter((nodeId): nodeId is string => /^0x[a-fA-F0-9]{64}$/.test(nodeId));
  const networkNodes = useNetworkNodes({
    enabled: connected,
    candidateNodeIds,
    graphQlEndpoint,
    refreshTick,
  });
  const turretSolarSystems = useTurretSolarSystems({
    turrets: deferredTurrets,
    nodeMappings: networkNodes.mappings,
    apiBaseUrl: '',
    world: currentWorld,
    enabled: connected,
    refreshTick,
  });
  const turretIntelligence: UseTurretIntelligenceResult = useTurretIntelligence({
    turrets: deferredTurrets,
    apiBaseUrl: '',
    enabled: connected,
    refreshTick,
  });
  const turretTypeCatalog = useTurretTypeCatalog({
    typeIds: deferredTurrets.map((turret) => turret.typeId),
    world: currentWorld,
    enabled: connected,
  });
  const turretFilters = useTurretFilters({
    turrets: deferredTurrets,
    solarSystemsByTurretId: turretSolarSystems.byTurretId,
    nodes: networkNodes.nodes,
    turretIntelligenceByTurretId: turretIntelligence.byTurretId,
    turretTypeCatalogByTypeId: turretTypeCatalog.byTypeId,
  });

  const selectedTurret =
    selectedTurretId != null
      ? (deferredTurrets.find((turret) => turret.id === selectedTurretId) ?? null)
      : null;

  useEffect(() => {
    if (selectedTurretId == null) {
      return;
    }

    const selectedTurretExists = deferredTurrets.some((turret) => turret.id === selectedTurretId);
    if (!selectedTurretExists) {
      setSelectedTurretId(null);
    }
  }, [deferredTurrets, selectedTurretId]);

  if (!connected) {
    return (
      <main className="min-h-screen bg-sentinel-canvas px-6 py-10 text-sentinel-ink">
        <WalletConnect onConnect={handleConnect} canConnect={hasEveVault} />
        {!hasEveVault ? (
          <p className="mx-auto mt-4 max-w-2xl border border-sentinel-danger bg-sentinel-shell p-4 text-sm uppercase text-sentinel-danger">
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
          <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-3 border border-sentinel-danger bg-sentinel-shell p-4 text-sm uppercase text-sentinel-danger">
            <p>Connected wallet is not supported. Sentinel requires EVE Wallet.</p>
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
    <WorldProvider world={currentWorld}>
      <DashboardScreen
        turrets={turretFilters.filteredTurrets}
        totalTurrets={deferredTurrets.length}
        loading={loading}
        error={error}
        characterName={characterName ?? 'Syncing character'}
        walletAddress={walletAddress}
        onDisconnect={handleDisconnect}
        selectedTurret={selectedTurret}
        onSelectTurret={(turret) =>
          setSelectedTurretId(toggleSelectedTurret(selectedTurretId, turret))
        }
        onCloseTurret={() => setSelectedTurretId(null)}
        nodes={networkNodes.nodes}
        drawerLoading={networkNodes.loading}
        eventsState={eventsState}
        solarSystemsByTurretId={turretSolarSystems.byTurretId}
        turretIntelligenceByTurretId={turretIntelligence.byTurretId}
        stats={turretIntelligence.stats}
        onAssignSolarSystem={networkNodes.assignNode}
        onUnassignSolarSystem={networkNodes.unassignNode}
        onResetEvents={eventsState.reset}
        filters={turretFilters.state}
        hasActiveFilters={turretFilters.hasActiveFilters}
        statusOptions={turretFilters.statusOptions}
        classOptions={turretFilters.classOptions}
        selectedNetworkNode={turretFilters.selectedNetworkNode}
        onSearchTextChange={turretFilters.setSearchText}
        onSolarSystemQueryChange={turretFilters.setSolarSystemQuery}
        onAddSolarSystem={turretFilters.addSolarSystem}
        onRemoveSolarSystem={turretFilters.removeSolarSystem}
        onStatusChange={turretFilters.setStatus}
        onClassNameChange={turretFilters.setClassName}
        onSelectedNetworkNodeChange={turretFilters.setSelectedNetworkNode}
        onClearAllFilters={turretFilters.clearAll}
        buildInfo={dashboardBuildInfo}
      />
    </WorldProvider>
  );
}
