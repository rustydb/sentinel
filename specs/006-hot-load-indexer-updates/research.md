# Phase 0: Outline & Research

## Decision 1: Use visibility-aware polling against the current dashboard endpoints instead of adding SSE or WebSockets

- **Decision**: Refresh live dashboard data on an interval while the tab is visible, slow or pause refresh when hidden, and trigger an immediate revalidation on focus or visibility return.
- **Rationale**: The repo already uses pull-based dashboard hooks and existing API endpoints. Polling keeps the implementation local to the dashboard and API boundary, avoids new long-lived transport infrastructure, and is sufficient for the spec's 30-second freshness target.
- **Alternatives considered**:
    - SSE/WebSockets: rejected because they would introduce new server/runtime complexity without a clear need in the current repo.
    - Manual refresh only: rejected because the feature explicitly exists to remove the need for a page reload or manual reload action.

## Decision 2: Preserve operator context by anchoring selection on turret ID rather than the turret object reference

- **Decision**: Track the selected turret by `id`, then resolve the latest matching turret object from the freshest turret list after every refresh.
- **Rationale**: The current UI stores the entire turret object, which is fine for one-shot rendering but fragile when the data source refreshes. A stable ID anchor keeps the selection coherent, allows updated turret data to flow through the detail panel, and lets the UI clear gracefully if the turret disappears.
- **Alternatives considered**:
    - Keep the selected turret as an object and hope it stays in sync: rejected because refreshed turret arrays create stale references and make disappearance handling awkward.
    - Track selection by list index: rejected because list order can change and would create fragile selection drift.

## Decision 3: Mark hot-loaded GET responses and fetches as non-cacheable

- **Decision**: Treat dashboard refresh requests as fresh reads by using `no-store` semantics on the client and `Cache-Control: no-store` on the API GET responses that feed the live dashboard.
- **Rationale**: Hot-loading is only trustworthy if the browser and any intermediary cache cannot reuse stale turret, node, or intelligence responses. The repo currently does not set cache headers for these routes, so freshness needs to be made explicit.
- **Alternatives considered**:
    - Add query-string cache busters everywhere: rejected because it is noisier and easier to miss across several hooks.
    - Rely on default browser caching: rejected because it undermines the feature goal and can hide recent indexer updates.

## Decision 4: Leave demo mode fixture-driven and out of the polling loop

- **Decision**: Keep `/demo` as static fixture-backed review data instead of polling the API.
- **Rationale**: Demo mode already serves as the controlled review surface for product discussion. Making it hot-load would blur the distinction between live state and curated fixture state, and the spec only asks for live hot-loading.
- **Alternatives considered**:
    - Poll demo mode too: rejected because it adds unnecessary moving parts and makes demo review less predictable.
    - Hide stale demo data behind live polling: rejected because it would weaken the honesty of the demo surface.

## Decision 5: Use a shared refresh coordinator rather than independent ad hoc timers in every hook

- **Decision**: Centralize the refresh cadence in a small dashboard-level refresh coordinator hook, then let the turret, node, solar-system, intelligence, and event hooks react to a shared refresh tick.
- **Rationale**: A shared cadence keeps the data surfaces aligned and reduces the chance that different cards show inconsistent snapshots from slightly different polling moments. It also makes it easier to pause or slow refresh when the tab is hidden.
- **Alternatives considered**:
    - Independent timers in each hook: rejected because it makes snapshot timing less coherent and duplicates refresh policy.
    - Re-fetch only from the top-level `App` component: rejected because it would push too much orchestration into a single component and make the hooks less reusable.
