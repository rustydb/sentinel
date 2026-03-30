import type { TurretData, TurretIntelligenceSummary } from '@frontier-sentinel/shared-types';
import { useEffect, useState } from 'react';

import type { useTurretEvents } from '../hooks/useTurretEvents';
import type { ResolvedTurretSolarSystem } from '../hooks/useTurretSolarSystems';
import { ResponsiveAddress, isSuiAddress } from './ResponsiveAddress';
import { SolarSystemAutocomplete } from './SolarSystemAutocomplete';
import { useTypeInfo } from '../hooks/useTypeInfo';

type EventHook = ReturnType<typeof useTurretEvents>;
const ACTION_BUTTON_CLASS =
  'sentinel-action-button border border-sentinel-line px-3 py-2 uppercase';
const INLINE_ACTION_BUTTON_CLASS =
  'sentinel-action-button border border-sentinel-line px-2 py-1 text-xs uppercase';
const INLINE_DANGER_ACTION_BUTTON_CLASS =
  'sentinel-action-button sentinel-action-button--danger border border-sentinel-danger px-2 py-1 text-xs uppercase text-sentinel-danger';
const THEMED_LOADING_LABEL = '<SYNCING>';
const closeIconUrl =
  'https://raw.githubusercontent.com/evefrontier/dapps/refs/heads/main/packages/libs/ui-components/assets/close.svg';

interface TurretDetailProps {
  turret: TurretData | null;
  currentSolarSystem: ResolvedTurretSolarSystem | null;
  intelligence: TurretIntelligenceSummary | null;
  eventsState: EventHook;
  onAssignSolarSystem: (
    nodeId: string,
    assignment: { solarSystemId: number; solarSystemName: string | null },
  ) => Promise<void>;
  onUnassignSolarSystem: (nodeId: string) => Promise<void>;
  onClose: () => void;
  panelRef?: (node: HTMLElement | null) => void;
}

export function TurretDetail({
  turret,
  currentSolarSystem,
  intelligence,
  eventsState,
  onAssignSolarSystem,
  onUnassignSolarSystem,
  onClose,
  panelRef,
}: TurretDetailProps) {
  const [editingSolarSystem, setEditingSolarSystem] = useState(false);
  const { typeInfo, isLoading } = useTypeInfo(turret?.typeId);
  const { typeInfo: targetTypeInfo } = useTypeInfo(intelligence?.targetTypeId);
  const [selectedEventKey, setSelectedEventKey] = useState<string | null>(null);

  useEffect(() => {
    if (intelligence?.latestPriorityEvent) {
      setSelectedEventKey(
        `${intelligence.latestPriorityEvent.txDigest}-${intelligence.latestPriorityEvent.eventSeq}`,
      );
      return;
    }

    setSelectedEventKey(null);
  }, [intelligence]);

  if (!turret) {
    return null;
  }

  const currentNodeId = isSuiAddress(turret.energySourceId) ? turret.energySourceId : null;
  const typeName = typeInfo?.name?.trim() ? typeInfo.name.trim() : null;
  const detailTitle =
    typeof turret.name === 'string' && turret.name.trim()
      ? turret.name.trim()
      : (typeName ?? (isLoading ? THEMED_LOADING_LABEL : 'Turret'));
  const displayStatus = intelligence?.statusOverride === 'ENGAGED' ? 'ENGAGED' : turret.status;

  return (
    <aside
      ref={panelRef}
      className="fixed inset-x-0 bottom-0 border-2 border-sentinel-line bg-sentinel-paper p-6 shadow-[0_-6px_0_0_#050608]"
      data-testid="turret-detail"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">
              Selected turret
            </p>
            <h2 className="mt-2 min-w-0 text-3xl uppercase">{detailTitle}</h2>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-sentinel-muted">
              Status <span className="ml-2 text-sentinel-ink">{displayStatus}</span>
            </p>
            <ResponsiveAddress
              address={turret.id}
              as="div"
              className="mt-2 w-full min-w-0 max-w-full"
              copyLabel="turret address"
            />
          </div>
          <button
            className={ACTION_BUTTON_CLASS}
            type="button"
            aria-label="Dismiss turret detail"
            onClick={onClose}
          >
            <img
              src={closeIconUrl}
              alt=""
              aria-hidden="true"
              className="size-4 brightness-0 invert contrast-200"
            />
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="min-w-0 border border-sentinel-line p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Event log</p>
            {eventsState.loading ? (
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-sentinel-muted">
                Syncing event telemetry...
              </p>
            ) : null}
            <ul className="mt-4 space-y-3">
              {eventsState.events.map((event) => (
                <li
                  key={`${event.txDigest}-${event.eventSeq}`}
                  className={`border p-3 ${
                    selectedEventKey === `${event.txDigest}-${event.eventSeq}`
                      ? 'border-sentinel-accent bg-sentinel-panel-inset'
                      : 'border-sentinel-line'
                  }`}
                  onClick={() => setSelectedEventKey(`${event.txDigest}-${event.eventSeq}`)}
                >
                  <p className="text-sm uppercase">{event.eventType}</p>
                  <p className="font-mono text-xs">{event.timestamp}</p>
                </li>
              ))}
            </ul>
            {eventsState.nextPage ? (
              <button
                type="button"
                className={`mt-4 ${ACTION_BUTTON_CLASS}`}
                onClick={eventsState.next}
              >
                Load more
              </button>
            ) : null}
          </section>

          <section className="min-w-0 border border-sentinel-line p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">
              Latest Target Intelligence
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="border border-sentinel-line bg-sentinel-panel-inset p-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-sentinel-muted">
                  Target
                </p>
                <p className="mt-2 text-lg uppercase">
                  {intelligence?.targetDisplayName ?? 'No Contact'}
                </p>
              </div>
              <div className="border border-sentinel-line bg-sentinel-panel-inset p-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-sentinel-muted">
                  Aggressor
                </p>
                <p className="mt-2 text-lg uppercase">
                  {intelligence?.isAggressor == null
                    ? 'Unknown'
                    : intelligence.isAggressor
                      ? 'Yes'
                      : 'No'}
                </p>
              </div>
              <div className="border border-sentinel-line bg-sentinel-panel-inset p-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-sentinel-muted">Tribe</p>
                <p className="mt-2 text-lg uppercase">{intelligence?.tribeName ?? 'Unknown'}</p>
              </div>
              <div className="border border-sentinel-line bg-sentinel-panel-inset p-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-sentinel-muted">
                  Target Type
                </p>
                <div className="mt-2 flex items-center gap-3">
                  {targetTypeInfo?.iconUrl ? (
                    <img
                      src={targetTypeInfo.iconUrl}
                      alt={`${targetTypeInfo.name} icon`}
                      className="size-10 border border-sentinel-line object-cover object-center"
                    />
                  ) : null}
                  <p className="text-lg uppercase">
                    {targetTypeInfo?.name ??
                      (intelligence?.targetTypeId ? THEMED_LOADING_LABEL : 'Unknown')}
                  </p>
                </div>
              </div>
            </div>
            {intelligence?.latestPriorityEvent ? (
              <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-sentinel-muted">
                Source Event {intelligence.latestPriorityEvent.txDigest}#
                {intelligence.latestPriorityEvent.eventSeq}
              </p>
            ) : null}
          </section>

          <section className="min-w-0 border border-sentinel-line p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">
              Node assignment
            </p>
            <div className="mt-3 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                {currentNodeId ? (
                  <ResponsiveAddress
                    address={currentNodeId}
                    as="div"
                    className="w-full min-w-0 max-w-full text-lg"
                    copyLabel="assigned node address"
                  />
                ) : (
                  <p className="text-lg uppercase">{turret.energySourceId}</p>
                )}
              </div>
              {currentNodeId ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className={INLINE_ACTION_BUTTON_CLASS}
                    onClick={() => setEditingSolarSystem((current) => !current)}
                  >
                    {currentSolarSystem?.solarSystemId ? 'Reassign' : 'Assign'}
                  </button>
                  {currentSolarSystem?.solarSystemId ? (
                    <button
                      type="button"
                      className={INLINE_DANGER_ACTION_BUTTON_CLASS}
                      onClick={() => {
                        void onUnassignSolarSystem(currentNodeId);
                      }}
                    >
                      Unassign
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Solar System</p>
              <p className="mt-2 text-lg uppercase">
                {currentSolarSystem?.solarSystemName ?? 'Unassigned'}
              </p>
            </div>
            {editingSolarSystem && currentNodeId ? (
              <div className="mt-4">
                <SolarSystemAutocomplete
                  initialQuery={currentSolarSystem?.solarSystemName ?? ''}
                  onSelect={(result) => {
                    void onAssignSolarSystem(currentNodeId, {
                      solarSystemId: result.id,
                      solarSystemName: result.name,
                    })
                      .then(() => setEditingSolarSystem(false))
                      .catch(() => undefined);
                  }}
                  onCancel={() => setEditingSolarSystem(false)}
                />
              </div>
            ) : null}
            {currentSolarSystem?.resolutionSource === 'retained' ? (
              <p className="mt-4 border border-sentinel-line bg-sentinel-panel-inset px-3 py-2 text-xs uppercase">
                Using retained solar-system mapping from the last assigned network node.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </aside>
  );
}
