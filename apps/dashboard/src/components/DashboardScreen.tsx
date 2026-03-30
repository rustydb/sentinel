import type {
  ShellStatisticsSnapshot,
  TurretData,
  TurretIntelligenceSummary,
} from '@sentinel/shared-types';
import { startTransition, useEffect, useRef, useState } from 'react';

import sentinelLogo from '../../../../assets/logo.svg';
import type { NetworkNodeView } from '../hooks/useNetworkNodes';
import type { UseTurretEventsResult } from '../hooks/useTurretEvents';
import type {
  DisplayTurretStatus,
  TurretFilterOption,
  TurretFilterState,
} from '../hooks/useTurretFilters';
import type { ResolvedTurretSolarSystem } from '../hooks/useTurretSolarSystems';
import { MapEmbed } from './MapEmbed';
import { NetworkNodeDrawer } from './NetworkNodeDrawer';
import { ResponsiveAddress } from './ResponsiveAddress';
import { StatisticsPanel } from './StatisticsPanel';
import { TurretFilterBar } from './TurretFilterBar';
import { TurretDetail } from './TurretDetail';
import { TurretList } from './TurretCard';

const ACTION_BUTTON_CLASS =
  'sentinel-action-button border border-sentinel-line px-3 py-2 uppercase';
const HEADER_ACTION_BUTTON_CLASS = `${ACTION_BUTTON_CLASS} text-[10px] tracking-[0.22em]`;
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
      No turret assemblies detected in this operational footprint.
    </div>
  );
}

function FilteredEmptyState({ onClearAll }: { onClearAll: () => void }) {
  return (
    <div className="border-2 border-dashed border-sentinel-line bg-sentinel-shell/70 p-8 text-center uppercase">
      <p>No turrets match the current criteria.</p>
      <p className="mt-2 text-sm text-sentinel-muted">Remove some filters for better results.</p>
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          className="sentinel-action-button border border-sentinel-line px-3 py-2 uppercase"
          onClick={onClearAll}
        >
          Clear all filters
        </button>
      </div>
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
    <div ref={menuRef} className="relative min-w-0 shrink-0">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        className={`${HEADER_ACTION_BUTTON_CLASS} flex min-w-[12rem] max-w-[16rem] items-center justify-between gap-3`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="truncate normal-case tracking-normal">{characterName}</span>
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
  totalTurrets?: number;
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
  filters?: TurretFilterState;
  hasActiveFilters?: boolean;
  statusOptions?: TurretFilterOption[];
  classOptions?: TurretFilterOption[];
  selectedNetworkNode?: NetworkNodeView | null;
  onSearchTextChange?: (value: string) => void;
  onSolarSystemQueryChange?: (value: string) => void;
  onAddSolarSystem?: (value: string) => void;
  onRemoveSolarSystem?: (value: string) => void;
  onStatusChange?: (value: DisplayTurretStatus | null) => void;
  onClassNameChange?: (value: string | null) => void;
  onSelectedNetworkNodeChange?: (nodeId: string | null) => void;
  onClearAllFilters?: () => void;
}

export function DashboardScreen({
  turrets,
  totalTurrets = turrets.length,
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
  filters,
  hasActiveFilters = false,
  statusOptions = [],
  classOptions = [],
  selectedNetworkNode = null,
  onSearchTextChange = () => undefined,
  onSolarSystemQueryChange = () => undefined,
  onAddSolarSystem = () => undefined,
  onRemoveSolarSystem = () => undefined,
  onStatusChange = () => undefined,
  onClassNameChange = () => undefined,
  onSelectedNetworkNodeChange = () => undefined,
  onClearAllFilters = () => undefined,
}: DashboardScreenProps) {
  const filterState: TurretFilterState = filters ?? {
    searchText: '',
    solarSystemQuery: '',
    solarSystems: [],
    selectedNetworkNodeId: null,
    statuses: [],
    classNames: [],
  };
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
  }, [detailPanelHeight, selectedTurret, turrets]);

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
          <div className="grid items-center gap-3 xl:grid-cols-[auto_minmax(0,1fr)_auto]">
            <div className="flex shrink-0 items-center">
              <img
                src={sentinelLogo}
                alt="Sentinel logo"
                className="h-10 w-10 border border-sentinel-line bg-sentinel-panel object-cover object-center p-1"
              />
            </div>
            <div className="min-w-0 xl:justify-self-stretch">
              <TurretFilterBar
                filters={filterState}
                statusOptions={statusOptions}
                classOptions={classOptions}
                selectedNetworkNode={selectedNetworkNode}
                hasActiveFilters={hasActiveFilters}
                onSearchTextChange={onSearchTextChange}
                onSolarSystemQueryChange={onSolarSystemQueryChange}
                onAddSolarSystem={onAddSolarSystem}
                onRemoveSolarSystem={onRemoveSolarSystem}
                onStatusChange={onStatusChange}
                onClassNameChange={onClassNameChange}
                onClearSelectedNetworkNode={() => onSelectedNetworkNodeChange(null)}
                onClearAll={onClearAllFilters}
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 xl:flex-nowrap">
              <button
                type="button"
                className={`${HEADER_ACTION_BUTTON_CLASS} shrink-0`}
                onClick={() => setDrawerOpen(true)}
              >
                Network Nodes
              </button>
              <WalletDropdown
                characterName={characterName}
                walletAddress={walletAddress}
                onDisconnect={onDisconnect}
              />
              <button
                type="button"
                className={`${HEADER_ACTION_BUTTON_CLASS} flex shrink-0 items-center justify-between gap-2`}
                aria-expanded={!metricsCollapsed}
                aria-controls="dashboard-metrics-panel"
                aria-label={metricsCollapsed ? 'Expand metrics' : 'Collapse metrics'}
                onClick={() => setMetricsCollapsed((current) => !current)}
              >
                <span>Metrics</span>
                <span aria-hidden="true" className="text-base leading-none">
                  {metricsCollapsed ? '▾' : '▴'}
                </span>
              </button>
            </div>
          </div>
          {!metricsCollapsed ? (
            <div className="mt-4 border-t border-sentinel-line pt-4" id="dashboard-metrics-panel">
              <StatisticsPanel stats={stats} />
            </div>
          ) : null}
        </header>

        <div className="grid gap-8 xl:grid-cols-[1.35fr_0.65fr]">
          <section className="space-y-6">
            {loading ? <LoadingSkeleton /> : null}
            {error ? <DashboardError error={error} /> : null}
            {!loading && !error && totalTurrets === 0 ? <EmptyState /> : null}
            {!loading && !error && totalTurrets > 0 && turrets.length === 0 ? (
              <FilteredEmptyState onClearAll={onClearAllFilters} />
            ) : null}
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
            {!loading &&
            !error &&
            selectedTurret &&
            !turrets.some((turret) => turret.id === selectedTurret.id) ? (
              <div className="border border-sentinel-line bg-sentinel-panel-inset p-4 text-sm uppercase">
                Selected turret is hidden by the current filters.
              </div>
            ) : null}
          </section>

          <div className="xl:sticky xl:top-[9.5rem] xl:self-start">
            <MapEmbed
              focusedSystemId={focusedSystemId}
              highlightedSystemIds={highlightedSystemIds}
            />
          </div>
        </div>
        <footer className="mt-8 border-t border-sentinel-line pt-6 text-xs font-mono text-sentinel-muted uppercase">
          <p>
            Sentinel is in prerelease, and to report all issues to{' '}
            <a
              href="https://github.com/rustydb/sentinel/issues"
              target="_blank"
              rel="noreferrer"
              className="text-sentinel-glow underline"
            >
              GitHub
            </a>
            . EVE Frontier is a registered trademark of CCP hf. All rights reserved in all
            jurisdictions. Sentinel is not affiliated with CCP.
          </p>
        </footer>
      </div>

      <NetworkNodeDrawer
        open={drawerOpen}
        nodes={nodes}
        loading={drawerLoading}
        selectedNodeId={filterState.selectedNetworkNodeId}
        onClose={() => setDrawerOpen(false)}
        onSelectNode={onSelectedNetworkNodeChange}
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
