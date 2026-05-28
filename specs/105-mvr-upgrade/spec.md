# Feature Specification: Upgrade to MVR for Turret Package IDs

**Feature Branch**: `105-mvr-upgrade`  
**Created**: 2026-05-24  
**Status**: Draft  
**Input**: User description: "Upgrade to MVR to dynamically resolve Turret Package IDs"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Dynamic Package Resolution on Dashboard (Priority: P1)

As a Sentinel user, I want the dashboard to automatically load the correct turret data even after the world contracts are upgraded, so that I don't see broken cards when package IDs change.

**Why this priority**: Without dynamic package resolution, the dashboard breaks every time EVE Frontier deploys a new package version, requiring a manual redeploy of Sentinel with updated environment variables.

**Independent Test**: Can be tested by visiting the dashboard on `utopia` or `stillness` and verifying that turret assemblies load successfully using the MVR resolution without relying on hardcoded `original-id`s for data fetching.

**Acceptance Scenarios**:

1. **Given** the dashboard starts up, **When** it queries the Sui network, **Then** it fetches the latest package ID from the Move Version Registry using the configured original package ID as the anchor.
2. **Given** the latest package ID is resolved, **When** fetching turrets, **Then** the application uses the newly resolved package ID to filter and query Sui objects.

---

### User Story 2 - Dynamic Event Indexing (Priority: P1)

As a system operator, I want the Rust indexer to dynamically fetch the latest package ID on startup, so that it indexes events from the active package version without manual reconfiguration.

**Why this priority**: The indexer is the source of truth for threat intelligence and node mappings. If it stops indexing after a package upgrade, the dashboard shows stale data.

**Independent Test**: Can be tested by starting the indexer locally and verifying in the logs that it resolves the latest package ID via MVR before starting its event polling loop.

**Acceptance Scenarios**:

1. **Given** the indexer starts, **When** it initializes its event filters, **Then** it queries the MVR to resolve the latest `EVE_PACKAGE_ID`.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The Dashboard MUST query the Move Version Registry (MVR) to resolve the active `Package ID` using the original package ID as a reference.
- **FR-002**: The Dashboard MUST use the dynamically resolved `Package ID` for all GraphQL and RPC calls related to turret assemblies.
- **FR-003**: The Rust Indexer MUST query the Sui network on startup to resolve the active `Package ID` via MVR using the provided `EVE_PACKAGE_ID` environment variable.
- **FR-004**: The Rust Indexer MUST resolve the package ID on startup (periodic runtime polling will be implemented in a future issue: #113).
- **FR-005**: The Dashboard MUST use the `@suins/mvr` SDK to query the Move Version Registry.
- **FR-006**: The Rust Indexer MUST use a dedicated SuiNS/MVR crate to resolve the MVR objects and abstract the lookup logic.

### Constitution Alignment

- [x] Spec adheres to Brutalist UX constraints (monospace, thick borders, no gradients) - no UI changes are strictly introduced, but any error states must align.
- [x] Performance metrics and scalability goals are defined - MVR resolution should not noticeably delay startup.

### Key Entities

- **MVR Record**: The on-chain mapping that points the `original-id` to the `published-at` (latest) package ID.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The dashboard successfully loads turret data on the `utopia` network using the dynamically resolved MVR package ID.
- **SC-002**: The Rust indexer successfully resolves the package ID on startup and begins indexing without fatal errors.
- **SC-003**: Package upgrades on the Sui network no longer require a redeployment of Sentinel to update hardcoded environment variables.

## Assumptions

- The `Published.toml` `original-id` values currently hardcoded in `.env` (`VITE_UTOPIA_TURRET_PACKAGE_ID` and `VITE_STILLNESS_TURRET_PACKAGE_ID`) serve as the stable lookup keys for MVR.
- A single MVR query at startup (dashboard load or indexer start) is sufficient for MVP; we do not need to build complex real-time package upgrade detection yet unless specified.
