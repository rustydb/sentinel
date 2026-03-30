# Feature Specification: Hot-load Indexer Updates

**Feature Branch**: `006-hot-load-indexer-updates`  
**Created**: 2026-03-29  
**Status**: Implemented  
**Input**: User description: "We want to hot-load any updates from the indexer for our turrets and network nodes."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Keep Dashboard Data Current (Priority: P1)

An operator keeps Sentinel open while turret assemblies and network node relationships change, and the dashboard updates itself so the visible turret cards, metrics, and node drawer reflect the latest known state without a manual refresh.

**Why this priority**: Fresh operational data is the core value of the dashboard. If the visible state falls behind, every other workflow becomes less trustworthy.

**Independent Test**: Can be fully tested by changing the underlying turret or network-node data and confirming the dashboard shows the new state on its own while remaining on the same page.

**Acceptance Scenarios**:

1. **Given** the dashboard is open and a new turret becomes available in the source data, **When** the data is updated, **Then** the turret appears in the turret list without requiring a page reload.
2. **Given** an existing turret changes status or solar-system assignment in the source data, **When** the update arrives, **Then** the turret card and turret detail view reflect the updated state.
3. **Given** a network node gains or loses a solar-system assignment in the source data, **When** the update arrives, **Then** the network node drawer shows the updated assignment state.

---

### User Story 2 - Preserve Operator Context During Updates (Priority: P2)

An operator is actively reviewing a turret, its detail panel, or the network node drawer while new data arrives, and the dashboard keeps the operator oriented instead of resetting the whole view.

**Why this priority**: Live updates are only useful if they do not disrupt the operator’s current task.

**Independent Test**: Can be fully tested by selecting a turret, letting the underlying data change, and verifying that the selected context stays coherent or clears gracefully if the underlying item no longer exists.

**Acceptance Scenarios**:

1. **Given** a turret is selected and still exists after a data update, **When** the update is applied, **Then** the turret detail panel stays focused on that turret.
2. **Given** a turret is selected but is removed from the current source data, **When** the update is applied, **Then** the selection clears gracefully and the dashboard returns to the list view.
3. **Given** the network node drawer is open during a data update, **When** the update is applied, **Then** the drawer remains open and continues to show the current node list.

---

### User Story 3 - Reflect Freshness In Counts And Event Context (Priority: P3)

An operator checks metrics, turret counts, and current event-driven context, and the dashboard keeps those summaries in sync with the latest indexed state so they remain trustworthy at a glance.

**Why this priority**: Summary information is only valuable if it stays aligned with the visible turret and node state.

**Independent Test**: Can be fully tested by changing underlying turret totals, node assignments, or event-derived summaries and confirming the metrics and related display values update accordingly.

**Acceptance Scenarios**:

1. **Given** the total number of visible turrets changes in the source data, **When** the update arrives, **Then** the metrics panel shows the new total.
2. **Given** a turret’s latest event-derived context changes, **When** the update arrives, **Then** the turret card and detail panel reflect the latest known context.
3. **Given** a turret becomes orphaned or regains a network node, **When** the update arrives, **Then** the dashboard updates the visible assignment state consistently across all surfaces.

### Edge Cases

- What happens when updates arrive in quick succession and the dashboard needs to keep the newest known state?
- How does the system handle a turret or network node disappearing while the operator is viewing its detail view or drawer card?
- What happens when the dashboard temporarily cannot reach the current indexed data source?
- How does the interface behave when a turret changes state while its detail panel is open?
- What happens when a node-to-solar-system mapping changes after the turret list has already loaded?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST keep turret and network-node views current while the dashboard remains open.
- **FR-002**: The system MUST reflect newly available turrets in the turret list without requiring a manual refresh.
- **FR-003**: The system MUST reflect updated turret state, including status and solar-system assignment, without requiring a manual refresh.
- **FR-004**: The system MUST reflect updated network-node assignment state in the node drawer without requiring a manual refresh.
- **FR-005**: The system MUST keep selected turret context coherent when the selected turret still exists after an update.
- **FR-006**: The system MUST clear selected turret context gracefully when the selected turret is no longer present in the current data set.
- **FR-007**: The system MUST keep the node drawer open and consistent when node data changes.
- **FR-008**: The system MUST keep summary counts aligned with the currently visible turret and node state.
- **FR-009**: The system MUST keep event-driven turret context aligned with the latest known indexed state.
- **FR-010**: The system MUST not require the operator to reload the page to see routine turret or network-node changes.

### Constitution Alignment

- [x] Spec adheres to Brutalist UX constraints (monospace, thick borders, no gradients).
- [x] Performance metrics and scalability goals are defined.

### Key Entities _(include if feature involves data)_

- **Turret Assembly**: A visible defense structure whose status, assignment, and event context can change over time.
- **Network Node**: A node-backed infrastructure object that can gain or lose a solar-system assignment.
- **Live View State**: The currently displayed, authoritative dashboard snapshot for turrets, nodes, and summaries.
- **Selected Context**: The turret or drawer item the operator is actively inspecting while updates continue.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In normal use, operators can see new or changed turret and network-node data without manually refreshing the page.
- **SC-002**: In validation runs, at least 95% of routine turret or node updates appear in the dashboard within 30 seconds.
- **SC-003**: Operators can keep a turret selected while unrelated data updates arrive, and the dashboard remains usable without losing context.
- **SC-004**: Summary counts and visible turret/node states remain aligned for the full duration of a typical monitoring session.

## Assumptions

- The live dashboard is the primary hot-loading surface; demo mode may continue to use fixture-driven data.
- The dashboard always prefers the newest known authoritative state when multiple updates arrive close together.
- Temporary network interruptions are handled with a graceful stale-state experience rather than a hard failure.
- Users are expected to keep the dashboard open for extended monitoring sessions.
