# UI Contract: Responsive Address

## Purpose

Define the shared dashboard contract for rendering Sui addresses in a way that remains contained within the parent container while preserving access to the full address value.

## Inputs

- `address`: Required full Sui address string with `0x` prefix.
- `maxAbbreviation`: Optional upper bound for visible abbreviation length.
- `as`: Optional semantic element override.
- `children`: Optional accessible or contextual label content if the caller needs to wrap the address within a broader phrase.
- `copyable`: Optional boolean that lets compact surfaces opt out of the inline copy control while still using the shared responsive sizing behavior.

## Visible Behavior

1. The component renders the full address when enough horizontal space is available.
2. The component shortens the visible address as the available width decreases.
3. The component never causes its parent layout to overflow horizontally solely because of address length.
4. The component updates its visible form when the parent container is resized after initial render.

## Copy Behavior

1. Any provided copy action uses the original full address value.
2. Shortening the visible text never changes the copied value.
3. Surfaces that expose copy behavior use the upstream EVE Frontier `copy.svg` asset rather than a generic icon or text-only treatment.
4. After a successful copy action, the control provides subtle visual feedback, including a temporary success state, the upstream EVE Frontier `tick.svg` glyph, and a tooltip that says `Copied to clipboard`.
5. Compact summary surfaces, including turret cards, may intentionally suppress the inline copy affordance to reduce visual noise while still using the shared responsive-address rendering.
6. If the address is missing or invalid, the component renders a safe fallback state and does not expose a broken copy action.

## Caller Responsibilities

1. Use this contract for every user-visible Sui address in the dashboard.
2. Ensure the parent flex/grid layout permits shrink behavior consistent with the design-system requirement.
3. Do not introduce local one-off truncation logic for Sui addresses outside this shared contract.
4. Use the themed copy affordance on detail-oriented surfaces where copy is part of the operator workflow, and intentionally disable it on compact summary surfaces when reducing noise matters more.
