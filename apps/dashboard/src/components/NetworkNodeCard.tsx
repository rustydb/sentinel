import type { NetworkNodeView } from '../hooks/useNetworkNodes';
import { useState } from 'react';

import { useTypeInfo } from '../hooks/useTypeInfo';
import { ResponsiveAddress } from './ResponsiveAddress';
import { SolarSystemAutocomplete } from './SolarSystemAutocomplete';

interface NetworkNodeCardProps {
  node: NetworkNodeView;
  onAssign: (
    nodeId: string,
    assignment: { solarSystemId: number; solarSystemName: string | null },
  ) => Promise<void>;
  onUnassign: (nodeId: string) => Promise<void>;
}

export function NetworkNodeCard({ node, onAssign, onUnassign }: NetworkNodeCardProps) {
  const [editing, setEditing] = useState(false);
  const typeInfo = useTypeInfo(node.typeId);
  const displayName = node.displayName ?? typeInfo?.name ?? 'Network Node';
  const hasAssignment = node.solarSystemId > 0;

  return (
    <article className="border-4 border-sentinel-ink bg-sentinel-paper p-4 shadow-[8px_8px_0_0_#111111]">
      <div className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-3">
        <div className="flex size-14 items-center justify-center overflow-hidden border-2 border-sentinel-ink bg-white">
          {typeInfo?.iconUrl ? (
            <img
              src={typeInfo.iconUrl}
              alt={`${displayName} icon`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-1 text-center text-[10px] uppercase tracking-[0.2em] text-sentinel-muted">
              NN
            </span>
          )}
        </div>
        <div className="min-w-0">
          <ResponsiveAddress
            address={node.nodeId}
            as="div"
            className="w-full min-w-0 text-xs uppercase tracking-[0.3em] text-sentinel-muted"
            copyable={false}
          />
          <h3 className="mt-2 text-2xl uppercase">{displayName}</h3>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-sentinel-muted">
            Solar System
          </p>
          <p className="mt-1 text-sm uppercase">{node.solarSystemName ?? 'Unassigned'}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          className="sentinel-action-button border-2 border-sentinel-ink px-3 py-2 uppercase"
          onClick={() => setEditing((current) => !current)}
        >
          {hasAssignment ? 'Reassign' : 'Assign'}
        </button>
        {hasAssignment ? (
          <button
            type="button"
            className="sentinel-action-button sentinel-action-button--danger border-2 border-sentinel-danger px-3 py-2 uppercase text-sentinel-danger"
            onClick={() => {
              void onUnassign(node.nodeId);
            }}
          >
            Unassign
          </button>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-4">
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
