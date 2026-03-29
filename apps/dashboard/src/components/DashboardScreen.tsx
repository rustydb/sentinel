import type { TurretData } from '@frontier-sentinel/shared-types';
import { startTransition, useEffect, useRef, useState } from 'react';

import type { NetworkNodeView } from '../hooks/useNetworkNodes';
import type { useTurretEvents } from '../hooks/useTurretEvents';
import type { ResolvedTurretSolarSystem } from '../hooks/useTurretSolarSystems';
import { MapEmbed } from './MapEmbed';
import { NetworkNodeDrawer } from './NetworkNodeDrawer';
import { ResponsiveAddress } from './ResponsiveAddress';
import { TurretDetail } from './TurretDetail';
import { TurretList } from './TurretCard';

type EventHook = ReturnType<typeof useTurretEvents>;

const ACTION_BUTTON_CLASS =
  'sentinel-action-button border-2 border-sentinel-ink px-3 py-2 uppercase';
const DANGER_ACTION_BUTTON_CLASS =
  'sentinel-action-button sentinel-action-button--danger border-2 border-sentinel-danger px-3 py-2 uppercase text-sentinel-danger';

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

interface DashboardScreenProps {
  turrets: TurretData[];
  loading: boolean;
  error: Error | null;
  characterName: string;
  walletAddress: string;
  onDisconnect: () => void;
  selectedTurret: TurretData | null;
  onSelectTurret: (turret: TurretData) => void;
  onCloseTurret: () => void;
  nodes: NetworkNodeView[];
  drawerLoading: boolean;
  eventsState: EventHook;
  solarSystemsByTurretId: Map<string, ResolvedTurretSolarSystem>;
  onAssignSolarSystem: (
    nodeId: string,
    assignment: { solarSystemId: number; solarSystemName: string | null },
  ) => Promise<void>;
  onUnassignSolarSystem: (nodeId: string) => Promise<void>;
  onResetEvents: () => void;
}

export function DashboardScreen({
  turrets,
  loading,
  error,
  characterName,
  walletAddress,
  onDisconnect,
  selectedTurret,
  onSelectTurret,
  onCloseTurret,
  nodes,
  drawerLoading,
  eventsState,
  solarSystemsByTurretId,
  onAssignSolarSystem,
  onUnassignSolarSystem,
  onResetEvents,
}: DashboardScreenProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedTurretSolarSystem = selectedTurret
    ? (solarSystemsByTurretId.get(selectedTurret.id) ?? null)
    : null;
  const highlightedSystemIds = selectedTurret
    ? []
    : [
        ...new Set(
          [...solarSystemsByTurretId.values()]
            .map((entry) => entry.solarSystemId)
            .filter((value): value is number => typeof value === 'number'),
        ),
      ];
  const focusedSystemId = selectedTurretSolarSystem?.solarSystemId ?? null;

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
            <div className="flex flex-wrap items-center gap-3">
              <p>Turrets: {turrets.length}</p>
              <button
                type="button"
                className={ACTION_BUTTON_CLASS}
                onClick={() => setDrawerOpen(true)}
              >
                Network Nodes
              </button>
            </div>
            <div className="mt-3">
              <WalletDropdown
                characterName={characterName}
                walletAddress={walletAddress}
                onDisconnect={onDisconnect}
              />
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="space-y-6">
            {loading ? <LoadingSkeleton /> : null}
            {error ? <DashboardError error={error} /> : null}
            {!loading && !error && turrets.length === 0 ? <EmptyState /> : null}
            {!loading && !error && turrets.length > 0 ? (
              <TurretList
                turrets={turrets}
                solarSystemsByTurretId={solarSystemsByTurretId}
                selectedTurretId={selectedTurret?.id ?? null}
                onSelect={(turret) => {
                  startTransition(() => {
                    onSelectTurret(turret);
                    onResetEvents();
                  });
                }}
              />
            ) : null}
          </section>

          <MapEmbed focusedSystemId={focusedSystemId} highlightedSystemIds={highlightedSystemIds} />
        </div>
      </div>

      <NetworkNodeDrawer
        open={drawerOpen}
        nodes={nodes}
        loading={drawerLoading}
        onClose={() => setDrawerOpen(false)}
        onAssign={onAssignSolarSystem}
        onUnassign={onUnassignSolarSystem}
      />

      <TurretDetail
        turret={selectedTurret}
        currentSolarSystem={selectedTurretSolarSystem}
        eventsState={eventsState}
        onAssignSolarSystem={onAssignSolarSystem}
        onUnassignSolarSystem={onUnassignSolarSystem}
        onClose={onCloseTurret}
      />
    </main>
  );
}
