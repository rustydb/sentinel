---
title: Sentinel - Design System
version: 1.1.0
status: draft
created: 2026-03-26
updated: 2026-03-30
author: rustydb
description: Branding, palette, typography, component guidance, and accessibility rules for Sentinel.
---

# Sentinel Design System

Sentinel keeps the repo's brutalist structure, but the visual mood now needs to feel closer to EVE Frontier itself:

- stark
- ominous
- tactical
- readable under pressure

The shell should feel like ship telemetry, not a generic admin app.

## Brand Asset

- Canonical logo source: `./assets/logo.svg`
- Dashboard shell, wallet-connect surface, error fallback, and browser favicon should all derive from that same SVG asset
- The logo should always sit inside a hard-edged framed container, never as a floating soft-mark

## Color Palette

| Token                 | Hex       | Usage                                                                |
| --------------------- | --------- | -------------------------------------------------------------------- |
| `--color-canvas`      | `#090b0d` | Global page background                                               |
| `--color-shell`       | `#111418` | Header shell, drawers, large chrome surfaces                         |
| `--color-paper`       | `#171b20` | Primary cards and detail panels                                      |
| `--color-panel`       | `#1b2026` | Nested framed sections such as stats and dropdown bodies             |
| `--color-panel-inset` | `#12161b` | Inset cells, target intel boxes, retained notices, map frame backing |
| `--color-ink`         | `#ede0c8` | Primary text color and high-emphasis framing                         |
| `--color-line`        | `#332f29` | Softer structural borders and dividers                               |
| `--color-muted`       | `#8b8172` | Labels, helper text, lower-emphasis copy                             |
| `--color-glow`        | `#ffe7bf` | High-emphasis shell title treatment                                  |
| `--color-accent`      | `#ff6a21` | Primary active state and shell signal color                          |
| `--color-engaged`     | `#d44337` | `ENGAGED` turret state                                               |
| `--color-positive`    | `#52d39b` | Healthy and online emphasis                                          |
| `--color-danger`      | `#cf4740` | Destructive actions, error framing, danger text                      |

### Palette Rules

- Avoid white as a default surface fill; use `shell`, `paper`, `panel`, or `panel-inset` first
- Prefer `line` for most structural borders and reserve `ink` for text and high-emphasis framing
- Use the accent sparingly so it remains a real signal
- `ONLINE` should read healthy rather than loud
- `ENGAGED` must read hotter and more dangerous than `ONLINE`
- Muted text should still remain readable against dark surfaces

## Typography

| Role          | Font             | Usage                                                        |
| ------------- | ---------------- | ------------------------------------------------------------ |
| Display       | `Outfit`         | Shell headings, turret names, large statistics values        |
| Body / System | `JetBrains Mono` | Labels, addresses, event metadata, button text, field values |

### Type Rules

- Headings should be uppercase and confident
- Operational labels should remain uppercase monospace
- Sui addresses stay in monospace and use the shared `ResponsiveAddress` component
- Large display type can glow slightly, but body text should stay crisp and flat

## Layout & Surfaces

- Borders stay sharp and explicit
- Shadows stay hard and offset, but shorter and softer than the earlier high-contrast pass
- Rounded corners are out of bounds
- Gradients are out of bounds
- The shell should feel dense and engineered, but still leave enough breathing room for scanning

### Surface Hierarchy

1. Canvas: page background
2. Shell: header, error shell, drawer framing
3. Paper: cards and primary detail surfaces
4. Panel: supporting containers like statistics and dropdown bodies
5. Panel inset: nested telemetry boxes and notices

## Component Guidance

### Dashboard Shell

- Must show the Sentinel logo, telemetry subtitle, and a high-emphasis shell title
- Must include the pilot statistics panel directly in the shell
- Wallet controls, the metrics blind, and network-node drawer controls should live in the same visual family as the rest of the shell
- The sticky toolbar should stay compact and structurally aligned rather than feeling like separate floating controls

### Turret Cards

- Top eyebrow: turret Sui object ID
- Main title: custom assembly name or resolved type name
- Type subtitle: only when a custom name exists
- Status badge lives under the icon column
- Compact threat data only:
    - recent target name or `NPC`
    - 24-hour aggressor count
    - `ENGAGED` state override when latest priority data says `STARTED_ATTACK`
- `Orphaned node assignment` should be visually explicit but contained

### Turret Detail

- Default the intelligence view to the latest `PriorityListUpdatedEvent`
- Show richer target intelligence than the card:
    - target name or `NPC`
    - aggressor state
    - tribe
    - source event reference
- Node assignment actions should remain compact and inline with the address row
- Event log rows should act like blinds:
    - row click opens a payload reveal rather than auto-opening on turret selection
    - payloads should render as pretty-printed JSON with syntax highlighting
    - selecting another row should smoothly close the previous payload reveal
- Event timestamps may switch between local time and UTC, but whichever mode is active should stay clear in the header and consistent across the table

### Network Node Drawer

- Drawer should feel like shell infrastructure, not a separate mini app
- Node cards should mirror turret-card language where practical
- Empty and loading states should still look intentional and in-world

### Statistics Panel

- Must show:
    - total turrets
    - engaged turrets
    - online turrets
    - offline turrets
    - aggressors in the past 24 hours
- Values should be bold and scan-friendly
- Labels should stay compact and monospace
- The metrics panel may collapse into a blind from the sticky shell toolbar when space is tight

### Map Frame

- The `ef-map` embed can keep its own internal rendering
- Sentinel is responsible for the frame, title, and surrounding shell treatment
- Focus changes should feel smooth; the map container should not visually reload on every selection

## Loading, Empty, and Error States

- Do not drop back to generic white fallback panels
- Use themed loading copy such as telemetry syncing language instead of plain placeholder text where possible
- Empty states should still sound like operator tooling, not consumer SaaS
- Error states should be framed as telemetry or system faults, not vague generic failures

## Accessibility & Focus States

- Interactive controls must keep visible focus indication against dark surfaces
- `aria-label`s are required for icon-only controls like copy buttons
- Dropdown triggers must expose `aria-expanded`
- Drawer and detail dismiss controls should use icon-only buttons with clear accessible labels
- Selected turret cards must keep a persistent selected state that is visible beyond hover
- Danger actions must remain distinguishable by more than color alone where practical

## Responsive Address Rules

- All user-visible Sui addresses should use `ResponsiveAddress` unless there is a strong reason not to
- `ResponsiveAddress` uses `abbreviateAddress` from `@evefrontier/dapp-kit/utils`
- It should choose the largest representation that fits the container
- Parent flex/grid containers must allow shrinkage with `min-w-0`
- Compact summary surfaces may disable copy with `copyable={false}`
- Copy-enabled surfaces use the themed copy/tick asset behavior

## Demo Mode

- `/demo` is not allowed to drift into a stale visual side path
- Demo fixtures must support current review scenarios for:
    - engaged turrets
    - player targets
    - NPC targets
    - orphaned retained mappings
    - shell statistics

## Review Checklist

Before merging visual work, confirm:

- logo treatment is visible in live, demo, and fallback shells
- all primary surfaces use the current dark token system
- status, danger, and selected states remain immediately legible
- `DESIGN_SYSTEM.md` is updated when the theme or component rules change
