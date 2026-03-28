import type { NetworkNodeMapping, TurretData } from '@frontier-sentinel/shared-types';

import type { useTurretEvents } from '../hooks/useTurretEvents';
import { ResponsiveAddress, isSuiAddress } from './ResponsiveAddress';

type EventHook = ReturnType<typeof useTurretEvents>;

interface TurretDetailProps {
  turret: TurretData | null;
  nodes: NetworkNodeMapping[];
  eventsState: EventHook;
  onAssignNode: (nodeId: string, solarSystemId: number) => Promise<void>;
  onUnassignNode: (nodeId: string) => Promise<void>;
  onClose: () => void;
  onLocationSelect: (systemId: number) => void;
}

export function TurretDetail({
  turret,
  nodes,
  eventsState,
  onAssignNode,
  onUnassignNode,
  onClose,
  onLocationSelect,
}: TurretDetailProps) {
  if (!turret) {
    return null;
  }

  const currentNode = nodes.find((node) => node.nodeId === turret.energySourceId);
  const locationTarget = currentNode?.solarSystemId ?? 31000000;

  return (
    <aside
      className="fixed inset-x-0 bottom-0 border-4 border-sentinel-ink bg-sentinel-paper p-6"
      data-testid="turret-detail"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">
              Selected turret
            </p>
            <h2 className="mt-2 text-3xl uppercase">{turret.name ?? turret.id}</h2>
            <ResponsiveAddress
              address={turret.id}
              as="div"
              className="mt-2 max-w-full"
              copyLabel="turret address"
            />
          </div>
          <button
            className="border-2 border-sentinel-ink px-3 py-2 uppercase"
            type="button"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="border-2 border-sentinel-ink p-4">
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
                className="mt-4 border-2 border-sentinel-ink px-3 py-2 uppercase"
                onClick={eventsState.next}
              >
                Load more
              </button>
            ) : null}
          </section>

          <section className="border-2 border-sentinel-ink p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">
              Node assignment
            </p>
            {isSuiAddress(turret.energySourceId) ? (
              <ResponsiveAddress
                address={turret.energySourceId}
                as="div"
                className="mt-3 max-w-full text-lg"
                copyLabel="assigned node address"
              />
            ) : (
              <p className="mt-3 text-lg uppercase">{turret.energySourceId}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {nodes.map((node) => (
                <div
                  key={node.nodeId}
                  className="flex min-w-0 items-center gap-2 border-2 border-sentinel-ink bg-white px-3 py-2"
                >
                  {isSuiAddress(node.nodeId) ? (
                    <ResponsiveAddress
                      address={node.nodeId}
                      as="div"
                      className="min-w-0 max-w-56 flex-1"
                      copyLabel="available node address"
                    />
                  ) : (
                    <span>{node.nodeId}</span>
                  )}
                  <button
                    type="button"
                    className="border-2 border-sentinel-ink px-2 py-1 uppercase"
                    aria-label={`Assign ${node.nodeId}`}
                    onClick={() => {
                      void onAssignNode(node.nodeId, node.solarSystemId);
                    }}
                  >
                    Assign
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 border-2 border-sentinel-danger px-3 py-2 uppercase text-sentinel-danger"
              onClick={() => {
                void onUnassignNode(turret.energySourceId);
              }}
            >
              Unassign node
            </button>
            <button
              type="button"
              className="mt-4 block border-2 border-sentinel-ink px-3 py-2 uppercase"
              onClick={() => onLocationSelect(locationTarget)}
            >
              View system on map
            </button>
          </section>
        </div>
      </div>
    </aside>
  );
}
