export const THREAT_BEHAVIOR_CHANGES = [
  'UNSPECIFIED',
  'ENTERED',
  'STARTED_ATTACK',
  'STOPPED_ATTACK',
] as const;

export type ThreatBehaviorChange = (typeof THREAT_BEHAVIOR_CHANGES)[number];

export interface LatestPriorityEventRef {
  txDigest: string;
  eventSeq: number;
  checkpointSequenceNumber: number;
  timestamp: string;
}

export interface TurretIntelligenceSummary {
  turretId: string;
  latestPriorityEvent: LatestPriorityEventRef | null;
  targetItemId: string | null;
  targetCharacterId: number | null;
  targetDisplayName: string | null;
  isNpc: boolean;
  tribeId: number | null;
  tribeName: string | null;
  targetTypeId: string | null;
  isAggressor: boolean | null;
  behaviorChange: ThreatBehaviorChange | null;
  statusOverride: 'ENGAGED' | null;
  aggressorsPast24Hours: number;
}

export interface ShellStatisticsSnapshot {
  totalTurrets: number;
  engagedTurrets: number;
  onlineTurrets: number;
  offlineTurrets: number;
  aggressorsPast24Hours: number;
}

export interface TurretIntelligenceResponse {
  data: TurretIntelligenceSummary[];
}

function isLatestPriorityEventRef(value: unknown): value is LatestPriorityEventRef {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<LatestPriorityEventRef>;
  return (
    typeof candidate.txDigest === 'string' &&
    typeof candidate.eventSeq === 'number' &&
    typeof candidate.checkpointSequenceNumber === 'number' &&
    typeof candidate.timestamp === 'string'
  );
}

export function isThreatBehaviorChange(value: unknown): value is ThreatBehaviorChange {
  return (
    typeof value === 'string' && THREAT_BEHAVIOR_CHANGES.includes(value as ThreatBehaviorChange)
  );
}

export function isTurretIntelligenceSummary(value: unknown): value is TurretIntelligenceSummary {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<TurretIntelligenceSummary>;

  return (
    typeof candidate.turretId === 'string' &&
    (candidate.latestPriorityEvent === null ||
      candidate.latestPriorityEvent === undefined ||
      isLatestPriorityEventRef(candidate.latestPriorityEvent)) &&
    (candidate.targetItemId === null ||
      candidate.targetItemId === undefined ||
      typeof candidate.targetItemId === 'string') &&
    (candidate.targetCharacterId === null ||
      candidate.targetCharacterId === undefined ||
      typeof candidate.targetCharacterId === 'number') &&
    (candidate.targetDisplayName === null ||
      candidate.targetDisplayName === undefined ||
      typeof candidate.targetDisplayName === 'string') &&
    typeof candidate.isNpc === 'boolean' &&
    (candidate.tribeId === null ||
      candidate.tribeId === undefined ||
      typeof candidate.tribeId === 'number') &&
    (candidate.tribeName === null ||
      candidate.tribeName === undefined ||
      typeof candidate.tribeName === 'string') &&
    (candidate.targetTypeId === null ||
      candidate.targetTypeId === undefined ||
      typeof candidate.targetTypeId === 'string') &&
    (candidate.isAggressor === null ||
      candidate.isAggressor === undefined ||
      typeof candidate.isAggressor === 'boolean') &&
    (candidate.behaviorChange === null ||
      candidate.behaviorChange === undefined ||
      isThreatBehaviorChange(candidate.behaviorChange)) &&
    (candidate.statusOverride === null ||
      candidate.statusOverride === undefined ||
      candidate.statusOverride === 'ENGAGED') &&
    typeof candidate.aggressorsPast24Hours === 'number'
  );
}
