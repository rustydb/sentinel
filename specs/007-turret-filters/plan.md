# Implementation Plan: Turret Filters

**Branch**: `007-turret-filters` | **Date**: 2026-03-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-turret-filters/spec.md`

## Summary

Add operator-facing turret filtering in the dashboard so users can narrow the list by solar system, turret identity, known network node, status, and class while preserving explicit empty, loading, and selected-context states.

## Technical Context

**Language/Version**: TypeScript 5.8.x in the dashboard and shared-types packages, with the existing React 19 / Vite 6 stack  
**Primary Dependencies**: React 19, Vite 6, Bun, `@frontier-sentinel/shared-types`, existing dashboard hooks, Testing Library, Vitest 3, Playwright  
**Storage**: No new storage; filtering is derived from the already loaded turret data and existing node / solar-system / type resolution surfaces  
**Testing**: Vitest for filter logic and component behavior, Testing Library for interaction coverage, existing Playwright coverage for end-to-end operator flows  
**Target Platform**: Desktop browser dashboard  
**Project Type**: Bun monorepo web application  
**Performance Goals**: Filter changes should feel immediate, with visible results updating within a single interaction cycle and empty states rendered without a second confirm step  
**Constraints**: Keep the brutalist dashboard language, preserve explicit operator-state messaging, avoid adding a new backend persistence surface, and reuse the existing type / solar-system / network-node resolution logic  
**Scale/Scope**: Dashboard-only filtering across turret cards, list state, selected-turret behavior, and empty-state messaging

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Code Quality**: Plan stays in the existing strict TypeScript dashboard stack and uses the current shared-types and hook patterns instead of introducing a new runtime or data store.
- [x] **Testing Standards**: Plan keeps the feature test-first with unit coverage for filter derivation and component behavior plus interaction coverage for list updates and empty-state handling.
- [x] **UX Consistency**: Plan preserves the brutalist interface, explicit state labeling, and visible tactical context already established in the dashboard.
- [x] **Performance**: Plan keeps filtering local to the dashboard view and avoids extra round trips for each filter change.

## Project Structure

### Documentation (this feature)

```text
specs/007-turret-filters/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── dashboard-filtering.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/dashboard/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── DashboardScreen.tsx
│   │   ├── TurretCard.tsx
│   │   ├── TurretDetail.tsx
│   │   └── TurretFilterBar.tsx
│   ├── hooks/
│   │   ├── useTurretFilters.ts
│   │   ├── useTurretSolarSystems.ts
│   │   ├── useTurretIntelligence.ts
│   │   ├── useNetworkNodes.ts
│   │   └── useTypeInfo.ts
│   └── test-data.ts
└── tests/
    └── e2e/
        └── dashboard.spec.ts

packages/shared-types/
└── src/
    ├── index.ts
    └── solarSystems.ts
```

**Structure Decision**: Keep the feature entirely in the dashboard layer, with a dedicated turret-filter hook and filter bar component for UI state, while reusing shared types and the existing solar-system, network-node, and type-resolution helpers. No API or storage changes are required for the first implementation pass.

## Complexity Tracking

No constitution violations are expected for this feature.
