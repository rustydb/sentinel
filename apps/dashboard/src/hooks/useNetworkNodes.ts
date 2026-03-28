import type { NetworkNodeMapping } from '@frontier-sentinel/shared-types';
import { startTransition, useEffect, useState } from 'react';

interface UseNetworkNodesOptions {
  apiBaseUrl?: string;
  enabled?: boolean;
}

interface NetworkNodesResponse {
  data?: NetworkNodeMapping[];
}

function isNetworkNodeMapping(value: unknown): value is NetworkNodeMapping {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof (value as { nodeId?: unknown }).nodeId === 'string' &&
    typeof (value as { solarSystemId?: unknown }).solarSystemId === 'number'
  );
}

function parseNetworkNodesPayload(payload: unknown): NetworkNodeMapping[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const data = (payload as NetworkNodesResponse).data;
  return Array.isArray(data) ? data.filter(isNetworkNodeMapping) : [];
}

export function useNetworkNodes({ apiBaseUrl = '', enabled = true }: UseNetworkNodesOptions = {}) {
  const [nodes, setNodes] = useState<NetworkNodeMapping[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  async function refresh(): Promise<void> {
    if (!enabled) {
      setNodes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/api/network-nodes`);
      const payload: unknown = await response.json();
      startTransition(() => {
        setNodes(parseNetworkNodesPayload(payload));
        setError(null);
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason : new Error('Failed to fetch network nodes'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!enabled) {
      setNodes([]);
      setLoading(false);
      return;
    }

    void refresh();
  }, [apiBaseUrl, enabled]);

  async function assignNode(nodeId: string, solarSystemId: number): Promise<void> {
    if (!enabled) {
      return;
    }

    await fetch(`${apiBaseUrl}/api/network-nodes/${nodeId}/solar-system`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ solarSystemId }),
    });
    await refresh();
  }

  async function unassignNode(nodeId: string): Promise<void> {
    if (!enabled) {
      return;
    }

    await fetch(`${apiBaseUrl}/api/network-nodes/${nodeId}/solar-system`, { method: 'DELETE' });
    await refresh();
  }

  return { nodes, loading, error, refresh, assignNode, unassignNode };
}
