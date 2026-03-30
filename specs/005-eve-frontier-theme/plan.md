# Implementation Plan: EVE Frontier Theme Overhaul

**Branch**: `005-eve-sentinel-theme` | **Date**: 2026-03-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-eve-sentinel-theme/spec.md`

## Summary

Overhaul Sentinel into a darker EVE Frontier-aligned shell by reusing the existing logo asset, introducing a documented theme token system, adding a shell-level statistics panel, and enriching turret cards/detail with latest target intelligence derived from turret events and indexer-backed aggressor counts. Keep demo and live routes visually aligned and treat demo fixtures as a first-class deliverable for review.

## Technical Context

**Language/Version**: TypeScript 5.8.x for dashboard/API code, SQL for the existing PostgreSQL-backed indexer data  
**Primary Dependencies**: React 19, Vite 6, Tailwind CSS 4, Bun, Express, `pg`, `@evefrontier/dapp-kit`, `@mysten/dapp-kit-react`, Vitest 3, Testing Library, Playwright  
**Storage**: Existing PostgreSQL database for indexer and assignment data, existing repo assets including `./assets/logo.svg`, and documented design tokens in `docs/DESIGN_SYSTEM.md`  
**Testing**: ESLint 9, Vitest 3, Testing Library, focused API repository/route tests, and Playwright/manual browser review across live and demo routes  
**Target Platform**: Modern desktop browsers for the dashboard plus the existing Bun API service  
**Project Type**: Bun monorepo web application  
**Performance Goals**: Preserve fluid card/detail interactions, avoid iframe reload regressions in `ef-map`, keep theme transitions tactile rather than heavy, and avoid per-render event aggregation work in the browser for turret intelligence  
**Constraints**: Must preserve brutalist structure, must reuse the existing logo asset, must document final design decisions in `docs/DESIGN_SYSTEM.md`, must keep demo mode representative of live behavior, must avoid `any`, and must derive aggressor counts from the indexer database instead of placeholder client data  
**Scale/Scope**: Dashboard shell, shared CSS/theme primitives, demo/live route parity, one new turret-intelligence API surface, event/detail enrichment, statistics-panel composition, and focused fixture/test updates

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Code Quality**: Plan stays within the existing strict TypeScript/Bun/PostgreSQL stack, forbids `any`, and keeps explicit typed contracts for dashboard and API surfaces.
- [x] **Testing Standards**: Plan keeps feature work test-first with focused component/hook/API coverage and browser-level review of both live and demo shells.
- [x] **UX Consistency**: Plan preserves the repo’s brutalist structure while intentionally evolving palette, branding, motion, and target-intelligence presentation in a documented way.
- [x] **Performance**: Plan avoids client-side event-log rescans for every card by introducing an aggregated intelligence surface and keeps `ef-map` on its existing dynamic path.

## Project Structure

### Documentation (this feature)

```text
specs/005-eve-sentinel-theme/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── dashboard-theme.md
│   └── turret-intelligence-api.md
└── tasks.md
```

### Source Code (repository root)

```text
assets/
└── logo.svg

apps/dashboard/
├── src/
│   ├── App.tsx
│   ├── DemoApp.tsx
│   ├── main.tsx
│   ├── index.css
│   ├── demo-mode.ts
│   ├── test-data.ts
│   ├── components/
│   │   ├── AppErrorBoundary.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── MapEmbed.tsx
│   │   ├── NetworkNodeDrawer.tsx
│   │   ├── TurretCard.tsx
│   │   └── TurretDetail.tsx
│   └── hooks/
│       ├── useTurretEvents.ts
│       ├── useTurrets.ts
│       ├── useTypeInfo.ts
│       └── useTurretIntelligence.ts

apps/api/
└── src/
    ├── app.test.ts
    ├── repositories.ts
    ├── routes.ts
    └── types.ts

packages/shared-types/
└── src/
    ├── index.ts
    └── turretIntelligence.ts

docs/
└── DESIGN_SYSTEM.md
```

**Structure Decision**: Keep the visual overhaul and shell composition inside `apps/dashboard`, extend the existing Bun API with one explicit turret-intelligence summary surface for recent target state and 24-hour aggressor counts, and treat `docs/DESIGN_SYSTEM.md` plus demo fixtures as required outputs of the feature rather than incidental cleanup.

## Complexity Tracking

No constitution violations are expected for this feature.
