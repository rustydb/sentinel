# Feature Specification: Bootstrap Sentinel

**Feature Branch**: `001-bootstrap-sentinel`
**Created**: 2026-03-26
**Status**: Draft
**Input**: User description: "Read the implementation plan into speckit"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Connect Wallet and View Dashboard (Priority: P1)
As a user, I want to connect my EVE Vault wallet so that I can view a dashboard of all my owned turret Smart Assembly objects.

**Why this priority**: Without wallet connection and basic dashboard visibility, the app provides no value.

**Independent Test**: Can be fully tested by connecting a wallet and verifying that the dashboard displays a grid of Turret Cards with accurate status, network node, and location.

**Acceptance Scenarios**:
1. **Given** I am on the Connect Screen, **When** I click "Connect EVE Vault" and approve the connection, **Then** I am redirected to the Dashboard.
2. **Given** my wallet owns multiple turrets, **When** I view the Dashboard, **Then** I see a Turret Card for each, including its status, assigned network node, location, and aggressor data.

---

### User Story 2 - View Turret Details and Event Log (Priority: P2)
As a user, I want to click on a turret card to open a detailed panel so that I can see its full on-chain address, network node assignments, and a paginated history of on-chain events.

**Why this priority**: Deep diving into a turret's event history and managing its node assignment is the core interactive feature for managing assets.

**Independent Test**: Can be fully tested by opening the detail drawer for a turret, verifying the displayed information, and interacting with the event log pagination.

**Acceptance Scenarios**:
1. **Given** I am on the Dashboard, **When** I click a Turret Card, **Then** a bottom-sheet drawer opens displaying full object details and an event log.
2. **Given** the detail panel is open, **When** I click to unassign or change the network node, **Then** the database is updated and the UI reflects the new assignment.

---

### User Story 3 - View Turret Locations on Universe Map (Priority: P2)
As a user, I want to see my turrets' locations on an embedded universe map so that I can visually track their spatial distribution in EVE Frontier.

**Why this priority**: Spatial awareness is key to the gameplay loop in EVE Frontier.

**Independent Test**: Can be fully tested by verifying that the map iframe loads and correctly receives `postMessage` events to navigate to specific systems.

**Acceptance Scenarios**:
1. **Given** the Dashboard is loaded, **When** I view the map section, **Then** the ef-map iframe is embedded and functional.
2. **Given** I am viewing a turret's details, **When** I click its location, **Then** the map navigates to that solar system via postMessage.

---

### User Story 4 - Index On-Chain Events (Priority: P1)
As a system administrator, I need a background service that listens to the Sui blockchain and stores turret events into a database so that the dashboard can display historical activity.

**Why this priority**: The historical event log relies entirely on this backend indexer functioning correctly.

**Independent Test**: Can be fully tested by running the Rust indexer against a testnet node and querying the PostgreSQL `turret_events` table to verify data ingestion.

**Acceptance Scenarios**:
1. **Given** the indexer is running, **When** a turret-related event occurs on-chain, **Then** it is captured and saved in the PostgreSQL database.

### Edge Cases
- What happens when the Sui RPC node rate-limits requests? (Should implement retry with backoff).
- How does system handle turrets that have no network node assignment? (Should default to "orphaned" visually).

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: System MUST allow users to connect their EVE Vault wallet (zkLogin on Sui).
- **FR-002**: System MUST fetch and display turret assemblies owned by the connected wallet.
- **FR-003**: System MUST provide a responsive dashboard (grid of cards) displaying turret status, location, and aggressor data.
- **FR-004**: System MUST include a detail drawer that mirrors card data and adds object address, copy buttons, node management, and a paginated event log.
- **FR-005**: System MUST run a background indexing service to capture on-chain turret events into a datastore.
- **FR-006**: System MUST expose an internal backend API for network node mappings and event querying.
- **FR-007**: System MUST embed the ef-map universe map and control it via `postMessage`.

### Constitution Alignment
- [x] Spec adheres to Brutalist UX constraints (monospace, thick borders, no gradients).
- [x] Performance metrics and scalability goals are defined.

### Key Entities *(include if feature involves data)*
- **TurretData**: Represents an on-chain assembly. Attributes: `id` (Sui address), `itemId`, `name`, `status`, `locationHash`, `isOnline`, `energySourceId`, `extension`.
- **TurretEvent**: Represents an on-chain event. Attributes: `txDigest`, `timestamp`, `eventType`, `json_data`.
- **NetworkNodeMapping**: Database entity linking a node ID to a solar system ID.

## Success Criteria *(mandatory)*

### Measurable Outcomes
- **SC-001**: Users can connect their wallet and view their turrets within 3 seconds measured from wallet connection callback to dashboard fully rendered.
- **SC-002**: The event indexing service successfully processes Sui checkpoints without falling behind real-time by more than 10 seconds.
- **SC-003**: The UI renders the brutalist design system consistently across all components.
- **SC-004**: Dashboard API endpoints respond in under 200ms at the 95th percentile.

## Assumptions
- EVE Vault wallet integration works as defined by the `@evefrontier/dapp-kit`.
- Users have modern browsers capable of running React 19 and Tailwind CSS 4.
- The Sui blockchain connection is stable (using configured testnet/mainnet RPC endpoints).
- The Rust indexer has sufficient PostgreSQL database availability to write events.
