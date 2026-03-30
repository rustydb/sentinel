# Implementation Plan: Hot-load Indexer Updates

**Branch**: `006-hot-load-indexer-updates` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-hot-load-indexer-updates/spec.md`

## Summary

Add a visibility-aware refresh layer to Sentinel so turret assemblies, network-node assignments, derived solar-system mappings, shell metrics, and event-driven turret context hot-load from the existing dashboard/API stack without a manual page refresh. Keep the live shell authoritative, preserve the operator's selected turret by ID across refreshes, and leave demo mode fixture-driven rather than turning it into a live polling surface.

## Technical Context

**Language/Version**: TypeScript 5.8.x for dashboard/API code, SQL for the existing PostgreSQL-backed indexer data  
**Primary Dependencies**: React 19, Vite 6, Bun, Express, `pg`, `@evefrontier/dapp-kit`, `@mysten/dapp-kit-react`, Vitest 3, Testing Library, Playwright  
**Storage**: Existing PostgreSQL database for indexer-derived turret, event, and network-node state; existing dashboard fixture data for `/demo`  
**Testing**: ESLint 9, Vitest 3, Testing Library, focused dashboard hook/component tests, API route tests, and manual browser validation of live refresh behavior  
**Target Platform**: Modern desktop browsers for the dashboard plus the existing Bun API service  
**Project Type**: Bun monorepo web application  
**Performance Goals**: Routine changes should appear in the live dashboard within 30 seconds, the refresh loop should back off when the tab is hidden, and the UI should keep the current selection/context stable while data updates land  
**Constraints**: Must preserve brutalist structure, must avoid `any`, must keep demo mode fixture-driven, must not require a full page reload for routine updates, and must treat the newest known indexed state as authoritative  
**Scale/Scope**: Dashboard polling/orchestration, turret and network-node data refresh, selection reconciliation, API freshness policy, and focused live/demo test updates

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Code Quality**: Uses strict TypeScript, explicit state contracts, and existing Bun/Express/PostgreSQL architecture without introducing `any`.
- [x] **Testing Standards**: Plan keeps the feature test-first with focused hook/component/API coverage and manual browser validation of live updates.
- [x] **UX Consistency**: Plan preserves the current brutalist shell while keeping live refresh behavior subtle, explicit, and non-disruptive.
- [x] **Performance**: Plan avoids websocket/SSE infrastructure, uses bounded polling with visibility awareness, and prevents stale caching on hot-loaded GET paths.

## Project Structure

### Documentation (this feature)

```text
specs/006-hot-load-indexer-updates/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── dashboard-live-refresh.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/dashboard/
├── src/
│   ├── App.tsx
│   ├── DemoApp.tsx
│   ├── components/
│   │   └── DashboardScreen.tsx
│   └── hooks/
│       ├── useDashboardRefresh.ts
│       ├── useNetworkNodes.ts
│       ├── useTurretEvents.ts
│       ├── useTurretIntelligence.ts
│       ├── useTurretSolarSystems.ts
│       └── useTurrets.ts
│   └── test-data.ts

apps/api/
├── src/
│   ├── app.ts
│   ├── repositories.ts
│   ├── routes.ts
│   ├── types.ts
│   └── app.test.ts

packages/shared-types/
└── src/
    └── index.ts
```

**Structure Decision**: Keep the refresh behavior in the existing dashboard hooks and shell composition, add one shared dashboard refresh coordinator for polling/visibility handling, and apply freshness policy at the API boundary rather than introducing a new transport layer or new persisted tables.

## Complexity Tracking

No constitution violations are expected for this feature.
