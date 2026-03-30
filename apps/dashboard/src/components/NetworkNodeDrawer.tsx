import type { NetworkNodeView } from '../hooks/useNetworkNodes';

import { NetworkNodeCard } from './NetworkNodeCard';

const closeIconUrl =
  'https://raw.githubusercontent.com/evefrontier/dapps/refs/heads/main/packages/libs/ui-components/assets/close.svg';

interface NetworkNodeDrawerProps {
  open: boolean;
  nodes: NetworkNodeView[];
  loading?: boolean;
  selectedNodeId?: string | null;
  onClose: () => void;
  onSelectNode: (nodeId: string | null) => void;
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
  selectedNodeId = null,
  onClose,
  onSelectNode,
  onAssign,
  onUnassign,
}: NetworkNodeDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Dismiss network nodes drawer"
        className="fixed inset-0 z-20 bg-black/35 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <aside className="fixed inset-y-0 right-0 z-30 flex w-[min(100vw,32rem)] max-w-xl flex-col border-l-2 border-sentinel-line bg-sentinel-shell/98 p-5 shadow-[-8px_0_0_0_#050608] backdrop-blur-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Infrastructure</p>
            <h2 className="mt-2 text-2xl uppercase">Network Nodes</h2>
          </div>
          <button
            type="button"
            className="sentinel-action-button border-2 border-sentinel-ink px-2.5 py-1.5 text-sm uppercase"
            aria-label="Dismiss network nodes drawer"
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

        <div className="mt-5 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <p className="uppercase tracking-[0.3em] text-sentinel-muted">
              Syncing network nodes...
            </p>
          ) : null}
          {!loading && nodes.length === 0 ? (
            <div className="border-2 border-dashed border-sentinel-line bg-sentinel-panel p-5 text-center uppercase">
              No current network nodes detected.
            </div>
          ) : null}
          {!loading ? (
            <div className="space-y-3">
              {nodes.map((node) => (
                <NetworkNodeCard
                  key={node.nodeId}
                  node={node}
                  selected={selectedNodeId === node.nodeId}
                  onSelect={() => onSelectNode(selectedNodeId === node.nodeId ? null : node.nodeId)}
                  onAssign={onAssign}
                  onUnassign={onUnassign}
                />
              ))}
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
}
