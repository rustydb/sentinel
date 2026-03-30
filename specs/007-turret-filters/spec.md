# Feature Specification: Turret Filters

**Feature Branch**: `007-turret-filters`  
**Created**: 2026-03-30  
**Status**: Implemented
**Input**: User description: "Filter for displaying turrets based on solar system, `turret.id`, known network nodes, status, and class."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Narrow The Turret List Quickly (Priority: P1)

An operator opens the turret list and uses filter controls to narrow the visible turrets by solar system, turret ID, known network node, status, and class. The dashboard responds immediately so the operator can move from a broad overview to a focused tactical subset without leaving the page.

**Why this priority**: Filtering is most valuable when it helps an operator find the right turret fast, especially in large fleets where the unfiltered list is too broad to inspect manually.

**Independent Test**: Can be fully tested by loading a mixed turret set, applying each available filter one at a time, and confirming the visible turret list reduces to only the matching entries.

**Acceptance Scenarios**:

1. **Given** a visible turret list containing multiple solar systems, **When** the operator selects a solar-system filter value, **Then** only turrets matching that solar system remain visible.
2. **Given** a visible turret list containing multiple turrets, **When** the operator enters a full `turret.id` or turret name, **Then** only the matching turret is shown.
3. **Given** a visible turret list containing turrets on different known network nodes, **When** the operator chooses a known network node filter value, **Then** only turrets assigned to that node remain visible.
4. **Given** a visible turret list containing multiple turret statuses and classes, **When** the operator selects a status or class filter value, **Then** the list narrows to only turrets matching that chosen state.

---

### User Story 2 - Combine And Clear Filters Safely (Priority: P2)

An operator applies more than one filter at a time to reduce the turret list to a specific operational slice, then clears individual filters or all filters when they want to return to a broader view.

**Why this priority**: Real operator workflows usually need layered filtering, not just one-off lookups, and clearing filters must be just as easy as applying them.

**Independent Test**: Can be fully tested by applying two or more filters together, confirming the intersection of results, and then clearing one filter or all filters to restore the expected broader set.

**Acceptance Scenarios**:

1. **Given** multiple turrets match separate filter values, **When** the operator applies two or more filters together, **Then** only turrets matching every active filter remain visible.
2. **Given** an active set of filters, **When** the operator clears one filter, **Then** the remaining filters still apply and the visible set updates accordingly.
3. **Given** an active set of filters, **When** the operator clears all filters, **Then** the turret list returns to the full visible set.
4. **Given** an operator changes a filter value, **When** the new value is applied, **Then** the list updates without requiring a page reload or a separate confirm action.

---

### User Story 3 - Preserve Honest State Labels While Filtering (Priority: P3)

An operator filters the turret list using states that are meaningful in Sentinel, including explicit unassigned or orphaned conditions where applicable, and the dashboard keeps those states legible rather than hiding them behind empty or misleading labels.

**Why this priority**: Filters are only useful if the states they target are clear and trustworthy, especially when the operator is looking for edge cases like orphaned turrets or unassigned systems.

**Independent Test**: Can be fully tested by filtering for absent or edge-state values and confirming the list either shows the correct matching turrets or clearly reports that no matches exist.

**Acceptance Scenarios**:

1. **Given** a turret has no active network node, **When** the operator filters for orphaned or unassigned network-node state, **Then** that turret remains visible.
2. **Given** a turret has no solar-system assignment, **When** the operator filters for an unassigned solar-system state, **Then** that turret remains visible.
3. **Given** no turrets match the current filter combination, **When** the operator views the result, **Then** the dashboard clearly shows an empty-state message and a friendly suggestion to remove some filters for better results.

### Edge Cases

- What happens when the operator filters by a turret ID that does not exist in the current visible set?
- How does the system behave when the selected solar system has no matching turrets?
- What happens when a known network node filter is applied but all matching turrets are orphaned or otherwise excluded by another active filter?
- How does the dashboard represent turrets whose class cannot be resolved at display time?
- What happens when the operator combines filters that produce no matches?
- How does the filter state behave when the underlying turret list changes while filters are active?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide operator-facing filters for solar system, `turret.id`, known network node, status, and class.
- **FR-002**: The system MUST allow each filter to be applied independently of the others.
- **FR-003**: The system MUST allow multiple filters to be active at the same time and MUST show only turrets that satisfy every active filter.
- **FR-004**: The solar-system filter MUST match turrets by their displayed solar-system assignment, including an explicit unassigned state when no assignment exists.
- **FR-005**: The identifier filter MUST match the turret's full identifier or turret name and show only the matching turret or turrets.
- **FR-006**: The known-network-node filter MUST allow operators to narrow the list to turrets associated with a selected known node, including an explicit orphaned state when no node exists.
- **FR-007**: The status filter MUST reflect the turret statuses currently shown in Sentinel, including any displayed presentation states.
- **FR-008**: The class filter MUST reflect the turret classes currently available in the dashboard data and MUST not invent a class that is not present or resolvable; if a class value is temporarily unavailable, the system MUST show a loading state and then an explicit error state if the class still cannot be resolved after 10 seconds.
- **FR-009**: The system MUST update the visible turret list immediately when a filter value changes.
- **FR-010**: The system MUST provide a clear way to remove an individual filter without resetting the remaining active filters.
- **FR-011**: The system MUST provide a clear way to reset all turret filters at once.
- **FR-012**: When no turrets match the active filters, the system MUST show an explicit empty state with a friendly suggestion to remove some filters for better results.
- **FR-013**: The system MUST preserve the underlying turret data and selection state when filters are applied or removed, and when the selected turret remains in the filtered results the system MUST automatically bring it into the operator's visible context when possible.
- **FR-014**: The system MUST keep filtered states legible on the turret cards so operators can understand why a turret is or is not visible.

### Constitution Alignment

- [x] Spec adheres to Brutalist UX constraints (monospace, thick borders, no gradients).
- [x] Performance metrics and scalability goals are defined.

### Key Entities _(include if feature involves data)_

- **Turret**: The dashboard object being filtered, identified by `turret.id` and described by status, class, solar-system assignment, and network-node assignment.
- **Solar System Filter Value**: A selectable solar-system state used to narrow the turret list by the turret's displayed solar system or by an explicit unassigned condition.
- **Network Node Filter Value**: A selectable known-node state used to narrow the turret list by the turret's assigned node or by an explicit orphaned condition.
- **Status Filter Value**: A selectable operational state shown in Sentinel for the turret.
- **Class Filter Value**: A selectable turret class used to distinguish turret types in the list, with explicit loading and error states if the class metadata is not immediately available.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Operators can reduce a mixed turret list to the intended subset using filters in under 30 seconds in at least 90% of usability checks.
- **SC-002**: In validation runs, changing a filter updates the visible turret list within 1 second for at least 95% of interactions.
- **SC-003**: Operators can combine at least three active filters and still recover to the full list using the clear-all action without losing context.
- **SC-004**: In manual review, 100% of empty-filter-result states clearly indicate that no turrets match the current criteria and prompt the operator to broaden or clear filters.

## Assumptions

- The turret list already contains the base data needed to evaluate solar system, network node, status, and class filters.
- Turret class is derived from the turret's resolved type information or an equivalent display label already available in the dashboard.
- If class metadata is briefly unavailable, the dashboard surfaces that condition explicitly rather than substituting a guess.
- The known-network-node filter operates on the node records already exposed in the dashboard and does not introduce a new source of truth.
- Filtering is a view concern only and does not change turret assignment, ownership, or event history.
- The dashboard should keep any selected turret context intact unless the current filter combination hides that turret from view.
