# Implementation Plan: Solar System Assignment

**Branch**: `004-solar-system-assignment` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-solar-system-assignment/spec.md`

## Summary

Add a bundled solar-system catalog and operator assignment workflow that lets players assign solar systems to network nodes, preserve retained solar-system state for orphaned turrets, surface friendly solar-system names across turret views, and drive `ef-map` through its dynamic postMessage API instead of iframe reloads.

## Technical Context

**Language/Version**: TypeScript 5.8.x for dashboard/API code, SQL for the existing PostgreSQL schema  
**Primary Dependencies**: React 19, Vite 6, Tailwind CSS 4, Bun, Express, `pg`, `@evefrontier/dapp-kit`, `@mysten/dapp-kit-react`, Vitest 3, Testing Library, Playwright  
**Storage**: Existing PostgreSQL database for node and retained turret mappings plus a versioned bundled solar-system catalog committed in the repo  
**Testing**: Vitest 3, Testing Library, ESLint 9, existing API handler/repository tests, Playwright smoke/E2E coverage for drawer + map focus behavior  
**Target Platform**: Modern desktop browsers for the dashboard plus the existing Bun API service  
**Project Type**: Bun monorepo web application  
**Performance Goals**: Solar-system autocomplete should feel instant from local bundled data, map transitions should not reload the iframe, and card/detail/map state changes should update within a single interaction cycle  
**Constraints**: Must use `ef-map` dynamic loading via postMessage, must reuse the existing PostgreSQL database rather than introduce a new primary store, must preserve responsive-address behavior, must support orphaned turrets retaining solar-system state, and must avoid per-search live calls to the world API  
**Scale/Scope**: Dashboard UI, Bun API persistence, bundled solar-system data/update script, shared contracts/types, and focused test coverage for node drawer, assignment flow, and map behavior

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Code Quality**: Plan stays within the existing strict TypeScript/Bun/PostgreSQL stack and extends the current repository patterns instead of introducing an additional runtime or database engine.
- [x] **Testing Standards**: Plan keeps feature work test-first with unit coverage for catalog/search/merge logic, API handler coverage for persistence, and browser-level coverage for drawer and map behavior.
- [x] **UX Consistency**: Feature preserves the dashboard’s brutalist card/drawer language, responsive-address pattern, and explicit operator-state messaging.
- [x] **Performance**: Plan avoids per-keystroke network lookups, keeps `ef-map` loaded dynamically, and reuses bundled catalog data and existing persistence surfaces.

## Project Structure

### Documentation (this feature)

```text
specs/004-solar-system-assignment/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── map-focus.md
│   └── solar-system-assignment-api.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/dashboard/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── MapEmbed.tsx
│   │   ├── NetworkNodeCard.tsx
│   │   ├── NetworkNodeDrawer.tsx
│   │   ├── SolarSystemAutocomplete.tsx
│   │   ├── TurretCard.tsx
│   │   └── TurretDetail.tsx
│   ├── hooks/
│   │   ├── useNetworkNodes.ts
│   │   ├── useSolarSystemCatalog.ts
│   │   └── useTurretSolarSystems.ts
│   └── test-data.ts
├── tests/e2e/
│   └── map.spec.ts
└── vite.config.ts

apps/api/
├── src/
│   ├── app.test.ts
│   ├── db.ts
│   ├── repositories.ts
│   ├── routes.ts
│   └── types.ts

packages/shared-types/
└── src/
    ├── index.ts
    └── solarSystems.ts

scripts/
└── update-solar-systems.ts
```

**Structure Decision**: Keep all operator-facing UI inside `apps/dashboard`, extend the existing Bun API for persistence, and place the generated solar-system catalog in `packages/shared-types` so both dashboard and API can consume the same versioned dataset. Reuse the current database with one additional retained-mapping table rather than creating a second data store.

## Complexity Tracking

No constitution violations are expected for this feature.
