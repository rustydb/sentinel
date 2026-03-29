# Data Model

## `SolarSystemCatalogEntry`

- `id`: number
- `name`: string
- `world`: `'utopia' | 'stillness'`
- `searchName`: string

**Validation rules**

- `id` must be a positive integer.
- `name` must be non-empty and human-readable.
- `searchName` is a normalized lowercase derivative used for autocomplete matching.

## `NetworkNodeMapping`

- `nodeId`: string
- `solarSystemId`: number | null
- `updatedAt`: string

**Validation rules**

- `nodeId` must be a valid Sui address.
- `solarSystemId` is null when the node is explicitly unassigned.

## `TurretRetainedSolarSystemMapping`

- `turretId`: string
- `solarSystemId`: number
- `sourceNodeId`: string | null
- `updatedAt`: string

**Validation rules**

- `turretId` must be a valid Sui address.
- `solarSystemId` must correspond to a bundled catalog entry.
- `sourceNodeId` is nullable because an orphaned turret may retain a solar-system mapping after the network node is gone.

## `ResolvedTurretSolarSystem`

- `turretId`: string
- `solarSystemId`: number | null
- `solarSystemName`: string | null
- `resolutionSource`: `'node' | 'retained' | 'none'`

**State transitions**

- `none` -> `node` when the turret has an active node assignment with a mapped solar system.
- `node` -> `retained` when the turret becomes orphaned but a retained mapping exists.
- `retained` -> `none` when the retained mapping is cleared and no active node mapping exists.

## `NetworkNodeCardView`

- `nodeId`: string
- `typeId`: string
- `displayName`: string
- `iconUrl`: string | null
- `solarSystemId`: number | null
- `solarSystemName`: string | null
- `assignmentState`: `'assigned' | 'unassigned'`

## `SolarSystemSearchResult`

- `id`: number
- `name`: string
- `matchText`: string

**Validation rules**

- results are matched by friendly name
- results are ordered for operator selection and limited to a manageable count for the drawer/detail autocomplete

## `MapSelectionState`

- `selectedTurretId`: string | null
- `highlightedSolarSystemIds`: number[]
- `focusedSolarSystemId`: number | null

**State transitions**

- No selected turret: `highlightedSolarSystemIds` contains all currently assigned systems and `focusedSolarSystemId` is null.
- Selected turret with solar-system mapping: `focusedSolarSystemId` is set to one system and highlight mode is suppressed.
- Selected turret without solar-system mapping: `focusedSolarSystemId` remains null and no single-system focus is sent.
