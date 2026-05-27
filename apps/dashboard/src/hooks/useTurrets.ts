import {
  type EveWorldName,
  GET_CHARACTER_AND_OWNED_OBJECTS,
  type TurretData,
  isTurretData,
  toTurretStatus,
} from '@sentinel/shared-types';
import { useEffect, useRef, useState } from 'react';

import { prioritizeWorlds, resolveTurretPackageId, resolveTurretPackageIdAsync } from '../world';

interface UseTurretsOptions {
  owner?: string;
  world?: EveWorldName;
  endpoint?: string;
  enabled?: boolean;
  refreshTick?: number;
}
const CHARACTER_PLAYER_PROFILE_SUFFIX = '::character::PlayerProfile';
const OWNER_CAP_SUFFIX = '::access::OwnerCap<';
const TURRET_TYPE_SUFFIX = '::turret::Turret>';

interface OwnerCapsQueryPayload {
  data?: {
    address?: {
      objects?: {
        nodes?: Array<{
          contents?: {
            extract?: {
              asAddress?: {
                asObject?: {
                  address?: string;
                  asMoveObject?: {
                    contents?: {
                      json?: Record<string, unknown>;
                    };
                  };
                };
                objects?: {
                  pageInfo?: {
                    hasNextPage?: boolean;
                    endCursor?: string | null;
                  };
                  nodes?: Array<{
                    contents?: {
                      extract?: {
                        asAddress?: {
                          asObject?: {
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
                      };
                    };
                  }>;
                };
              };
            };
          };
        }>;
      };
    };
  };
  errors?: Array<{
    message?: string;
  }>;
}

interface LoadedTurretWorldData {
  world: EveWorldName;
  characterName: string | null;
  characterAddress: string | null;
  turrets: TurretData[];
}

function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function extractStatus(rawStatus: unknown): string {
  if (typeof rawStatus === 'string') {
    return rawStatus;
  }

  if (!rawStatus || typeof rawStatus !== 'object') {
    return 'offline';
  }

  const statusRecord = (rawStatus as { status?: Record<string, unknown> }).status;
  const variant = statusRecord?.['@variant'];
  return typeof variant === 'string' ? variant.toLowerCase() : 'offline';
}

function mapNodeToTurret(node: Record<string, unknown>): TurretData | null {
  const json =
    (node.asMoveObject as { contents?: { json?: Record<string, unknown> } } | undefined)?.contents
      ?.json ?? {};
  const key = (json.key as Record<string, unknown> | undefined) ?? {};
  const metadata = (json.metadata as Record<string, unknown> | undefined) ?? {};
  const location = (json.location as Record<string, unknown> | undefined) ?? {};

  const candidate: TurretData = {
    id: readString(node.address),
    itemId: readString(key.item_id, readString(json.itemId)),
    name: readString(metadata.name, ''),
    status: toTurretStatus(extractStatus(json.status)),
    locationHash: readString(location.location_hash, readString(json.locationHash)),
    isOnline: extractStatus(json.status) === 'online',
    typeId: readString(json.type_id, readString(json.typeId, 'turret.unknown')),
    energySourceId: readString(json.energy_source_id, readString(json.energySourceId, 'orphaned')),
    extension: json.extension == null ? undefined : readString(json.extension),
    aggressor: json.aggressor == null ? null : readString(json.aggressor),
  };

  return isTurretData(candidate) ? candidate : null;
}

function parseCharacterName(characterJson: Record<string, unknown> | undefined): string | null {
  if (!characterJson) {
    return null;
  }

  const metadata = (characterJson.metadata as Record<string, unknown> | undefined) ?? {};
  const profile = (characterJson.profile as Record<string, unknown> | undefined) ?? {};
  const display = (characterJson.display as Record<string, unknown> | undefined) ?? {};
  const candidate = [
    characterJson.name,
    characterJson.character_name,
    characterJson.characterName,
    metadata.name,
    profile.name,
    display.name,
  ].find((value) => typeof value === 'string' && value.trim());

  return typeof candidate === 'string' ? candidate.trim() : null;
}

export function useTurrets({
  owner,
  world = 'utopia',
  endpoint = '/graphql',
  enabled = true,
  refreshTick = 0,
}: UseTurretsOptions) {
  const [turrets, setTurrets] = useState<TurretData[]>([]);
  const [loading, setLoading] = useState(Boolean(enabled && owner));
  const [error, setError] = useState<Error | null>(null);
  const [characterName, setCharacterName] = useState<string | null>(null);
  const [characterAddress, setCharacterAddress] = useState<string | null>(null);
  const [resolvedWorld, setResolvedWorld] = useState<EveWorldName>(world);
  const hasLoadedOnceRef = useRef(false);
  const queryKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !owner) {
      setTurrets([]);
      setLoading(false);
      setCharacterName(null);
      setCharacterAddress(null);
      setResolvedWorld(world);
      hasLoadedOnceRef.current = false;
      queryKeyRef.current = null;
      return;
    }

    const queryKey = `${enabled ? '1' : '0'}|${owner}|${world}|${endpoint}`;
    if (queryKeyRef.current !== queryKey) {
      queryKeyRef.current = queryKey;
      hasLoadedOnceRef.current = false;
      setResolvedWorld(world);
    }

    let cancelled = false;
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }
    setError(null);

    async function loadTurretWorldData(
      candidateWorld: EveWorldName,
    ): Promise<LoadedTurretWorldData> {
      const turretPackageId = await resolveTurretPackageIdAsync(candidateWorld);
      const characterPlayerProfileType = `${turretPackageId}${CHARACTER_PLAYER_PROFILE_SUFFIX}`;
      const ownerCapType = `${turretPackageId}${OWNER_CAP_SUFFIX}${turretPackageId}${TURRET_TYPE_SUFFIX}`;
      const objects: Record<string, unknown>[] = [];
      let after: string | null = null;
      let hasNextPage = true;
      let nextCharacterName: string | null = null;
      let nextCharacterAddress: string | null = null;

      while (hasNextPage) {
        const ownerCapsResponse = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          cache: 'no-store',
          body: JSON.stringify({
            query: GET_CHARACTER_AND_OWNED_OBJECTS,
            variables: { owner, characterPlayerProfileType, ownerCapType, after },
          }),
        });

        if (!ownerCapsResponse.ok) {
          throw new Error('Failed to load turret owner caps');
        }

        const ownerCapsPayload = (await ownerCapsResponse.json()) as OwnerCapsQueryPayload;
        if (ownerCapsPayload.errors?.length) {
          throw new Error(
            ownerCapsPayload.errors[0]?.message ?? 'Failed to load turret owner caps',
          );
        }

        const characterConnection = ownerCapsPayload.data?.address?.objects;
        const characterProfile =
          characterConnection?.nodes?.[0]?.contents?.extract?.asAddress?.asObject;
        const characterJson = characterProfile?.asMoveObject?.contents?.json;

        nextCharacterName =
          characterJson && typeof characterJson === 'object'
            ? parseCharacterName(characterJson)
            : nextCharacterName;
        nextCharacterAddress =
          typeof characterProfile?.address === 'string'
            ? characterProfile.address
            : nextCharacterAddress;

        const ownedObjectsConnection =
          characterConnection?.nodes?.[0]?.contents?.extract?.asAddress?.objects;
        const pageNodes = ownedObjectsConnection?.nodes ?? [];

        for (const pageNode of pageNodes) {
          const contents = pageNode.contents?.extract?.asAddress?.asObject?.asMoveObject?.contents;
          if (contents?.json && typeof contents.json === 'object') {
            const json = contents.json;
            objects.push({
              address: readString(json.id),
              asMoveObject: {
                contents,
              },
            });
          }
        }

        hasNextPage = ownedObjectsConnection?.pageInfo?.hasNextPage === true;
        after = ownedObjectsConnection?.pageInfo?.endCursor ?? null;

        if (!hasNextPage || after == null) {
          break;
        }
      }

      return {
        world: candidateWorld,
        characterName: nextCharacterName,
        characterAddress: nextCharacterAddress,
        turrets: objects
          .map(mapNodeToTurret)
          .filter((turret): turret is TurretData => turret !== null),
      };
    }

    const loadTurrets = async (): Promise<void> => {
      try {
        const candidateWorlds = prioritizeWorlds(world);
        let loadedData: LoadedTurretWorldData | null = null;

        for (const candidateWorld of candidateWorlds) {
          const candidateData = await loadTurretWorldData(candidateWorld);
          if (loadedData === null) {
            loadedData = candidateData;
          }

          const hasCharacter =
            candidateData.characterAddress !== null || candidateData.characterName !== null;
          if (hasCharacter || candidateData.turrets.length > 0) {
            loadedData = candidateData;
            break;
          }
        }

        const finalData = loadedData ?? {
          world,
          characterName: null,
          characterAddress: null,
          turrets: [],
        };

        if (!cancelled) {
          setCharacterName(finalData.characterName);
          setCharacterAddress(finalData.characterAddress);
          setResolvedWorld(finalData.world);
          setTurrets(finalData.turrets);
          hasLoadedOnceRef.current = true;
        }
      } catch (reason: unknown) {
        if (!cancelled) {
          setError(reason instanceof Error ? reason : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadTurrets();

    return () => {
      cancelled = true;
    };
  }, [enabled, endpoint, owner, refreshTick, world]);

  return { turrets, loading, error, characterName, characterAddress, world: resolvedWorld };
}
