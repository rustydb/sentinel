import type { TurretData } from '@frontier-sentinel/shared-types';
import { useState } from 'react';

import type { useTurretEvents } from '../hooks/useTurretEvents';
import type { ResolvedTurretSolarSystem } from '../hooks/useTurretSolarSystems';
import { ResponsiveAddress, isSuiAddress } from './ResponsiveAddress';
import { SolarSystemAutocomplete } from './SolarSystemAutocomplete';

type EventHook = ReturnType<typeof useTurretEvents>;
const ACTION_BUTTON_CLASS =
  'sentinel-action-button border-2 border-sentinel-ink px-3 py-2 uppercase';
const INLINE_ACTION_BUTTON_CLASS =
  'sentinel-action-button border-2 border-sentinel-ink px-2 py-1 text-xs uppercase';
const INLINE_DANGER_ACTION_BUTTON_CLASS =
  'sentinel-action-button sentinel-action-button--danger border-2 border-sentinel-danger px-2 py-1 text-xs uppercase text-sentinel-danger';

interface TurretDetailProps {
  turret: TurretData | null;
  currentSolarSystem: ResolvedTurretSolarSystem | null;
  eventsState: EventHook;
  onAssignSolarSystem: (
    nodeId: string,
    assignment: { solarSystemId: number; solarSystemName: string | null },
  ) => Promise<void>;
  onUnassignSolarSystem: (nodeId: string) => Promise<void>;
  onClose: () => void;
}

export function TurretDetail({
  turret,
  currentSolarSystem,
  eventsState,
  onAssignSolarSystem,
  onUnassignSolarSystem,
  onClose,
}: TurretDetailProps) {
  const [editingSolarSystem, setEditingSolarSystem] = useState(false);

  if (!turret) {
    return null;
  }

  const currentNodeId = isSuiAddress(turret.energySourceId) ? turret.energySourceId : null;

  return (
    <aside
      className="fixed inset-x-0 bottom-0 border-4 border-sentinel-ink bg-sentinel-paper p-6"
      data-testid="turret-detail"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">
              Selected turret
            </p>
            <h2 className="mt-2 text-3xl uppercase">{turret.name ?? turret.id}</h2>
            <ResponsiveAddress
              address={turret.id}
              as="div"
              className="mt-2 w-full min-w-0 max-w-full"
              copyLabel="turret address"
            />
          </div>
          <button className={ACTION_BUTTON_CLASS} type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="min-w-0 border-2 border-sentinel-ink p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Event log</p>
            {eventsState.loading ? <p className="mt-4">Loading events...</p> : null}
            <ul className="mt-4 space-y-3">
              {eventsState.events.map((event) => (
                <li
                  key={`${event.txDigest}-${event.eventSeq}`}
                  className="border-2 border-sentinel-ink p-3"
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

          <section className="min-w-0 border-2 border-sentinel-ink p-4">
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
              <p className="mt-4 border-2 border-sentinel-ink bg-white px-3 py-2 text-xs uppercase">
                Using retained solar-system mapping from the last assigned network node.
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </aside>
  );
}
