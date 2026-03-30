import { GET_OBJECT_WITH_JSON, type NetworkNodeMapping } from '@sentinel/shared-types';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';

interface UseNetworkNodesOptions {
  apiBaseUrl?: string;
  graphQlEndpoint?: string;
  candidateNodeIds?: string[];
  enabled?: boolean;
  refreshTick?: number;
}

interface NetworkNodesResponse {
  data?: NetworkNodeMapping[];
}

interface NetworkNodeObjectPayload {
  data?: {
    object?: {
      address?: string;
      asMoveObject?: {
        contents?: {
          type?: {
            repr?: string;
          };
          json?: Record<string, unknown>;
        };
      };
    };
  };
}

export interface NetworkNodeView extends NetworkNodeMapping {
  typeId: string | null;
  displayName: string | null;
}

function isSuiAddress(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{64}$/.test(value);
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

function parseNodeObjects(payload: unknown): Array<{
  nodeId: string;
  typeId: string | null;
  displayName: string | null;
}> {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const node = (payload as NetworkNodeObjectPayload).data?.object;
  if (!node) {
    return [];
  }

  const json = node.asMoveObject?.contents?.json ?? {};
  const metadata = (json.metadata as Record<string, unknown> | undefined) ?? {};
  const candidateName =
    typeof metadata.name === 'string' && metadata.name.trim() ? metadata.name.trim() : null;
  const rawTypeId = json.type_id;
  const typeId =
    typeof rawTypeId === 'string'
      ? rawTypeId
      : typeof rawTypeId === 'number'
        ? String(rawTypeId)
        : null;

  return [
    {
      nodeId: typeof node.address === 'string' ? node.address : '',
      typeId,
      displayName: candidateName,
    },
  ].filter((entry) => entry.nodeId);
}

export function useNetworkNodes({
  apiBaseUrl = '',
  graphQlEndpoint = '/graphql',
  candidateNodeIds = [],
  enabled = true,
  refreshTick = 0,
}: UseNetworkNodesOptions = {}) {
  const [mappings, setMappings] = useState<NetworkNodeMapping[]>([]);
  const [nodes, setNodes] = useState<NetworkNodeView[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);
  const hasLoadedOnceRef = useRef(false);
  const queryKeyRef = useRef<string | null>(null);

  const normalizedCandidateNodeIds = useMemo(
    () => [...new Set(candidateNodeIds.filter((nodeId) => isSuiAddress(nodeId)))],
    [candidateNodeIds.join(',')],
  );

  async function refresh(): Promise<void> {
    if (!enabled) {
      setNodes([]);
      setMappings([]);
      setLoading(false);
      hasLoadedOnceRef.current = false;
      queryKeyRef.current = null;
      return;
    }

    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }
    try {
      const response = await fetch(`${apiBaseUrl}/api/network-nodes`, {
        cache: 'no-store',
      });
      const payload: unknown = await response.json();
      const parsedMappings = parseNetworkNodesPayload(payload);
      const candidateIds = [
        ...new Set([...normalizedCandidateNodeIds, ...parsedMappings.map((entry) => entry.nodeId)]),
      ];
      let discoveredNodes: Array<{
        nodeId: string;
        typeId: string | null;
        displayName: string | null;
      }> = [];

      if (candidateIds.length > 0) {
        const objectPayloads = await Promise.all(
          candidateIds.map(async (nodeId) => {
            const objectResponse = await fetch(graphQlEndpoint, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              cache: 'no-store',
              body: JSON.stringify({
                query: GET_OBJECT_WITH_JSON,
                variables: { id: nodeId },
              }),
            });

            if (!objectResponse.ok) {
              return null;
            }

            return (await objectResponse.json()) as unknown;
          }),
        );

        discoveredNodes = objectPayloads.flatMap((payload) => parseNodeObjects(payload));
      }

      startTransition(() => {
        setMappings(parsedMappings);
        const objectById = new Map(discoveredNodes.map((entry) => [entry.nodeId, entry]));
        const mappingById = new Map(parsedMappings.map((entry) => [entry.nodeId, entry]));
        const mergedNodeIds = [
          ...new Set([
            ...normalizedCandidateNodeIds,
            ...discoveredNodes.map((entry) => entry.nodeId),
          ]),
        ];
        setNodes(
          mergedNodeIds.map((nodeId) => {
            const object = objectById.get(nodeId);
            const mapping = mappingById.get(nodeId);
            return {
              nodeId,
              solarSystemId: mapping?.solarSystemId ?? 0,
              solarSystemName: mapping?.solarSystemName ?? null,
              typeId: object?.typeId ?? null,
              displayName: object?.displayName ?? null,
            };
          }),
        );
        setError(null);
        hasLoadedOnceRef.current = true;
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
      setMappings([]);
      setLoading(false);
      hasLoadedOnceRef.current = false;
      queryKeyRef.current = null;
      return;
    }

    const queryKey = `${enabled ? '1' : '0'}|${apiBaseUrl}|${graphQlEndpoint}|${normalizedCandidateNodeIds.join(',')}`;
    if (queryKeyRef.current !== queryKey) {
      queryKeyRef.current = queryKey;
      hasLoadedOnceRef.current = false;
    }

    void refresh();
  }, [apiBaseUrl, enabled, graphQlEndpoint, normalizedCandidateNodeIds.join(','), refreshTick]);

  async function assignNode(
    nodeId: string,
    assignment: { solarSystemId: number; solarSystemName: string | null },
  ): Promise<void> {
    if (!enabled) {
      return;
    }

    await fetch(`${apiBaseUrl}/api/network-nodes/${nodeId}/solar-system`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(assignment),
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

  return { nodes, mappings, loading, error, refresh, assignNode, unassignNode };
}
