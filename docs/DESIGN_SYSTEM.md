---
title: Frontier Sentinel - Design System
version: 1.0.0
status: draft
created: 2026-03-26
updated: 2026-03-26
author: rustydb
description: Styling, typography, and colors for use in Frontier Sentinel.
---

# Brutalist Design Review

- Uses `Outfit` for display typography and `JetBrains Mono` for body copy to keep the dashboard unmistakably mechanical.
- Applies sharp borders, hard shadows, and uppercase labels across cards, drawers, and action buttons.
- Avoids gradients and rounded corners; the only atmospheric treatment is a repeating paper-stripe background.
- Reserves `#ff5f1f` as the primary accent for wallet connection and high-signal status emphasis.
- Even within the brutalist aesthetic, the UI should feel fluid, responsive, and alive rather than static.

# Interaction Feel

- Interactive surfaces should acknowledge hover, focus, and active states with quick, tactile transitions.
- Buttons should feel pressable: hover fills them with signal color, and active states should visibly invert or collapse their shadow.
- Clickable cards should react on hover and maintain a persistent highlighted state when selected.
- Motion should stay subtle and fast. Favor tiny shifts in position, shadow, and fill over flashy animation.
- Stateful changes should be legible at a glance, especially for selected cards, copied controls, and destructive actions.

# Sui Addresses

Sui addresses are 32-byte indentifiers that appear in hexadecimal encoding with a `0x` prefix.

- Addresses should use the a **`ResponsiveAddress` component**:
    - Uses `abbreviateAddress` from `@evefrontier/dapp-kit/utils` with logic for finding perfect symetry
    - Props: `address`, `maxAbbreviation` (default 64), `as` (element type), `children`, `copyable`
    - Chooses the largest address representation that fits the available container width
    - **Critical CSS rule**: Parent flex items must have `minWidth: 0`
- Uses the upstream EVE Frontier `copy.svg` asset for copy-enabled surfaces
    - On successful copy, swaps to the upstream `tick.svg`, inverts the control colors, and shows a `Copied to clipboard` tooltip
    - Compact summary surfaces such as turret cards may set `copyable={false}` to keep the card visually lighter

Using a responsive address ensures that the address always fits within its container.

## Copy-paste

Copy access should be available where operators are expected to move addresses into external tools, but compact summary cards do not need an inline copy button if the same address remains accessible elsewhere in the flow.
