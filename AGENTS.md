# AGENTS.md

## Purpose

This repository builds **Sentinel**, an EVE Frontier dashboard for viewing turret assemblies, their event history, and related operator metadata.

Agents working in this repo should preserve the current product direction:

- brutalist but polished UI
- fluid, responsive, alive interactions
- EVE Frontier terminology over generic web-app wording
- explicit, honest state handling instead of placeholder or inferred values

## Repo Shape

- `apps/dashboard`: React dashboard UI
- `apps/api`: Bun/Express API for dashboard support data
- `apps/indexer`: Rust indexer for Sui turret events
- `packages/shared-types`: shared GraphQL queries and TypeScript contracts
- `docs`: product/domain/design documentation
- `specs`: Speckit feature specs, plans, tasks, and quickstarts

## Read First

Before making meaningful changes, read these project documents:

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [CONSTITUTION.md](./docs/CONSTITUTION.md)

Notes:

- Update `CHANGELOG.md` alongside notable user-facing, architectural, and workflow changes. Do not leave major feature work undocumented.

## Local Workflow

Prefer the dev stack for iterative work:

```bash
podman compose -f docker-compose.dev.yml up
```

Key local endpoints:

- dashboard: `http://127.0.0.1:5174`
- api: `http://127.0.0.1:3002`
- postgres: `127.0.0.1:5433`

Use the main compose file only for the production-style stack:

```bash
podman compose up --build
```

This project uses **Podman**, not Docker, even if shell aliases make them look interchangeable.

## Validation

Default validation for dashboard work:

```bash
bun lint
bunx vitest run --environment jsdom
```

Use focused Vitest runs when iterating on a specific component or hook. Prefer validating the files you touched before broadening scope.

For Rust/indexer work:

```bash
cargo test --manifest-path apps/indexer/Cargo.toml
```

## UI Rules

Follow [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md).

Important established conventions:

- Use `Outfit` for display text and `JetBrains Mono` for body/system text.
- Keep borders sharp, shadows hard, and labels uppercase.
- Avoid gradients and rounded-corner modern SaaS styling.
- Reuse `./assets/mark.svg` for shell branding and favicon wiring.
- Interactions should feel tactile:
    - hover should react
    - active should visibly respond
    - selected state should persist clearly
- Favor subtle motion over flashy animation.

## Sui Address Rules

All user-visible Sui addresses should use the shared `ResponsiveAddress` component unless there is a very strong reason not to.

Important current expectations:

- it should fit the **largest** representation that the container allows
- it should react smoothly to resize in both directions
- parent layouts must allow shrinkage with `min-w-0`
- compact summary surfaces may disable copy controls with `copyable={false}`
- copy-enabled surfaces should use the themed EVE Frontier copy/tick asset behavior

Turret cards intentionally do **not** show inline copy buttons for addresses.

## EVE Frontier Domain Rules

Follow [docs/EVE_FRONTIER.md](./docs/EVE_FRONTIER.md).

Current world/API assumptions:

- `Utopia` is the current active world for development
- `Stillness` is the future production target
- world APIs differ by host; do not assume Stillness and Utopia share the same hostname pattern
- solar-system catalogs are bundled locally from both world `/v2/solarsystems` endpoints via `scripts/update-solar-systems.ts`

Turret naming precedence:

1. `metadata.name` if present and non-blank
2. type name from the world `/v2/types/{typeId}` API

If a custom name exists, show the type name nearby with lower emphasis.

Threat-intelligence rules:

- the latest `PriorityListUpdatedEvent` is the current threat summary for a turret
- `character_id === 0` means `NPC`
- `behavior_change === STARTED_ATTACK` should present the turret as `ENGAGED`
- 24-hour aggressor counts are indexer-derived summaries, not raw turret fields

## Network Nodes and Solar Systems

Current dashboard contract:

- a turret has either one assigned network node or none
- `energy_source_id` represents the assigned network node ID
- if there is no node, the turret is orphaned
- use the explicit orphaned notice already present in the UI

Do not conflate turret `locationHash` with solar system assignment.

Solar system display on the turret card should come from the local `network_node_mappings` table:

- if a node-to-system mapping exists, render from that mapping
- if no mapping exists, show `Unassigned`

Do not use `locationHash` as a fallback solar system label.

Retained mapping rules:

- `network_node_mappings` stores the active node-to-solar-system assignment
- `turret_solar_system_mappings` stores last-known solar systems for turrets that later become orphaned
- active node mappings win over retained mappings when both exist

## Turret Card Rules

Current card conventions matter:

- the top eyebrow uses the turret's Sui object ID
- the main title uses custom assembly name or resolved type name
- the status badge lives under the icon, not in the title row
- the field label must say `Network Node`, not just `Node`
- the `Item` field has been intentionally removed from the card

Be cautious about reintroducing horizontal competition in the title row.

## Demo Data

`apps/dashboard/src/test-data.ts` acts as demo-mode fixture data and lightweight living documentation.

Keep it aligned with:

- current event names
- current ownership assumptions
- current network-node assumptions
- current UI expectations
- current solar-system assignment and retained-mapping assumptions
- current threat-summary and shell-statistics expectations

Do not leave stale fake relationships in demo mode just to make the screen look busy.

## ADRs

Store architecture decision records in `docs/ADRs`.

Naming convention:

- `ADR-XXX-kebab-case-title.md`
- zero-padded three-digit numbering

## Specs

This repo uses Speckit. When working from a spec:

- keep `spec.md`, `plan.md`, and `tasks.md` aligned with implementation
- update quickstarts when runtime behavior changes
- retroactively update the spec/plan/contract docs if the user asks for behavior changes after implementation

## Editing Guidance

- Preserve user changes; do not revert unrelated work.
- Prefer narrow, local changes over broad refactors unless the refactor is clearly necessary.
- Update tests when behavior changes.
- If a UI decision has already been made in conversation and implemented, treat it as intentional unless asked to revisit it.
