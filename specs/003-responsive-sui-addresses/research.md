# Phase 0: Outline & Research

## Decision 1: Use one shared `ResponsiveAddress` component for all dashboard address displays

- **Decision**: Implement a single reusable address presentation component and route every user-visible Sui address through it rather than letting each screen abbreviate or wrap addresses independently.
- **Rationale**: The design system already defines a `ResponsiveAddress` pattern and its required behavior. Centralizing that behavior is the most reliable way to meet the feature requirement that all address surfaces stay consistent under resize and retain full-address access.
- **Alternatives considered**:
    - Apply CSS-only truncation per screen: rejected because it would not dynamically adapt abbreviation length and would drift across screens.
    - Keep raw address rendering and fix only the currently broken screens: rejected because the spec explicitly requires consistency across all current and future address displays.

## Decision 2: Preserve copy behavior against the full underlying address, not the shortened display

- **Decision**: Treat the displayed abbreviation as presentation-only and keep copy interactions bound to the full original address value.
- **Rationale**: Operators need exact Sui identifiers for external tools, and the spec requires that shortening never compromise access to the full value.
- **Alternatives considered**:
    - Copy the visible shortened text: rejected because it fails the operator workflow and violates the spec.
    - Remove copy affordances from cramped layouts: rejected because narrow containers are exactly where preserving full-value access matters most.

## Decision 3: Scope implementation to the dashboard’s existing address-heavy surfaces first

- **Decision**: Update the wallet header, turret cards/detail views, and any current address-bearing fields in demo/live flows before expanding to future screens.
- **Rationale**: These are the known surfaces already rendering Sui addresses today, and they are enough to satisfy the current specification while establishing a reusable path for future additions.
- **Alternatives considered**:
    - Rewrite all text-bearing fields indiscriminately: rejected because not every field is a Sui address and that would increase regression risk.
    - Limit the work to the wallet header only: rejected because turret and node-related address fields are also part of the primary operator workflow.

## Decision 4: Use the upstream EVE Frontier copy icon asset for address copy affordances

- **Decision**: Use the upstream `copy.svg` asset from the EVE Frontier UI components package for the address copy button instead of inventing a new local icon.
- **Rationale**: The feature should look and feel native to the EVE Frontier visual language, and reusing the upstream asset keeps the copy affordance consistent with the rest of that ecosystem.
- **Alternatives considered**:
    - Use a text-only copy button: rejected because the feature explicitly needs the themed control.
    - Draw a new local icon from scratch: rejected because it would drift from upstream branding and create unnecessary maintenance overhead.

## Decision 5: Provide in-place copy success feedback using the upstream tick glyph and tooltip

- **Decision**: After a successful copy action, temporarily swap the copy control to the upstream `tick.svg`, invert the control colors, and show a short-lived tooltip that says `Copied to clipboard`.
- **Rationale**: Operators need immediate confirmation that the copy action succeeded, and subtle in-place feedback keeps the interaction fast without adding a separate toast or breaking layout rhythm.
- **Alternatives considered**:
    - No visible confirmation beyond clipboard behavior: rejected because it leaves the action feeling uncertain.
    - A global toast notification: rejected because it is louder than necessary for a small repeated interaction.
