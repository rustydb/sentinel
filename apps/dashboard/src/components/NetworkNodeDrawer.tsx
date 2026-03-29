import type { NetworkNodeView } from '../hooks/useNetworkNodes';

import { NetworkNodeCard } from './NetworkNodeCard';

interface NetworkNodeDrawerProps {
  open: boolean;
  nodes: NetworkNodeView[];
  loading?: boolean;
  onClose: () => void;
  onAssign: (
    nodeId: string,
    assignment: { solarSystemId: number; solarSystemName: string | null },
  ) => Promise<void>;
  onUnassign: (nodeId: string) => Promise<void>;
}

export function NetworkNodeDrawer({
  open,
  nodes,
  loading = false,
  onClose,
  onAssign,
  onUnassign,
}: NetworkNodeDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-30 flex w-full max-w-xl flex-col border-l-4 border-sentinel-ink bg-sentinel-paper p-6 shadow-[-12px_0_0_0_#111111]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Infrastructure</p>
          <h2 className="mt-2 text-3xl uppercase">Network Nodes</h2>
        </div>
        <button
          type="button"
          className="sentinel-action-button border-2 border-sentinel-ink px-3 py-2 uppercase"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <div className="mt-6 flex-1 overflow-y-auto">
        {loading ? <p className="uppercase">Loading network nodes...</p> : null}
        {!loading && nodes.length === 0 ? (
          <div className="border-4 border-dashed border-sentinel-ink p-6 text-center uppercase">
            No current network nodes detected.
          </div>
        ) : null}
        {!loading ? (
          <div className="space-y-4">
            {nodes.map((node) => (
              <NetworkNodeCard
                key={node.nodeId}
                node={node}
                onAssign={onAssign}
                onUnassign={onUnassign}
              />
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
