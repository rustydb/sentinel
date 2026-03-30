export const GET_CHARACTER_AND_OWNED_OBJECTS = `
  query GetCharacterAndOwnedObjects(
    $owner: SuiAddress!
    $characterPlayerProfileType: String!
    $ownerCapType: String!
    $after: String
  ) {
    address(address: $owner) {
      address
      objects(last: 1, filter: { type: $characterPlayerProfileType }) {
        nodes {
          contents {
            extract(path: "character_id") {
              asAddress {
                asObject {
                  address
                  asMoveObject {
                    contents {
                      json
                    }
                  }
                }
                objects(first: 50, after: $after, filter: { type: $ownerCapType }) {
                  pageInfo {
                    hasNextPage
                    endCursor
                  }
                  nodes {
                    contents {
                      extract(path: "authorized_object_id") {
                        asAddress {
                          asObject {
                            asMoveObject {
                              contents {
                                type {
                                  repr
                                }
                                json
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_OBJECTS_BY_IDS = `
  query GetObjectsByIds($ids: [String!]!) {
    objects(filter: { objectIds: $ids }, first: 100) {
      nodes {
        address
        asMoveObject {
          contents {
            type {
              repr
            }
            json
          }
        }
      }
    }
  }
`;

export const GET_OBJECT_WITH_JSON = `
  query GetObjectWithJson($id: String!) {
    object(address: $id) {
      address
      asMoveObject {
        contents {
          type {
            repr
          }
          json
        }
      }
    }
  }
`;

export const GET_TURRET_EVENTS = `
  query GetTurretEvents($turretId: String!, $cursor: String) {
    events(filter: { emittingModule: "turret", sender: $turretId }, after: $cursor) {
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        timestamp
        type {
          repr
        }
        json
        transactionDigest
      }
    }
  }
`;

export const TURRET_STATUSES = [
  'online',
  'anchored',
  'unanchored',
  'destroyed',
  'offline',
] as const;

export type TurretStatus = (typeof TURRET_STATUSES)[number];

export interface TurretData {
  id: string;
  itemId: string;
  name?: string;
  status: TurretStatus;
  locationHash?: string;
  isOnline: boolean;
  typeId: string;
  energySourceId: string;
  extension?: string;
  aggressor?: string | null;
}

export interface TurretEvent {
  txDigest: string;
  eventSeq: number;
  checkpointSequenceNumber: number;
  eventType: string;
  jsonData: Record<string, unknown>;
  timestamp: string;
}

export interface NetworkNodeMapping {
  nodeId: string;
  solarSystemId: number;
  solarSystemName: string | null;
}

export interface TurretSolarSystemMapping {
  turretId: string;
  solarSystemId: number;
  solarSystemName: string | null;
  sourceNodeId: string | null;
}

export function isTurretData(value: unknown): value is TurretData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<TurretData>;
  const statuses: readonly string[] = TURRET_STATUSES;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.itemId === 'string' &&
    typeof candidate.status === 'string' &&
    statuses.includes(candidate.status) &&
    typeof candidate.typeId === 'string' &&
    typeof candidate.energySourceId === 'string' &&
    typeof candidate.isOnline === 'boolean'
  );
}

export function toTurretStatus(input: string): TurretStatus {
  const statuses: readonly string[] = TURRET_STATUSES;
  return statuses.includes(input) ? (input as TurretStatus) : 'offline';
}

export * from './solarSystems';
export * from './turretIntelligence';
