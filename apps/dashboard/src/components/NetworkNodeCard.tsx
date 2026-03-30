import type { NetworkNodeView } from '../hooks/useNetworkNodes';
import { useState } from 'react';

import { useTypeInfo } from '../hooks/useTypeInfo';
import { ResponsiveAddress } from './ResponsiveAddress';
import { SolarSystemAutocomplete } from './SolarSystemAutocomplete';

interface NetworkNodeCardProps {
  node: NetworkNodeView;
  selected?: boolean;
  onSelect: () => void;
  onAssign: (
    nodeId: string,
    assignment: { solarSystemId: number; solarSystemName: string | null },
  ) => Promise<void>;
  onUnassign: (nodeId: string) => Promise<void>;
}

const THEMED_LOADING_LABEL = 'LOADING ...';

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

export function NetworkNodeCard({
  node,
  selected = false,
  onSelect,
  onAssign,
  onUnassign,
}: NetworkNodeCardProps) {
  const [editing, setEditing] = useState(false);
  const { typeInfo, isLoading, error } = useTypeInfo(node.typeId);
  const customName =
    node.displayName?.trim() && node.displayName.trim().toLowerCase() !== 'network node'
      ? node.displayName.trim()
      : null;
  const hasAssignment = node.solarSystemId > 0;
  const iconAlt = customName ? `${customName.toUpperCase()} icon` : 'Network Node icon';

  return (
    <article
      className={joinClasses(
        'sentinel-interactive-card border-2 border-sentinel-line bg-sentinel-paper p-4 shadow-[6px_6px_0_0_#050608]',
        selected && 'is-selected',
      )}
    >
      <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
        <div className="flex size-14 items-center justify-center overflow-hidden border border-sentinel-line bg-sentinel-panel-inset">
          {error ? (
            <span className="px-1 text-center text-[10px] uppercase tracking-[0.2em] text-sentinel-danger">
              ERROR!
            </span>
          ) : isLoading ? (
            <span className="px-1 text-center text-[10px] uppercase tracking-[0.2em] text-sentinel-muted">
              {THEMED_LOADING_LABEL}
            </span>
          ) : typeInfo?.iconUrl ? (
            <img src={typeInfo.iconUrl} alt={iconAlt} className="h-full w-full object-cover" />
          ) : (
            <span className="px-1 text-center text-[10px] uppercase tracking-[0.2em] text-sentinel-muted">
              NN
            </span>
          )}
        </div>
        <div className="min-w-0">
          {customName ? (
            <ResponsiveAddress
              address={node.nodeId}
              as="div"
              className="w-full min-w-0 text-xs uppercase tracking-[0.3em] text-sentinel-muted"
              copyable={false}
            />
          ) : null}
          <h3 className="mt-2 text-2xl uppercase leading-none">
            {customName ? (
              customName.toUpperCase()
            ) : (
              <ResponsiveAddress
                address={node.nodeId}
                as="div"
                className="w-full min-w-0 uppercase"
                maxAbbreviation={20}
                textClassName="text-[1.4rem] leading-none tracking-[0.12em] text-sentinel-ink"
                copyable={false}
              />
            )}
          </h3>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-sentinel-muted">Solar System</p>
              <p className="mt-1 text-sm uppercase">{node.solarSystemName ?? 'Unassigned'}</p>
              <button
                type="button"
                aria-pressed={selected}
                className={joinClasses(
                  'sentinel-action-button mt-3 border px-2 py-1 text-[9px] uppercase tracking-[0.18em]',
                  selected
                    ? 'border-sentinel-accent bg-sentinel-accent/10 text-sentinel-accent'
                    : 'border-sentinel-line bg-sentinel-panel-inset text-sentinel-ink',
                )}
                onClick={onSelect}
              >
                Filter by node
              </button>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="sentinel-action-button border border-sentinel-ink px-2 py-0.5 text-[9px] uppercase leading-none"
                onClick={(event) => {
                  event.stopPropagation();
                  setEditing((current) => !current);
                }}
              >
                {hasAssignment ? 'Reassign' : 'Assign'}
              </button>
              {hasAssignment ? (
                <button
                  type="button"
                  className="sentinel-action-button sentinel-action-button--danger border border-sentinel-danger px-2 py-0.5 text-[9px] uppercase leading-none text-sentinel-danger"
                  onClick={(event) => {
                    event.stopPropagation();
                    void onUnassign(node.nodeId);
                  }}
                >
                  Unassign
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {editing ? (
        <div
          className="mt-4"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          <SolarSystemAutocomplete
            onSelect={(result) => {
              void onAssign(node.nodeId, {
                solarSystemId: result.id,
                solarSystemName: result.name,
              })
                .then(() => setEditing(false))
                .catch(() => undefined);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : null}
    </article>
  );
}
