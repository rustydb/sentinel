import {
  GET_CHARACTER_AND_OWNED_OBJECTS,
  type TurretData,
  isTurretData,
  toTurretStatus,
} from '@frontier-sentinel/shared-types';
import { useEffect, useState } from 'react';

interface UseTurretsOptions {
  owner?: string;
  endpoint?: string;
  enabled?: boolean;
}

const DEFAULT_TURRET_PACKAGE_ID =
  '0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75';
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

export function useTurrets({ owner, endpoint = '/graphql', enabled = true }: UseTurretsOptions) {
  const [turrets, setTurrets] = useState<TurretData[]>([]);
  const [loading, setLoading] = useState(Boolean(enabled && owner));
  const [error, setError] = useState<Error | null>(null);
  const [characterName, setCharacterName] = useState<string | null>(null);
  const [characterAddress, setCharacterAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !owner) {
      setTurrets([]);
      setLoading(false);
      setCharacterName(null);
      setCharacterAddress(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const loadTurrets = async (): Promise<void> => {
      try {
        const turretPackageId = import.meta.env.VITE_TURRET_PACKAGE_ID ?? DEFAULT_TURRET_PACKAGE_ID;
        const characterPlayerProfileType = `${turretPackageId}${CHARACTER_PLAYER_PROFILE_SUFFIX}`;
        const ownerCapType = `${turretPackageId}${OWNER_CAP_SUFFIX}${turretPackageId}${TURRET_TYPE_SUFFIX}`;
        const objects: Record<string, unknown>[] = [];
        let after: string | null = null;
        let hasNextPage = true;

        while (hasNextPage) {
          const ownerCapsResponse = await fetch(endpoint, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
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
          const nextCharacterName =
            characterJson && typeof characterJson === 'object'
              ? parseCharacterName(characterJson)
              : null;
          const nextCharacterAddress =
            typeof characterProfile?.address === 'string' ? characterProfile.address : null;
          const ownedObjectsConnection =
            characterConnection?.nodes?.[0]?.contents?.extract?.asAddress?.objects;
          const pageNodes = ownedObjectsConnection?.nodes ?? [];

          if (!cancelled) {
            setCharacterName(nextCharacterName);
            setCharacterAddress(nextCharacterAddress);
          }

          for (const pageNode of pageNodes) {
            const contents =
              pageNode.contents?.extract?.asAddress?.asObject?.asMoveObject?.contents;
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

        if (objects.length === 0) {
          if (!cancelled) {
            setTurrets([]);
          }
          return;
        }
        const mapped = objects
          .map(mapNodeToTurret)
          .filter((turret): turret is TurretData => turret !== null);
        if (!cancelled) {
          setTurrets(mapped);
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
  }, [enabled, endpoint, owner]);

  return { turrets, loading, error, characterName, characterAddress };
}
