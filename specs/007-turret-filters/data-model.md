# Data Model

## `TurretFilterState`

- `searchText`: string
- `solarSystemId`: number | null
- `networkNodeState`: `'all' | 'assigned' | 'orphaned'`
- `status`: `TurretStatus | 'all'`
- `classLabel`: string | 'all'

**Validation rules**

- `searchText` is trimmed before matching and may be empty.
- `solarSystemId` is null when the solar-system facet is not active.
- `networkNodeState` must be one of the declared facet states.
- `status` must match one of the known turret statuses when active.
- `classLabel` must be a resolved class label or the `all` sentinel.

## `TurretFilterOption`

- `value`: string | number
- `label`: string
- `kind`: `'solar-system' | 'turret-id' | 'network-node' | 'status' | 'class'`
- `availability`: `'ready' | 'loading' | 'error'`

**Validation rules**

- options shown to operators must have a stable display label
- loading and error options must be rendered explicitly rather than inferred

## `TurretFilterResult`

- `turretId`: string
- `isVisible`: boolean
- `matchedFacets`: string[]

**Validation rules**

- every turret in the current list produces one result entry
- `matchedFacets` records why the turret passed the current filter set

## `TurretClassResolution`

- `typeId`: string
- `classLabel`: string | null
- `displayState`: `'ready' | 'loading' | 'error'`
- `resolvedAt`: string | null

**Validation rules**

- `ready` means the class label is available for both display and filtering
- `loading` is temporary and should transition to `ready` or `error`
- `error` must be explicit when the metadata cannot be resolved in time

## `TurretSelectionVisibility`

- `selectedTurretId`: string | null
- `selectedTurretVisible`: boolean
- `selectedTurretIdVisibleInViewport`: boolean

**Validation rules**

- selection state must remain explicit even when filters hide the selected turret
- when the selected turret remains visible, the dashboard should bring it back into view when possible

## State Transitions

- `filter-none` -> `filter-active` when any facet changes from its sentinel value
- `filter-active` -> `filter-none` when all facets return to their sentinel values
- `loading` -> `ready` when class metadata resolves
- `loading` -> `error` when class metadata does not resolve within the allowed time window
- `selected-visible` -> `selected-hidden` when filters exclude the selected turret
- `selected-hidden` -> `selected-visible` when filters again include the selected turret
