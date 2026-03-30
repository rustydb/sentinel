# Data Model

## `ThemeTokenSet`

- `surfaceCanvas`: string
- `surfaceShell`: string
- `surfaceCard`: string
- `surfaceInset`: string
- `accentPrimary`: string
- `accentDanger`: string
- `accentEngaged`: string
- `textPrimary`: string
- `textMuted`: string
- `focusRing`: string

**Validation rules**

- Tokens must be documented in `docs/DESIGN_SYSTEM.md` with hex values and usage notes.
- Status and focus tokens must remain visually distinguishable against the darker shell.

## `ShellStatisticsSnapshot`

- `totalTurrets`: number
- `engagedTurrets`: number
- `onlineTurrets`: number
- `offlineTurrets`: number
- `aggressorsPast24Hours`: number

**Validation rules**

- All fields are non-negative integers.
- `engagedTurrets` is derived from the latest threat summary, not persisted turret status.
- `aggressorsPast24Hours` is the grand total derived from per-turret 24-hour aggressor counts.

## `TurretThreatSummary`

- `turretId`: string
- `latestPriorityEvent`: `LatestPriorityEventRef | null`
- `targetItemId`: string | null
- `targetCharacterId`: number | null
- `targetDisplayName`: string | null
- `isNpc`: boolean
- `tribeId`: number | null
- `tribeName`: string | null
- `targetTypeId`: string | null
- `isAggressor`: boolean | null
- `behaviorChange`: `'UNSPECIFIED' | 'ENTERED' | 'STARTED_ATTACK' | 'STOPPED_ATTACK' | null`
- `statusOverride`: `'ENGAGED' | null`
- `aggressorsPast24Hours`: number

**Validation rules**

- `turretId` must be a valid Sui address.
- `targetDisplayName` is `NPC`-equivalent when `targetCharacterId` is `0`.
- `statusOverride` is `ENGAGED` only when the latest `behaviorChange` is `STARTED_ATTACK`.
- `aggressorsPast24Hours` is always present and defaults to `0`.

## `LatestPriorityEventRef`

- `txDigest`: string
- `eventSeq`: number
- `checkpointSequenceNumber`: number
- `timestamp`: string

**Validation rules**

- This reference identifies the event the detail panel selects by default.
- It is null when a turret has no `PriorityListUpdatedEvent`.

## `TurretCardStatusView`

- `baseStatus`: string
- `displayStatus`: `'ONLINE' | 'OFFLINE' | 'ENGAGED' | string`
- `statusTone`: `'neutral' | 'danger' | 'engaged'`
- `latestTargetLabel`: string | null
- `aggressorsPast24Hours`: number

**State transitions**

- `ONLINE` -> `ENGAGED` when the latest threat summary reports `STARTED_ATTACK`.
- `ENGAGED` -> base status when the next latest threat summary reports any non-attack behavior.
- Missing threat summary leaves `displayStatus` at the base status and target label empty.

## `TurretDetailIntelligenceView`

- `selectedPriorityEventRef`: `LatestPriorityEventRef | null`
- `targetDisplayName`: string | null
- `tribeName`: string | null
- `targetTypeId`: string | null
- `targetTypeName`: string | null
- `targetIconUrl`: string | null
- `isAggressor`: boolean | null

**Validation rules**

- The view defaults to the latest `PriorityListUpdatedEvent` when one exists.
- Type info may resolve asynchronously from `targetTypeId`.
- Missing lookups remain explicit rather than silently inferred.

## `DemoThreatScenario`

- `turretId`: string
- `scenario`: `'player-engaged' | 'npc-observed' | 'restored-status' | 'no-priority-event'`
- `threatSummary`: `TurretThreatSummary`

**Validation rules**

- Demo fixtures must cover at least one engaged player target and one NPC target.
- Demo statistics must be derivable from the same fixture set without special-case math.
