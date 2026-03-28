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

# Sui Addresses

Sui addresses are 32-byte indentifiers that appear in hexadecimal encoding with a `0x` prefix.

- Addresses should use the a **`ResponsiveAddress` component**:
    - Uses `ResizeObserver` + hidden measurement span to dynamically abbreviate Sui addresses
    - Props: `address`, `maxAbbreviation` (default 28), `as` (element type), `children`
    - **Critical CSS rule**: Parent flex items must have `minWidth: 0`

Using a responsive address ensures that the address always fits within its container.

## Copy-paste

All Sui addresses should have a copy-and-paste button or property available.
