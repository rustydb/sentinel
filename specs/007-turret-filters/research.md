# Research

## Decision 1: Keep filtering client-side in the dashboard

- **Decision**: Derive the filtered turret list locally from the already loaded dashboard data instead of introducing a server-side filter endpoint.
- **Rationale**: The dashboard already has the complete visible turret set plus resolved solar-system, node, and type data. Local filtering keeps the interaction immediate and avoids coupling the feature to a new backend contract.
- **Alternatives considered**:
    - Server-side filtered queries: rejected because the feature is primarily a view concern and would add latency and a new API surface.
    - URL-only filtering: rejected because the feature needs richer empty-state and selected-context behavior than a query string alone provides.

## Decision 2: Model the filter state as a single typed object

- **Decision**: Store turret filters as one explicit state object with facets for solar system, turret identity, known network node, status, and class.
- **Rationale**: A single filter state makes conjunctive filtering, clear-one, clear-all, and empty-state derivation easier to reason about and test.
- **Alternatives considered**:
    - Independent state per control: rejected because it makes reset and combined-filter behavior harder to keep consistent.
    - Reducer-only URL synchronization: rejected because it would overcomplicate the first pass and add persistence behavior the spec does not require.

## Decision 3: Match turrets by both `turret.id` and `turret.name`

- **Decision**: Treat the identity filter as a direct turret lookup that matches the exact turret ID and also matches the turret name where present.
- **Rationale**: The review feedback specifically asked for turret-name coverage, and operators often search by the label they see on screen rather than the raw Sui object ID.
- **Alternatives considered**:
    - ID-only filtering: rejected because it fails the requested operator workflow.
    - Full fuzzy search across every field: rejected because the scope is supposed to stay bounded and predictable.

## Decision 4: Reuse the existing type-resolution path for class labels

- **Decision**: Build the class facet from the same type-resolution data already used by turret cards, and surface explicit loading / error states when class metadata is not yet available.
- **Rationale**: The dashboard already fetches type metadata through `useTypeInfo`, so the class filter should share that source of truth rather than invent a separate resolver.
- **Alternatives considered**:
    - Hard-code class names from turret type IDs: rejected because it would duplicate logic and risk drift.
    - Hide class filtering until every type is resolved: rejected because the spec requires the filter to show its loading and failure states explicitly.

## Decision 5: Preserve selected-turret context during filtering

- **Decision**: When filtering leaves the selected turret visible, keep that selection active and bring it back into view when possible; when the selected turret is filtered away, show the list state clearly rather than silently changing the selection.
- **Rationale**: Operators need continuity while narrowing the list, and the spec explicitly asks for honest context handling instead of surprising resets.
- **Alternatives considered**:
    - Auto-clear selection whenever filters change: rejected because it would break operator context.
    - Ignore selection visibility completely: rejected because it could leave the user looking at a hidden selection state.
