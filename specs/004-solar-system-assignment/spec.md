# Feature Specification: Solar System Assignment

**Feature Branch**: `004-solar-system-assignment`  
**Created**: 2026-03-28  
**Status**: Draft  
**Input**: User description: "Solar system autocomplete search and assignment for network nodes and orphaned turrets. Turrets associated with a solar system will display the solar system's friendly name on the turret card and in the detail pane. Selecting the turret card will focus the ef-map on that turrets solar system using the solar system ID. Deselecting the turret card will remove focus from the map. An orphaned turret does not have a network node. Additionally we want a way for users to view their network nodes in a list, using cards similar to the turret cards (a graphic resolved from typeInfo, an abbreviated Sui address, and an assign/unassign button). The list of network nodes should be a drawer that comes from the side."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Assign Solar Systems To Network Nodes (Priority: P1)

An operator opens the network node drawer, finds one of their network nodes, and uses an `Assign` action to open an autocomplete search by solar-system name. They can confirm a result by keyboard or pointer and assign that solar system to the node without leaving the dashboard. If a solar system is already assigned, the node instead exposes `Reassign` and `Unassign` actions so the operator can change or clear the mapping from the same place.

**Why this priority**: Without solar-system assignment, the rest of the feature has no trustworthy source of location data for turrets or map focus.

**Independent Test**: Can be fully tested by opening the network node drawer, searching for a solar system by name, assigning it to a node, confirming the node now shows reassignment controls, and then clearing or changing that assignment.

**Acceptance Scenarios**:

1. **Given** a network node with no solar system assignment, **When** the operator searches for a solar system by name and confirms an assignment, **Then** the node shows the newly assigned solar system using its friendly name and retains the solar system's ID for map focus and future display.
2. **Given** a network node with an existing solar system assignment, **When** the operator removes the assignment, **Then** the node returns to an unassigned state and no longer displays the previous solar system.
3. **Given** an operator is searching for a solar system, **When** the search text matches multiple systems by name, **Then** the UI presents matching options in a way that can be selected without leaving the drawer.
4. **Given** a turret detail pane shows a turret with an assignable network node, **When** the operator uses the assignment action next to the network node field, **Then** the operator can assign or change that node's solar system from the detail pane without leaving the turret workflow.

---

### User Story 2 - View Turret Solar Systems And Map Focus (Priority: P2)

An operator sees each turret's assigned solar system by friendly name and uses turret selection to focus the map on the correct solar system. When no turret is selected, the map highlights all currently assigned solar systems. When a turret is selected, the map narrows to that turret's solar system only.

**Why this priority**: This is the operator-facing payoff of the assignment workflow and turns the stored mapping into clear tactical context.

**Independent Test**: Can be fully tested by assigning solar systems to one or more nodes, confirming the unselected map highlights all assigned systems, selecting a turret to focus the map on one system, and then clearing the selection to restore the broader highlight state.

**Acceptance Scenarios**:

1. **Given** a turret whose assigned network node has a solar system assignment, **When** the turret appears in the dashboard, **Then** the turret card and detail pane display the solar system's friendly name instead of a blank or hashed value.
2. **Given** one or more turrets have solar-system assignments and no turret is selected, **When** the operator views the map, **Then** the map highlights all assigned solar systems at once.
3. **Given** a turret card with a solar system assignment, **When** the operator selects that turret, **Then** the map focuses on that solar system using the solar system ID tied to the displayed friendly name.
4. **Given** a selected turret is deselected, **When** the selection is cleared, **Then** the map returns to highlighting all currently assigned solar systems instead of remaining focused on one system.
5. **Given** a selected turret is replaced by another selected turret, **When** the selection changes, **Then** the map removes the old focus and reflects only the current turret selection.
6. **Given** a turret has no network node and no retained solar system mapping, **When** the operator views the turret, **Then** the solar system field remains explicitly unassigned and the map does not focus that turret automatically.
7. **Given** a turret has become orphaned but still retains a solar system mapping from an earlier assignment, **When** the operator views or selects that turret, **Then** the turret continues to display the retained friendly solar-system name and the map can still focus that solar system.

---

### User Story 3 - Inspect Network Nodes Alongside Turrets (Priority: P3)

An operator opens a side drawer listing their network nodes in card form, scans them using the same visual language as turret cards, and uses assign or unassign actions from that list.

**Why this priority**: This makes network nodes first-class operator objects and supports node management without overloading the turret view.

**Independent Test**: Can be fully tested by opening the drawer, confirming node cards render with iconography and abbreviated addresses, and using the assign or unassign controls from the drawer.

**Acceptance Scenarios**:

1. **Given** the operator opens the network node drawer, **When** network nodes are available, **Then** each node is shown as a card with a resolved graphic, abbreviated Sui address, and assignment controls.
2. **Given** the operator opens the network node drawer, **When** no network nodes are available, **Then** the drawer communicates that state clearly without showing broken card placeholders.
3. **Given** a turret is orphaned because its network node no longer exists, **When** the operator inspects the dashboard, **Then** the existing orphaned notice remains visible and the network node drawer may be empty even while the turret still appears in the turret list.

### Edge Cases

- What happens when a solar system search returns no matches for the operator's query?
- How does the system handle a network node whose previously assigned solar system is no longer resolvable to a friendly name?
- What happens when a turret points to a network node that exists on-chain but is not present in the operator's current node list?
- What happens when a turret becomes orphaned after previously receiving a solar system mapping?
- How does the map behave when the selected turret has no solar system assignment?
- What happens when the operator changes turret selection while the network node drawer is open?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide a way for operators to open and close a side drawer dedicated to network nodes.
- **FR-002**: The system MUST show each available network node in the drawer as a card using the same overall visual language as turret cards.
- **FR-003**: Each network node card MUST display a resolved graphic, an abbreviated Sui address, and a visible assignment state.
- **FR-004**: The system MUST allow operators to search for solar systems through an autocomplete interaction when assigning a solar system to a network node.
- **FR-005**: The autocomplete interaction MUST search by the solar system's friendly name and present matching solar-system options in a selectable list.
- **FR-006**: When an operator chooses a solar system, the system MUST retain both the solar system's friendly name for display and the solar system's ID for map focus.
- **FR-007**: The system MUST allow operators to remove an existing solar-system assignment from a network node.
- **FR-008**: When a turret's assigned network node has a solar-system assignment, the turret card MUST display the solar system's friendly name.
- **FR-009**: When a turret's assigned network node has a solar-system assignment, the turret detail pane MUST display the same friendly solar-system name.
- **FR-010**: When a turret has no assigned network node, the existing orphaned turret treatment MUST remain visible.
- **FR-011**: When a turret has an assigned network node but no solar-system assignment, the solar-system field MUST display an explicit unassigned state.
- **FR-012**: When a turret becomes orphaned after previously having a solar-system assignment, the turret MUST continue to display the retained solar-system mapping until the operator changes or removes it.
- **FR-013**: When no turret is selected, the map MUST highlight all currently assigned solar systems.
- **FR-014**: Selecting a turret card MUST focus the map on the solar system tied to that turret's current or retained solar-system assignment, using the stored solar system ID.
- **FR-015**: Deselecting a turret card MUST remove the single-turret focus and return the map to its all-assigned-systems highlight state.
- **FR-016**: Replacing one selected turret with another MUST move map focus to the newly selected turret's assigned solar system only.
- **FR-017**: The system MUST NOT focus the map for a turret that has no solar-system assignment.
- **FR-018**: The network node drawer MUST provide assign and unassign controls without requiring the operator to leave the dashboard.
- **FR-019**: The turret detail pane MUST provide an assignment action adjacent to the network node field whenever the turret has an assignable network node.
- **FR-020**: The system MUST preserve the existing responsive-address treatment for network node identifiers shown in the drawer and turret views.

### Constitution Alignment

- [x] Spec adheres to Brutalist UX constraints (monospace, thick borders, no gradients).
- [x] Performance metrics and scalability goals are defined.

### Key Entities _(include if feature involves data)_

- **Network Node**: A player-managed infrastructure object identified by a Sui address, displayed as a card, and optionally assigned to one solar system.
- **Solar System Assignment**: The operator-managed relationship that retains a solar system's friendly name and ID for use by network nodes, turrets, and map focus behavior.
- **Solar System Search Result**: A selectable autocomplete result representing a candidate solar system, searchable by friendly name and carrying the solar system ID needed for map focus.
- **Turret Location View**: The operator-facing presentation of a turret's current or retained solar system state, including friendly name, unassigned state, orphaned state, single-system map focus, and multi-system highlight behavior.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Operators can assign a solar system to a network node from the dashboard in under 30 seconds after opening the node drawer.
- **SC-002**: In usability checks, 100% of turrets with current or retained solar-system assignments display the same friendly solar-system name in both the turret card and the detail pane.
- **SC-003**: In usability checks, selecting or deselecting a turret updates the map between all-assigned-systems highlighting and single-system focus correctly on the first attempt for at least 95% of tested interactions.
- **SC-004**: Operators can distinguish between assigned, unassigned, and orphaned location states without referring to raw hashed location data.

## Assumptions

- Solar-system assignment is managed at the network-node level rather than stored directly on the turret.
- A turret can have at most one assigned network node, and an orphaned turret has none.
- A network node can have at most one active solar-system assignment at a time.
- Friendly solar-system names and solar-system IDs are available from an existing authoritative source and can be used anywhere the assigned solar system is displayed or focused on the map.
- The product has access to a maintained solar-system catalog that supports friendly-name search without requiring a fresh lookup during every operator interaction.
- The existing map embed remains the map surface that receives both all-assigned-systems highlighting and single-system focus changes from turret selection.
