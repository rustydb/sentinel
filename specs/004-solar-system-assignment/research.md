# Phase 0: Outline & Research

## Decision 1: Use a bundled, versioned solar-system catalog generated from the world APIs

- **Decision**: Store a generated solar-system catalog in the repo and refresh it with a Bun script that pulls from the world-specific `/v2/solarsystems` endpoints for Utopia and Stillness.
- **Rationale**: Operators need autocomplete by solar-system name and friendly-name display without waiting on live API calls during every dashboard interaction. A bundled catalog keeps search instant, keeps IDs and names consistent across dashboard and API code, and matches the user request for a maintained local dataset.
- **Alternatives considered**:
    - Fetch solar systems from the world API on every search: rejected because it adds latency, introduces rate/dependency risk, and violates the “bundle this data” direction.
    - Store the catalog only in the database: rejected because the frontend still needs a fast local search source and the data changes infrequently enough to justify a versioned artifact.

## Decision 2: Reuse the existing PostgreSQL database and add a retained turret-mapping table

- **Decision**: Keep `network_node_mappings` as the active node-to-solar-system store and add a `turret_solar_system_mappings` table to preserve last-known solar-system IDs for turrets that later become orphaned.
- **Rationale**: The feature must use the existing database, and node-level assignment alone is not enough to satisfy the orphaned-turret requirement. A small retained-mapping table solves the persistence problem without introducing a second primary store or forcing the indexer to own this feature.
- **Alternatives considered**:
    - Extend only `network_node_mappings`: rejected because node records can disappear while turrets still need to show a retained solar-system mapping.
    - Persist retained mappings only in browser storage: rejected because the requirement is cross-session and should survive device/browser changes.

## Decision 3: Keep `ef-map` loaded and use its postMessage API for both highlight and focus states

- **Decision**: Keep a stable iframe source for `ef-map`, use `ef-map-highlight` when no turret is selected, and switch to `ef-map-navigate` when a specific turret is selected.
- **Rationale**: The embed guide explicitly recommends postMessage for system changes, highlight updates, and zoom changes without reloading the iframe. This gives the dashboard the “all assigned systems” state and the “single selected system” state without visible reload flashes.
- **Alternatives considered**:
    - Rebuild the iframe `src` on every selection change: rejected because it forces reloads and breaks the requested dynamic-loading behavior.
    - Use only a single selected-system mode: rejected because the feature explicitly wants all assigned solar systems highlighted when no turret is selected.

## Decision 4: Discover current network nodes from on-chain ownership, not from the mapping table

- **Decision**: Build the network node drawer from the player’s current owned network-node objects using the same character-owned-object pattern already used for turrets, then merge local assignment state from the API.
- **Rationale**: The drawer should represent the player’s actual current network nodes. The existing `/api/network-nodes` endpoint only returns nodes that already have a local mapping and cannot distinguish “no nodes exist” from “nodes exist but have not been assigned yet.”
- **Alternatives considered**:
    - Use only `/api/network-nodes` as the drawer source: rejected because it would hide unassigned nodes and make an empty drawer ambiguous.
    - Hardcode demo-only node cards: rejected because the feature is operator workflow, not a demo-only presentation change.

## Decision 5: Prefer in-memory/unit fixtures over SQLite for unit tests

- **Decision**: Use in-memory repository doubles and bundled solar-system fixture data for unit tests, while keeping any persistence-specific verification tied to the existing PostgreSQL repository layer.
- **Rationale**: The API already has repository abstractions and in-memory test doubles. Introducing SQLite for unit tests would add a second SQL dialect and create behavior drift from the actual Postgres-backed runtime without improving confidence in the feature logic.
- **Alternatives considered**:
    - Add SQLite as a new unit-test database: rejected because the runtime is Postgres-specific and the extra database layer would increase maintenance and divergence.
    - Skip persistence tests entirely: rejected because the feature adds real database-backed state that still needs repository/handler coverage.
