# Implementation Plan: Responsive Sui Addresses

**Branch**: `003-responsive-sui-addresses` | **Date**: 2026-03-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-responsive-sui-addresses/spec.md`

## Summary

Make every user-visible Sui address in the dashboard responsive to its container width by introducing one shared address presentation pattern, replacing raw address renders in the current address-heavy surfaces, and preserving full-address copy access everywhere an address is shown with the EVE Frontier-themed copy control.

## Technical Context

**Language/Version**: TypeScript 5.8.x, React 19.1.x  
**Primary Dependencies**: React 19, `@evefrontier/dapp-kit`, `@mysten/dapp-kit-react`, Tailwind CSS 4, Vite 6  
**Storage**: N/A  
**Testing**: Vitest 3, Testing Library, Playwright (existing dashboard E2E suite), ESLint 9  
**Target Platform**: Modern desktop browsers via the dashboard web app served by Bun/Vite
**Project Type**: Frontend web application within a Bun monorepo  
**Performance Goals**: Address displays remain contained during resize, avoid introducing horizontal scroll, and update responsively without visible layout thrash in dashboard views  
**Constraints**: Must follow `docs/DESIGN_SYSTEM.md` address guidance, preserve brutalist styling, use the upstream EVE Frontier copy/tick glyphs for address copy affordances and success feedback, keep full-address copy access, avoid backend/schema changes, and work in both live and demo flows  
**Scale/Scope**: Shared address component plus all current dashboard address surfaces, related tests, and fixture/demo data alignment

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Code Quality**: Implementation stays in strict TypeScript within the existing dashboard workspace and does not require Docker/runtime deviations.
- [x] **Testing Standards**: Plan assumes test-first updates for the new shared component and affected dashboard surfaces, with existing lint/unit/E2E gates preserved.
- [x] **UX Consistency**: Address rendering will use the design-system-prescribed responsive pattern while preserving the current brutalist typography and controls.
- [x] **Performance**: Scope is frontend-only, avoids new network/data work, and explicitly targets contained rendering during resize without layout regressions.

## Project Structure

### Documentation (this feature)

```text
specs/003-responsive-sui-addresses/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── responsive-address.md
└── tasks.md
```

### Source Code (repository root)

```text
apps/dashboard/
├── src/
│   ├── App.tsx
│   ├── assets/
│   │   └── copy.svg
│   │   └── tick.svg
│   ├── components/
│   │   ├── ResponsiveAddress.tsx
│   │   ├── TurretCard.tsx
│   │   ├── TurretDetail.tsx
│   │   └── *.test.tsx
│   ├── hooks/
│   │   └── useTurrets.ts
│   └── test-data.ts
├── index.html
└── package.json

packages/shared-types/
└── src/
    └── index.ts
```

**Structure Decision**: Keep the feature entirely inside the existing dashboard frontend and shared-types package. Add a single reusable address presentation component under `apps/dashboard/src/components/`, pair it with the themed copy icon asset under `apps/dashboard/src/assets/`, and update current dashboard screens and tests to consume that shared pattern rather than introducing another utility layer or backend contract.

## Complexity Tracking

No constitution violations are expected for this feature.
