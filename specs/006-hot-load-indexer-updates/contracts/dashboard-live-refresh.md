# Contract: Dashboard Live-Refresh Behavior

## Purpose

Define how Frontier Sentinel keeps turret assemblies, network nodes, solar-system mappings, event context, and metrics fresh while the live dashboard remains open.

## Live Data Sources

The live dashboard revalidates its current state from the existing source-of-truth reads it already uses:

- turret ownership GraphQL query
- `GET /api/network-nodes`
- `GET /api/turret-solar-systems?ids=...`
- `GET /api/turret-intelligence?ids=...`
- `GET /api/events/:turretId`

Responses from the live GET endpoints are explicitly marked `no-store`, and the dashboard refresh coordinator treats them as transient reads rather than cacheable snapshots.

## Freshness Rules

- The live dashboard re-fetches automatically while the operator keeps it open.
- Refresh should happen without a page reload or a manual refresh control.
- Requests and responses used for live refresh are treated as fresh reads, not cacheable dashboard snapshots.
- When the dashboard tab loses visibility, refresh may slow down; when it regains focus, it should revalidate promptly.
- The refresh coordinator is visibility-aware and keeps selection continuity anchored by turret ID.

## Selection Continuity

- Selected turret context is anchored by turret ID.
- When the selected turret still exists after a refresh, the detail panel stays on that turret and reflects the latest data.
- When the selected turret disappears from the current indexed state, the selection clears gracefully instead of leaving a stale object pinned on screen.
- Open drawers and other unrelated UI state should stay open across routine refreshes.

## Demo Mode

- `/demo` remains fixture-driven and is not part of the live-refresh contract.
- Demo fixtures may be updated to stay representative, but demo mode does not poll the live data sources.
