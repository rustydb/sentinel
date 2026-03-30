# Data Model

## `DashboardRefreshPolicy`

- `visibleIntervalMs`: number
- `hiddenIntervalMs`: number
- `refreshOnFocus`: boolean
- `cacheMode`: `'no-store'`

**Validation rules**

- The visible interval must remain comfortably below the 30-second freshness target.
- The hidden interval may be longer than the visible interval, but it must still revalidate when the tab regains focus.
- The refresh policy only applies to the live dashboard route.

## `DashboardLiveSnapshot`

- `turrets`: `TurretData[]`
- `networkNodes`: `NetworkNodeView[]`
- `solarSystemsByTurretId`: `Map<string, ResolvedTurretSolarSystem>`
- `turretIntelligenceByTurretId`: `Map<string, TurretIntelligenceSummary>`
- `eventsState`: `UseTurretEventsResult`
- `stats`: `ShellStatisticsSnapshot`
- `selectedTurretId`: string | null
- `lastSyncedAt`: string | null

**Validation rules**

- The snapshot is derived from the latest authoritative data source state, not from a cached browser render.
- Turret and node surfaces within a snapshot should all represent the same refresh cycle.
- `selectedTurretId` is preserved only when the matching turret still exists in the latest snapshot.

## `SelectedTurretAnchor`

- `turretId`: string | null
- `resolvedTurret`: `TurretData | null`
- `isPresentInLatestSnapshot`: boolean

**State transitions**

- When a selected turret remains in the refreshed turret list, `resolvedTurret` updates to the newest object for that ID.
- When a selected turret disappears from the refreshed turret list, `turretId` clears and the detail panel closes gracefully.
- When unrelated data changes, the anchor remains stable.

## `LiveDataSourceFreshness`

- `cacheControl`: `'no-store'`
- `pollingSource`: `'graphql' | 'api'`
- `visible`: boolean

**Validation rules**

- GET requests used for live refresh should not be treated as cacheable dashboard state.
- The dashboard should prefer the newest known indexed state over older responses when updates arrive close together.
- Demo mode is excluded from this model because it remains fixture-driven.
