import type {
  ShellStatisticsSnapshot,
  TurretData,
  TurretIntelligenceSummary,
} from '@frontier-sentinel/shared-types';
import { startTransition, useEffect, useRef, useState } from 'react';

import frontierSentinelLogo from '../../../../assets/logo.svg';
import type { NetworkNodeView } from '../hooks/useNetworkNodes';
import type { UseTurretEventsResult } from '../hooks/useTurretEvents';
import type { ResolvedTurretSolarSystem } from '../hooks/useTurretSolarSystems';
import { MapEmbed } from './MapEmbed';
import { NetworkNodeDrawer } from './NetworkNodeDrawer';
import { ResponsiveAddress } from './ResponsiveAddress';
import { StatisticsPanel } from './StatisticsPanel';
import { TurretDetail } from './TurretDetail';
import { TurretList } from './TurretCard';

const ACTION_BUTTON_CLASS =
  'sentinel-action-button border border-sentinel-line px-3 py-2 uppercase';
const DANGER_ACTION_BUTTON_CLASS =
  'sentinel-action-button sentinel-action-button--danger border-2 border-sentinel-danger px-3 py-2 uppercase text-sentinel-danger';

function DashboardError({ error }: { error: Error }) {
  return (
    <div className="border-2 border-sentinel-danger bg-sentinel-shell p-6 text-sentinel-danger shadow-[6px_6px_0_0_#050608]">
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
          className="h-48 animate-pulse border-2 border-sentinel-line bg-sentinel-paper p-5 shadow-[6px_6px_0_0_#050608]"
        />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="border-2 border-dashed border-sentinel-line bg-sentinel-shell/70 p-8 text-center uppercase">
      No turret assemblies detected in this frontier footprint.
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
        <span className="truncate normal-case">{characterName}</span>
        <span aria-hidden="true" className="text-lg leading-none">
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-20 mt-3 flex min-w-[22rem] max-w-[26rem] flex-col gap-4 border-2 border-sentinel-line bg-sentinel-panel p-5 shadow-[6px_6px_0_0_#050608]"
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
  eventsState: UseTurretEventsResult;
  solarSystemsByTurretId: Map<string, ResolvedTurretSolarSystem>;
  turretIntelligenceByTurretId: Map<string, TurretIntelligenceSummary>;
  stats: ShellStatisticsSnapshot;
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
  turretIntelligenceByTurretId,
  stats,
  onAssignSolarSystem,
  onUnassignSolarSystem,
  onResetEvents,
}: DashboardScreenProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [metricsCollapsed, setMetricsCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.innerWidth < 1024;
  });
  const headerRef = useRef<HTMLElement | null>(null);
  const [detailPanelElement, setDetailPanelElement] = useState<HTMLElement | null>(null);
  const [detailPanelHeight, setDetailPanelHeight] = useState(0);

  const selectedTurretSolarSystem: ResolvedTurretSolarSystem | null = selectedTurret
    ? (solarSystemsByTurretId.get(selectedTurret.id) ?? null)
    : null;
  const selectedTurretIntelligence: TurretIntelligenceSummary | null = selectedTurret
    ? (turretIntelligenceByTurretId.get(selectedTurret.id) ?? null)
    : null;
  const highlightedSystemIds: number[] = selectedTurret
    ? []
    : [
        ...new Set(
          [...solarSystemsByTurretId.values()]
            .map((entry) => entry.solarSystemId)
            .filter((value): value is number => typeof value === 'number'),
        ),
      ];
  const focusedSystemId = selectedTurretSolarSystem?.solarSystemId ?? null;
  const detailPanelPaddingBottom = selectedTurret
    ? `${Math.max(detailPanelHeight + 96, 640)}px`
    : undefined;

  useEffect(() => {
    if (!selectedTurret || !(detailPanelElement instanceof HTMLElement)) {
      setDetailPanelHeight(0);
      return;
    }

    const updateDetailPanelHeight = (height?: number) => {
      if (typeof height === 'number' && height > 0) {
        setDetailPanelHeight(height);
        return;
      }

      setDetailPanelHeight(detailPanelElement.getBoundingClientRect().height);
    };

    updateDetailPanelHeight();

    const observer = new ResizeObserver((entries) => {
      updateDetailPanelHeight(entries[0]?.contentRect.height);
    });

    observer.observe(detailPanelElement);

    return () => {
      observer.disconnect();
    };
  }, [detailPanelElement, selectedTurret]);

  useEffect(() => {
    if (!selectedTurret || detailPanelHeight <= 0 || typeof window === 'undefined') {
      return;
    }

    const selectedCard = document.querySelector<HTMLElement>(
      `[data-testid="turret-card-${selectedTurret.id}"]`,
    );
    if (!(selectedCard instanceof HTMLElement)) {
      return;
    }

    const safeTop = (headerRef.current?.getBoundingClientRect().bottom ?? 0) + 24;
    const safeBottom = window.innerHeight - detailPanelHeight - 24;
    const cardBounds = selectedCard.getBoundingClientRect();

    if (cardBounds.bottom > safeBottom) {
      window.scrollBy({
        top: cardBounds.bottom - safeBottom,
        behavior: 'smooth',
      });
      return;
    }

    if (cardBounds.top < safeTop) {
      window.scrollBy({
        top: cardBounds.top - safeTop,
        behavior: 'smooth',
      });
    }
  }, [detailPanelHeight, selectedTurret]);

  return (
    <main
      className="min-h-screen bg-sentinel-canvas px-6 py-8 text-sentinel-ink"
      style={detailPanelPaddingBottom ? { paddingBottom: detailPanelPaddingBottom } : undefined}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header
          ref={headerRef}
          className="sticky top-4 z-30 border-2 border-sentinel-line bg-sentinel-shell/95 px-4 py-3 backdrop-blur-sm"
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <img
                  src={frontierSentinelLogo}
                  alt="Frontier Sentinel logo"
                  className="h-10 w-10 border border-sentinel-line bg-sentinel-panel object-cover object-center p-1"
                />
                <div className="min-w-0">
                  <h1 className="text-lg uppercase text-sentinel-glow sm:text-xl">
                    Frontier Sentinel
                  </h1>
                </div>
              </div>
            </div>
            <div className="flex w-full max-w-2xl flex-col items-stretch gap-2 text-sm uppercase lg:items-end">
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
                <WalletDropdown
                  characterName={characterName}
                  walletAddress={walletAddress}
                  onDisconnect={onDisconnect}
                />
                <button
                  type="button"
                  className={`${ACTION_BUTTON_CLASS} w-full sm:w-auto`}
                  onClick={() => setDrawerOpen(true)}
                >
                  Network Nodes
                </button>
                <button
                  type="button"
                  className={`${ACTION_BUTTON_CLASS} flex w-full items-center justify-between gap-2 sm:w-auto`}
                  aria-expanded={!metricsCollapsed}
                  aria-controls="dashboard-metrics-panel"
                  aria-label={metricsCollapsed ? 'Expand metrics' : 'Collapse metrics'}
                  onClick={() => setMetricsCollapsed((current) => !current)}
                >
                  <span className="tracking-[0.25em]">Metrics</span>
                  <span aria-hidden="true" className="text-base leading-none">
                    {metricsCollapsed ? '▾' : '▴'}
                  </span>
                </button>
              </div>
            </div>
          </div>
          <div className="mt-4">
            {!metricsCollapsed ? (
              <div className="mt-3" id="dashboard-metrics-panel">
                <StatisticsPanel stats={stats} />
              </div>
            ) : null}
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
                turretIntelligenceByTurretId={turretIntelligenceByTurretId}
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

          <div className="xl:sticky xl:top-[9.5rem] xl:self-start">
            <MapEmbed
              focusedSystemId={focusedSystemId}
              highlightedSystemIds={highlightedSystemIds}
            />
          </div>
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
        intelligence={selectedTurretIntelligence}
        eventsState={eventsState}
        onAssignSolarSystem={onAssignSolarSystem}
        onUnassignSolarSystem={onUnassignSolarSystem}
        onClose={onCloseTurret}
        panelRef={setDetailPanelElement}
      />
    </main>
  );
}
