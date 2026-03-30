# Phase 0: Outline & Research

## Decision 1: Re-theme the dashboard through documented shell tokens, not one-off component overrides

- **Decision**: Drive the overhaul from a cohesive token layer in `apps/dashboard/src/index.css` and document the final palette, typography, component rules, and accessibility guidance in `docs/DESIGN_SYSTEM.md`.
- **Rationale**: This feature is bigger than a header repaint. A shell-level token pass keeps live and demo routes aligned, prevents component-by-component drift, and satisfies the new spec requirement that design choices be explicitly recorded for future work.
- **Alternatives considered**:
    - Update classes inline in each component only: rejected because it would make the theme brittle, inconsistent, and harder to document or evolve.
    - Introduce a separate design-token package first: rejected because the repo already has a workable CSS entry point and this feature does not need a second abstraction layer yet.

## Decision 2: Reuse `./assets/logo.svg` as the canonical brand source and derive shell/favicon treatments from it

- **Decision**: Use the existing `./assets/logo.svg` as the base logo asset, bring it into the dashboard shell, and derive favicon outputs from the same source rather than introducing a second logo family.
- **Rationale**: The spec explicitly assumes this asset exists and should anchor the first branded pass. Reusing it keeps the visual identity grounded and reduces the risk of parallel, inconsistent logo treatments.
- **Alternatives considered**:
    - Design a second temporary logo in code: rejected because it would fight the documented assumption and create brand drift.
    - Postpone logo work until after the palette overhaul: rejected because logo treatment is part of the feature’s highest-priority identity goal.

## Decision 3: Add a dedicated turret-intelligence summary API instead of deriving card intelligence from paginated event logs in the browser

- **Decision**: Extend the existing Bun API with a summary endpoint that returns, per turret, the latest `PriorityListUpdatedEvent` intelligence snapshot and the 24-hour aggressor count derived from the indexer database.
- **Rationale**: Turret cards and the statistics panel need cheap, aggregate-ready data. Deriving this from paginated `/api/events/:turretId` payloads in the client would duplicate parsing logic, create unnecessary fetch churn, and make the card view depend on event-log pagination details.
- **Alternatives considered**:
    - Re-scan `useTurretEvents` client-side and derive intelligence in React: rejected because it mixes detail-view concerns into every card render and does not scale cleanly with more turrets.
    - Store a separate precomputed materialized table just for this feature: rejected because the existing indexer/event data plus API aggregation are enough for the current scope.

## Decision 4: Resolve character and tribe identity through API enrichment, but keep the detail panel focused on identity and threat state

- **Decision**: Return target IDs plus resolved character/tribe names from the API summary, and present only target identity, tribe, and aggressor state in the turret detail panel.
- **Rationale**: Character and tribe naming are operator-facing labels that should be normalized before reaching the UI. The target-type surface is no longer part of the detail view, so the dashboard should avoid carrying type-icon rendering into that panel.
- **Alternatives considered**:
    - Keep target type icon rendering in the detail panel: rejected because that surface is now intentionally narrower and should emphasize identity and threat state instead of a broader enrichment grid.
    - Resolve character and tribe names entirely in the browser: rejected because those lookups belong closer to the event/indexer aggregation boundary and would create more distributed fetch logic across card/detail surfaces.

## Decision 5: Treat `ENGAGED` as a view-level override derived from the latest priority event, not a new persisted turret status

- **Decision**: Introduce a view status override where `STARTED_ATTACK` elevates the rendered status to `ENGAGED`, and any later non-attack behavior restores the normal turret status presentation.
- **Rationale**: The requested engaged state is a higher-signal operational interpretation of recent event data, not a change to the underlying on-chain assembly status contract. Keeping it as a derived UI state avoids polluting core turret persistence.
- **Alternatives considered**:
    - Persist `ENGAGED` as a new turret status in shared turret data: rejected because that would blur the line between on-chain assembly status and operator-facing threat state.
    - Show a second separate “attack state” chip instead of changing status: rejected because the user explicitly wants the turret status itself to shift to `ENGAGED`.

## Decision 6: Make demo mode an explicit acceptance surface for target intelligence and statistics

- **Decision**: Update `demo-mode.ts` and `test-data.ts` with representative fixture scenarios for player targets, NPC targets, engaged turrets, restored statuses, and 24-hour aggressor totals.
- **Rationale**: Demo mode is part of the product-review workflow in this repo. If it does not exercise the new states, the design pass cannot be reviewed honestly and the feature will regress into live-only behavior.
- **Alternatives considered**:
    - Leave demo mode visually updated but semantically stale: rejected because the spec now explicitly forbids stale mock states.
    - Create a separate one-off storybook fixture surface instead of updating demo mode: rejected because `/demo` already serves that review purpose in this product.
