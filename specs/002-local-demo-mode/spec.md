# Feature Specification: Local Demo Mode

**Feature Branch**: `002-local-demo-mode`
**Created**: 2026-03-27
**Status**: Implemented  
**Input**: User description: "As a developer I need to show off the application featureset locally without the chain, going to /demo or appending a javascript variable should load mock-data with several turrets."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Activate Demo Context (Priority: P1)

As a developer, I want to activate a demo mode via a specific route (`/demo`) or URL parameter so that the application loads mock data instead of requiring a real blockchain connection.

**Why this priority**: It is the core requirement to enable showing off the application without chain dependencies.

**Independent Test**: Can be fully tested by navigating to the demo route in a fresh browser session without any wallet extensions installed.

**Acceptance Scenarios**:

1. **Given** I am running the app locally, **When** I navigate to `/demo`, **Then** the connect screen is bypassed and I see a dashboard with mock turrets.
2. **Given** I navigate to the root route with a `?demo=true` query parameter, **When** the app loads, **Then** it operates fully using the mock data provider.
3. **Given** I am in demo mode, **When** I interact with the UI (e.g. clicking a turret card), **Then** the detail drawer and event log display corresponding mock data.

### Edge Cases

- What happens if a user navigates from a real-chain connection to `/demo`? (The app should disconnect the live wallet and switch to the mock provider).
- What happens if the `demo=true` variable is appended to an invalid route? (The app should 404 naturally while remaining in demo mode).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST support activating demo mode via a `/demo` route or a URL query parameter (`?demo=true`).
- **FR-002**: System MUST bypass the wallet connection flow and assume an authenticated state when demo mode is active.
- **FR-003**: System MUST provide a mock data adapter that intercepts or replaces standard data-fetching hooks to return pre-configured mock data.
- **FR-004**: System MUST supply a realistic set of mock turrets (including various statuses: online, anchored, offline, etc.) and associated mock events.
- **FR-005**: System MUST NOT attempt to make real external network requests when demo mode is active.

### Constitution Alignment

- [x] Spec adheres to Brutalist UX constraints (monospace, thick borders, no gradients).
- [x] Performance metrics and scalability goals are defined.

### Key Entities

- **MockDataProvider**: A local service or context provider responsible for supplying static mock `TurretData` and `TurretEvent` objects in the absence of a live connection.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Developers can load the demo state from a cold start in under 1 second.
- **SC-002**: The application renders a minimum of 5 distinct mock turrets ensuring coverage of all available status badge states.
- **SC-003**: 100% of the UI components (cards, lists, detail drawers, event logs) render successfully and without errors when powered strictly by mock data.

## Assumptions

- The structural layout of the dashboard and detail components remains completely identical in demo mode vs. live mode.
- Mock data requires no persistence across browser reloads.
- The universe map iframe (`ef-map.com`) functions independently and does not require mock data overrides, apart from passing location coordinates.
