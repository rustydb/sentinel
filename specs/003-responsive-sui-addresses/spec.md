# Feature Specification: Responsive Sui Addresses

**Feature Branch**: `003-responsive-sui-addresses`  
**Created**: 2026-03-28  
**Status**: Implemented  
**Input**: User description: "All Sui addresses should be responsive to their container size per ./docs/DESIGN_SYSTEM.md#SuiAddresses"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Keep Address-Heavy Views Readable (Priority: P1)

As an operator using the dashboard on different screen sizes, I want every visible Sui address to fit within its container so that cards, drawers, lists, and tables stay readable without breaking layout.

**Why this priority**: Address overflow makes the core dashboard hard to scan and can break the surrounding interface, so this is the most important user-facing outcome.

**Independent Test**: Can be fully tested by viewing address-heavy screens at multiple container widths and verifying that addresses remain contained and readable without causing horizontal layout breakage.

**Acceptance Scenarios**:

1. **Given** a dashboard view that displays one or more Sui addresses, **When** the viewport or parent container becomes narrower, **Then** each address remains contained within its visible area and the surrounding layout does not overflow horizontally.
2. **Given** a detail panel or card containing a long Sui address, **When** the address is rendered in a constrained width, **Then** the address presentation adapts to the available space instead of clipping, overlapping adjacent content, or forcing horizontal scrolling.

---

### User Story 2 - Preserve Full Address Access (Priority: P2)

As an operator reviewing turrets and related on-chain objects, I want to access and copy the full Sui address even when the displayed form is shortened so that I can paste the exact identifier into other tools.

**Why this priority**: Responsive display is only useful if it does not hide the actual identifier from operators who need the full value.

**Independent Test**: Can be fully tested by viewing shortened addresses in the UI and confirming that the complete address can still be copied from the surfaces that expose copy actions, while compact surfaces such as turret cards stay visually lighter.

**Acceptance Scenarios**:

1. **Given** a shortened Sui address is shown in the interface, **When** I use the provided copy behavior, **Then** the full original address is copied rather than the shortened display form.
2. **Given** the same Sui address appears in multiple UI contexts, **When** I access it from a surface that exposes copy behavior, **Then** the full address remains available consistently.
3. **Given** I click the address copy control, **When** the copy action succeeds, **Then** the control provides immediate visual feedback and a tooltip that says `Copied to clipboard`.
4. **Given** a compact summary surface such as a turret card, **When** it renders a Sui address, **Then** the address still responds to the available width without adding a copy button that makes the card busier.

---

### User Story 3 - Apply One Consistent Address Pattern (Priority: P3)

As a developer maintaining the dashboard, I want Sui addresses to behave consistently wherever they appear so that new screens do not reintroduce overflow bugs or inconsistent copy behavior.

**Why this priority**: Consistency reduces maintenance overhead and keeps future UI changes aligned with the design system.

**Independent Test**: Can be tested by comparing multiple address surfaces in the application and verifying that they all follow the same responsive and copy-access rules.

**Acceptance Scenarios**:

1. **Given** Sui addresses are displayed in more than one screen or component, **When** I compare their behavior under resize and copy interactions, **Then** they follow the same responsive presentation and full-address access rules.

### Edge Cases

- What happens when a Sui address is rendered inside an extremely narrow container? The display should still remain contained and avoid breaking surrounding layout.
- What happens when an address field is unavailable or empty? The interface should show a safe fallback state without rendering broken copy actions or malformed identifiers.
- What happens when a container resizes after the initial render? The displayed address form should update to remain within the new available space.
- What happens when a user clicks the copy control repeatedly? The success feedback should reset cleanly without stacking duplicate tooltips or broken visual states.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST ensure that every user-visible Sui address adapts to the available container width without causing horizontal layout breakage.
- **FR-002**: System MUST preserve the ability to access the full underlying Sui address even when the displayed form is shortened.
- **FR-003**: System MUST provide a copy interaction for address surfaces where operators are expected to copy full identifiers from the interface.
- **FR-004**: System MUST apply the same responsive-address behavior consistently across dashboard surfaces that display Sui addresses.
- **FR-005**: System MUST update address presentation when the available container size changes after initial render.
- **FR-006**: System MUST handle missing or invalid address values gracefully without displaying malformed identifiers or broken copy actions.
- **FR-007**: System MUST provide immediate visual confirmation after a successful address copy action, including a subtle control-state change and a tooltip reading `Copied to clipboard`.
- **FR-008**: System MUST allow compact summary surfaces such as turret cards to opt out of the copy control while still using the shared responsive-address sizing behavior.

### Constitution Alignment

- [x] Spec adheres to Brutalist UX constraints (monospace, thick borders, no gradients).
- [x] Performance metrics and scalability goals are defined.

### Key Entities _(include if feature involves data)_

- **Sui Address Presentation**: Any user-visible rendering of a Sui address within the dashboard, including cards, lists, drawers, detail rows, and related actions.
- **Copy Interaction**: The user-facing control or affordance that returns the full Sui address value regardless of the shortened display form and shows success feedback after copying on surfaces that expose copy behavior.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of user-visible Sui addresses remain visually contained within their parent containers across supported dashboard layouts.
- **SC-002**: 100% of user-visible Sui addresses continue to provide access to the full address value through the UI after responsive shortening is applied.
- **SC-003**: No dashboard view that includes Sui addresses introduces horizontal scrolling solely because of address length.
- **SC-004**: Developers can add a new address display to the dashboard without creating a one-off address behavior that differs from the shared address pattern.

## Assumptions

- The dashboard already has places where Sui addresses are shown and those existing surfaces are in scope for this feature.
- Copying the full address is the expected operator workflow when moving data into external tools, but not every compact surface needs an inline copy button.
- This feature applies to address display behavior only and does not change the underlying address data model.
- The design-system guidance in [docs/DESIGN_SYSTEM.md](../../docs/DESIGN_SYSTEM.md) is the source of truth for how address presentation should behave.
