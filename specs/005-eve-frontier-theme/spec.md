# Feature Specification: EVE Frontier Theme Overhaul

**Feature Branch**: `005-eve-sentinel-theme`  
**Created**: 2026-03-29  
**Status**: Implemented  
**Input**: User description: "Add logo and overhaul the themeing to match EVE Frontier stark and ominious space pallete."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Establish EVE Frontier Visual Identity (Priority: P1)

An operator opens Sentinel and immediately recognizes it as an EVE Frontier interface through the logo, color palette, and overall visual tone rather than a generic dashboard.

**Why this priority**: The product currently works, but it does not yet communicate the intended world identity strongly enough. The logo and visual direction are the highest-leverage changes for product perception.

**Independent Test**: Can be fully tested by loading the dashboard and verifying that the header, primary surfaces, and global palette consistently present the new EVE Frontier visual identity without changing core workflows.

**Acceptance Scenarios**:

1. **Given** an operator opens the dashboard, **When** the page loads, **Then** the interface displays a Sentinel logo treatment that feels native to the product and aligned with EVE Frontier.
2. **Given** the operator scans the page, **When** they compare the header, cards, drawers, and map container, **Then** the palette reads as one cohesive stark and ominous space-facing system rather than mixed neutral surfaces.
3. **Given** the operator uses the dashboard across the main shell, **When** they move between connected and unconnected states, **Then** the updated identity remains consistent across both views.

---

### User Story 2 - Improve Atmospheric Theming Without Losing Readability (Priority: P2)

An operator uses the dashboard in normal monitoring flows and experiences a darker, more ominous EVE Frontier atmosphere while still being able to read status, address, and assignment information clearly.

**Why this priority**: The overhaul must deepen the atmosphere without damaging clarity. The dashboard is still an operational tool, so readability and hierarchy cannot be sacrificed to mood.

**Independent Test**: Can be fully tested by reviewing the dashboard at normal desktop sizes and confirming that critical labels, statuses, cards, and action controls remain legible while the palette and visual tone shift toward the new direction.

**Acceptance Scenarios**:

1. **Given** the operator views turret cards, drawers, and detail surfaces, **When** the new theme is applied, **Then** text hierarchy, status visibility, and surface boundaries remain readable at a glance.
2. **Given** the dashboard uses warning, danger, active, and neutral states, **When** the new palette is applied, **Then** those states remain visually distinct without relying on the previous lighter baseline.
3. **Given** the operator interacts with buttons, selected cards, and drawers, **When** hover or active feedback appears, **Then** the responses still feel tactile and alive inside the new thematic direction.

---

### User Story 3 - Keep Demo And Live Views Visually Consistent (Priority: P3)

An operator or collaborator opens either the live dashboard or the demo route and sees the same branded theme language, rather than a polished live theme and a stale demo presentation.

**Why this priority**: Demo mode is part of product communication, testing, and stakeholder review. It must not drift into a visually misleading side path.

**Independent Test**: Can be fully tested by comparing the live route and the demo route side by side and confirming they share the same logo, palette, spacing language, and thematic treatment.

**Acceptance Scenarios**:

1. **Given** the operator opens the live dashboard, **When** they later open the demo route, **Then** both views share the same logo treatment and themed surface language.
2. **Given** a product review uses demo mode, **When** the reviewer evaluates the interface, **Then** demo mode accurately reflects the current visual identity rather than an outdated theme.
3. **Given** the interface includes fallback, loading, and error states, **When** those states appear in either live or demo mode, **Then** they remain aligned with the same EVE Frontier theme direction.

---

### User Story 4 - Introduce A Pilot Statistics Panel (Priority: P3)

An operator opens the dashboard and immediately sees a compact statistics panel that summarizes their current turret posture and recent hostile activity without needing to scan every turret card.

**Why this priority**: The theme overhaul is also a chance to improve the shell’s information hierarchy. A concise statistics panel gives the user a stronger operational overview and helps anchor the redesigned header area.

**Independent Test**: Can be fully tested by loading the dashboard with representative turret and event data and verifying that the statistics panel shows the correct totals for all tracked counts.

**Acceptance Scenarios**:

1. **Given** the operator opens the dashboard, **When** turret and event data are available, **Then** the shell displays a statistics panel summarizing total turrets, engaged turrets, online turrets, offline turrets, and aggressors in the past 24 hours.
2. **Given** the operator has no recent aggressor activity, **When** the statistics panel is shown, **Then** the aggressor count displays zero rather than a blank or placeholder state.
3. **Given** turret statuses or recent aggressor activity change, **When** the dashboard data refreshes, **Then** the statistics panel updates to match the same underlying dashboard data.
4. **Given** demo mode is used for review or development, **When** the statistics panel is shown there, **Then** its values reflect representative mock turret and aggressor data rather than stale or placeholder counts.

---

### User Story 5 - Surface Recent Target Intelligence In Turret Views (Priority: P3)

An operator reviews turret cards and the turret detail panel and immediately understands the latest meaningful proximity target for each turret, whether the turret is currently engaged, and whether the recent target was a player or an NPC.

**Why this priority**: The dashboard is becoming an operational surface, not just a themed shell. Showing the latest target intelligence and engaged state makes the turret views materially more useful without forcing the operator into raw event inspection.

**Independent Test**: Can be fully tested by loading representative turret and event data, confirming that turret cards show only the latest target name or `NPC` plus the correct status shift, and then opening the detail panel to verify the richer target intelligence sourced from the latest `PriorityListUpdatedEvent`.

**Acceptance Scenarios**:

1. **Given** a turret has a recent `PriorityListUpdatedEvent`, **When** the operator views the turret card, **Then** the card shows the latest target's character name or `NPC` and updates the turret status to `ENGAGED` in red when the latest `behavior_change` is `STARTED_ATTACK`.
2. **Given** a turret's most recent `PriorityListUpdatedEvent` has a `behavior_change` other than `STARTED_ATTACK`, **When** the operator views the turret card or detail panel, **Then** the turret status returns to its non-engaged state rather than remaining stuck in `ENGAGED`.
3. **Given** the operator opens a turret detail panel, **When** the panel loads, **Then** it selects the latest `PriorityListUpdatedEvent` by default and uses that event to resolve the latest target's character name or `NPC`, tribe name when available, and aggressor state.
4. **Given** the latest target is an NPC with `character_id` equal to `0`, **When** the operator views the card or detail panel, **Then** the UI displays `NPC` instead of attempting a character-name lookup.
5. **Given** recent event data is available for multiple turrets, **When** the operator views the statistics panel, **Then** the panel's aggressor total reflects the grand total of aggressors observed across turrets in the past 24 hours.
6. **Given** demo mode is used to review this intelligence workflow, **When** the operator inspects cards and detail panels there, **Then** demo fixtures cover player targets, NPC targets, engaged turrets, restored statuses, and recent aggressor counts.

### Edge Cases

- What happens when the logo asset cannot be loaded in time for the first paint?
- How does the system handle small screens where a heavier visual treatment could crowd existing controls?
- What happens when the new palette reduces contrast for existing warning or danger states?
- How does the interface behave when the map embed keeps its own internal colors and cannot fully match the surrounding theme?
- What happens when operators switch between live and demo routes during the same session?
- What happens when the statistics panel has partial data because turret data and recent-event data arrive at different times?
- What happens when a turret has no `PriorityListUpdatedEvent` yet and therefore has no recent target intelligence to display?
- What happens when the latest `PriorityListUpdatedEvent` references a target whose character, tribe, or type information cannot be resolved?
- What happens when multiple aggressor events occur for the same turret in the past 24 hours and the shell-level total must avoid misleading duplication?
- What happens when demo fixtures drift behind the live data model and no longer exercise the new intelligence or statistics states?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST introduce a Sentinel logo treatment that is visible in the dashboard shell.
- **FR-002**: The system MUST apply a cohesive EVE Frontier-inspired theme across the dashboard shell, cards, drawers, detail panels, and primary supporting surfaces.
- **FR-003**: The updated theme MUST emphasize a stark and ominous space-facing palette rather than the current lighter neutral presentation.
- **FR-004**: The system MUST preserve clear visual distinction for status, warning, danger, selected, and neutral states under the new theme.
- **FR-005**: The system MUST preserve readability for primary operational information including turret names, solar systems, network nodes, and event log content.
- **FR-006**: Existing interactive feedback for buttons, cards, and selection states MUST remain tactile and responsive after the theme overhaul.
- **FR-007**: The unconnected wallet view MUST use the same logo and thematic system as the connected dashboard view.
- **FR-008**: Demo mode MUST reflect the same branding and thematic treatment as the live dashboard route.
- **FR-009**: Error, loading, and empty states MUST be visually consistent with the updated theme rather than reverting to a generic fallback presentation.
- **FR-010**: The system MUST preserve the brutalist structural language already established by the product while updating the palette, branding, and atmosphere.
- **FR-011**: The system MUST add a pilot statistics panel to the dashboard shell showing total turrets, engaged turrets, online turrets, offline turrets, and aggressors in the past 24 hours.
- **FR-012**: The statistics panel MUST derive its values from the same turret and event data used elsewhere in the dashboard rather than from separate placeholder data.
- **FR-013**: The system MUST record the finalized theme decisions in `./docs/DESIGN_SYSTEM.md`, including color palette usage, typography usage, component styling guidance, and accessibility/focus-state guidance.
- **FR-014**: The system MUST resolve each turret's latest meaningful target intelligence from that turret's latest `PriorityListUpdatedEvent`.
- **FR-015**: The turret card MUST limit its added target-intelligence presentation to the latest target's character name or `NPC` plus the turret's status shift to `ENGAGED` when the latest `behavior_change` is `STARTED_ATTACK`.
- **FR-016**: The turret detail panel MUST default its event viewer selection to the latest `PriorityListUpdatedEvent` when one exists.
- **FR-017**: The turret detail panel MUST use the selected latest `PriorityListUpdatedEvent` to display the target's character name or `NPC`, tribe name when available, and aggressor state.
- **FR-018**: The system MUST treat targets with `character_id` equal to `0` as NPCs and display `NPC` instead of attempting a character-name lookup.
- **FR-019**: The system MUST resolve and display a real tribe name when a `tribe_id` is available for the latest target and the lookup succeeds.
- **FR-020**: The system MUST continue to preserve the target's type identifier in the intelligence payload for downstream consumers.
- **FR-021**: When the latest `behavior_change` is `STARTED_ATTACK`, the turret's status MUST change from `ONLINE` to `ENGAGED` and use a red engaged-state treatment.
- **FR-022**: When the latest `behavior_change` is anything other than `STARTED_ATTACK`, the turret's status MUST revert to its normal non-engaged state.
- **FR-023**: The system MUST query the indexer database for each turret's aggressor activity in the past 24 hours and display that count on the turret card.
- **FR-024**: The statistics panel MUST display the grand total of aggressor activity in the past 24 hours using the same underlying indexer-derived counts.
- **FR-025**: Demo mode MUST be updated alongside this feature so its mock data exercises the new target-intelligence, engaged-status, and aggressor-count states instead of leaving those states absent or stale.

### Constitution Alignment

- [x] Spec adheres to Brutalist UX constraints (monospace, thick borders, no gradients).
- [x] Performance metrics and scalability goals are defined.

### Key Entities _(include if feature involves data)_

- **Theme Surface**: A branded dashboard surface such as the shell, card, drawer, detail panel, or map frame that must express the updated visual identity consistently.
- **Brand Asset**: The logo or related identity treatment that marks Sentinel as an EVE Frontier-facing product.
- **Interactive State Style**: The visual treatment for hover, active, selected, warning, danger, and neutral states under the new palette.
- **Pilot Statistics Panel**: A shell-level summary surface that communicates the operator’s current turret posture and recent hostile activity counts.
- **Target Intelligence Snapshot**: The latest resolved target state for a turret, derived from its latest `PriorityListUpdatedEvent`, including character-or-NPC identity, optional tribe name, aggressor state, and resulting turret engagement state.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: In design review, 100% of primary dashboard surfaces present a visibly consistent branded theme with no major surface left on the previous palette.
- **SC-002**: In manual usability checks, operators can still identify turret status, solar-system state, and assignment state on first glance across the updated interface.
- **SC-003**: Reviewers can distinguish the product as EVE Frontier-aligned within 5 seconds of opening either the live or demo route.
- **SC-004**: Live and demo routes show no major visual drift in logo treatment, shell styling, or core card/drawer theme language.
- **SC-005**: Operators can read the shell-level turret statistics without scanning individual turret cards for the same totals.
- **SC-006**: In manual review, operators can identify each turret's latest target as a player or `NPC` from the card view without opening the event log.
- **SC-007**: In manual review, the turret detail panel surfaces the latest target's enriched intelligence from the default selected `PriorityListUpdatedEvent` without requiring operators to inspect raw event payloads.
- **SC-008**: Demo mode presents representative examples of the new turret-intelligence and aggressor-count states during review, with no major missing or stale mock states.

## Assumptions

- The existing brutalist layout language remains the structural foundation for the dashboard.
- The theme overhaul is a visual and branding pass, not a change to core domain workflows.
- The map embed may retain some internally controlled visuals, so the surrounding shell carries the primary thematic alignment responsibility.
- Demo mode continues to exist and should remain representative of the live product’s visual direction.
- Demo mode remains part of the review and development workflow, so its mock data must evolve with the live dashboard contracts for turret intelligence and statistics.
- The existing logo asset at `./assets/logo.svg` will be reused as the base brand asset, and favicon assets can be derived from it.
- Character and tribe lookups are available from existing authoritative sources and can be joined onto the latest `PriorityListUpdatedEvent` without changing the event contract itself.
