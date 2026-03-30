# Tasks: EVE Frontier Theme Overhaul

**Input**: Design documents from `/specs/005-eve-sentinel-theme/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included because the project constitution and plan call for focused component, API, and browser coverage before feature implementation is considered complete.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the shared file scaffolding for the theme, shell metrics, and turret-intelligence work.

- [x] T001 Create the shared turret-intelligence type module in `packages/shared-types/src/turretIntelligence.ts`
- [x] T002 [P] Create the shell statistics component test scaffold in `apps/dashboard/src/components/StatisticsPanel.test.tsx`
- [x] T003 [P] Create the turret-intelligence hook test scaffold in `apps/dashboard/src/hooks/useTurretIntelligence.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the shared API, hook, and theme-token foundations that all user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Extend shared exports for turret-intelligence contracts in `packages/shared-types/src/index.ts`
- [x] T005 [P] Add API type contracts for turret-intelligence summaries in `apps/api/src/types.ts`
- [x] T006 Add repository coverage for turret-intelligence summaries and 24-hour aggressor counts in `apps/api/src/app.test.ts`
- [x] T007 Implement repository support for latest priority-event summaries and recent aggressor counts in `apps/api/src/repositories.ts`
- [x] T008 Implement the `GET /api/turret-intelligence` route in `apps/api/src/routes.ts`
- [x] T009 [P] Create the dashboard turret-intelligence hook in `apps/dashboard/src/hooks/useTurretIntelligence.ts`
- [x] T010 [P] Establish the new shell/theme token layer in `apps/dashboard/src/index.css`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Establish EVE Frontier Visual Identity (Priority: P1) 🎯 MVP

**Goal**: Make Sentinel immediately read as an EVE Frontier product through the shell branding, logo treatment, and primary surface styling.

**Independent Test**: Load the live shell and confirm the header, unconnected wallet view, and primary surfaces present the new logo treatment and cohesive EVE Frontier visual identity without changing core workflows.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T011 [P] [US1] Add live-shell branding coverage in `apps/dashboard/src/App.test.tsx`
- [x] T012 [P] [US1] Add shared shell composition coverage in `apps/dashboard/src/components/DashboardScreen.test.tsx`
- [x] T013 [P] [US1] Add fatal fallback branding coverage in `apps/dashboard/src/components/AppErrorBoundary.test.tsx`

### Implementation for User Story 1

- [x] T014 [US1] Add the canonical logo asset usage and shell identity treatment in `apps/dashboard/src/App.tsx`, `apps/dashboard/src/components/DashboardScreen.tsx`, and `apps/dashboard/src/components/AppErrorBoundary.tsx`
- [x] T015 [US1] Apply the branded shell palette and primary surface treatments in `apps/dashboard/src/index.css`
- [x] T016 [US1] Update the live unconnected wallet shell and header composition in `apps/dashboard/src/App.tsx` and `apps/dashboard/src/components/DashboardScreen.tsx`
- [x] T017 [US1] Add favicon/logo derivation wiring in `apps/dashboard/index.html` and `assets/logo.svg`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Improve Atmospheric Theming Without Losing Readability (Priority: P2)

**Goal**: Deepen the EVE Frontier atmosphere across cards, drawers, detail panels, and action states without sacrificing operational clarity.

**Independent Test**: Review turret cards, drawers, detail panels, buttons, and map framing at desktop sizes and confirm labels, statuses, and actions remain legible while hover, active, and selected states feel tactile inside the darker palette.

### Tests for User Story 2 ⚠️

- [x] T018 [P] [US2] Add turret card readability and state-tone coverage in `apps/dashboard/src/components/TurretCard.test.tsx`
- [x] T019 [P] [US2] Add turret detail readability and action-state coverage in `apps/dashboard/src/components/TurretDetail.test.tsx`
- [x] T020 [P] [US2] Add drawer and map-frame theme coverage in `apps/dashboard/src/components/NetworkNodeDrawer.test.tsx` and `apps/dashboard/src/components/MapEmbed.test.tsx`

### Implementation for User Story 2

- [x] T021 [US2] Re-theme turret cards for the darker shell while preserving status legibility in `apps/dashboard/src/components/TurretCard.tsx`
- [x] T022 [US2] Re-theme the turret detail panel and its action surfaces in `apps/dashboard/src/components/TurretDetail.tsx`
- [x] T023 [US2] Re-theme the network node drawer and wallet dropdown surfaces in `apps/dashboard/src/components/NetworkNodeDrawer.tsx` and `apps/dashboard/src/components/DashboardScreen.tsx`
- [x] T024 [US2] Re-theme the map frame and surrounding shell support surfaces in `apps/dashboard/src/components/MapEmbed.tsx` and `apps/dashboard/src/components/DashboardScreen.tsx`
- [x] T025 [US2] Refine interactive hover, active, focus, and selected-state treatments in `apps/dashboard/src/index.css`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Keep Demo And Live Views Visually Consistent (Priority: P3)

**Goal**: Keep `/demo` and the live route visually and behaviorally aligned so the demo remains a trustworthy review surface.

**Independent Test**: Compare `http://127.0.0.1:5174/` and `http://127.0.0.1:5174/demo` side by side and confirm the logo treatment, shell palette, spacing language, and fallback/loading states stay aligned.

### Tests for User Story 3 ⚠️

- [x] T026 [P] [US3] Add demo-route shell parity coverage in `apps/dashboard/src/App.test.tsx`
- [x] T027 [P] [US3] Add demo fixture parity coverage for themed shell states in `apps/dashboard/src/test-data.test.ts`

### Implementation for User Story 3

- [x] T028 [US3] Apply the shared shell identity to the demo route in `apps/dashboard/src/DemoApp.tsx` and `apps/dashboard/src/components/DashboardScreen.tsx`
- [x] T029 [US3] Align demo fixtures and demo-mode state with the new theme and review expectations in `apps/dashboard/src/demo-mode.ts` and `apps/dashboard/src/test-data.ts`
- [x] T030 [US3] Align live/demo loading, empty, and fallback states in `apps/dashboard/src/App.tsx`, `apps/dashboard/src/DemoApp.tsx`, and `apps/dashboard/src/components/AppErrorBoundary.tsx`

**Checkpoint**: User Stories 1, 2, and 3 should now all be independently functional

---

## Phase 6: User Story 4 - Introduce A Pilot Statistics Panel (Priority: P3)

**Goal**: Add a shell-level statistics panel that summarizes turret posture and recent hostile activity from real dashboard data.

**Independent Test**: Load representative turret and event data, confirm the statistics panel shows total turrets, engaged turrets, online turrets, offline turrets, and aggressors in the past 24 hours, and verify the same structure is visible in demo mode with representative data.

### Tests for User Story 4 ⚠️

- [x] T031 [P] [US4] Add shell statistics rendering coverage in `apps/dashboard/src/components/StatisticsPanel.test.tsx`
- [x] T032 [P] [US4] Add dashboard integration coverage for statistics composition in `apps/dashboard/src/App.test.tsx`
- [x] T033 [P] [US4] Add demo statistics fixture coverage in `apps/dashboard/src/test-data.test.ts`

### Implementation for User Story 4

- [x] T034 [US4] Implement the statistics panel component in `apps/dashboard/src/components/StatisticsPanel.tsx`
- [x] T035 [US4] Compose shell statistics from turret and intelligence data in `apps/dashboard/src/components/DashboardScreen.tsx`
- [x] T036 [US4] Wire live statistics data through the dashboard shell in `apps/dashboard/src/App.tsx`
- [x] T037 [US4] Wire representative statistics data through demo mode in `apps/dashboard/src/DemoApp.tsx`, `apps/dashboard/src/demo-mode.ts`, and `apps/dashboard/src/test-data.ts`

**Checkpoint**: User Story 4 should now be independently functional and reviewable

---

## Phase 7: User Story 5 - Surface Recent Target Intelligence In Turret Views (Priority: P3)

**Goal**: Show compact recent-target intelligence on turret cards, richer target intelligence in the detail panel, and derive engaged/aggressor signals from the latest `PriorityListUpdatedEvent` plus indexer-backed 24-hour counts.

**Independent Test**: Load representative turret and event data, confirm turret cards show the latest target as a player name or `NPC` plus the `ENGAGED` status shift, then open the detail panel and verify it defaults to the latest `PriorityListUpdatedEvent` and displays target identity, tribe, type info/icon, aggressor state, and 24-hour aggressor counts.

### Tests for User Story 5 ⚠️

- [x] T038 [P] [US5] Add API route and repository coverage for turret-intelligence summaries in `apps/api/src/app.test.ts`
- [x] T039 [P] [US5] Add turret-intelligence hook coverage in `apps/dashboard/src/hooks/useTurretIntelligence.test.ts`
- [x] T040 [P] [US5] Add turret card threat-summary coverage in `apps/dashboard/src/components/TurretCard.test.tsx`
- [x] T041 [P] [US5] Add turret detail default-priority-event intelligence coverage in `apps/dashboard/src/components/TurretDetail.test.tsx`
- [x] T042 [P] [US5] Add demo threat-scenario fixture coverage in `apps/dashboard/src/test-data.test.ts`

### Implementation for User Story 5

- [x] T043 [US5] Extend the API and shared contracts for turret-intelligence summaries in `apps/api/src/types.ts`, `apps/api/src/repositories.ts`, `apps/api/src/routes.ts`, and `packages/shared-types/src/turretIntelligence.ts`
- [x] T044 [US5] Implement the client-side turret-intelligence data flow in `apps/dashboard/src/hooks/useTurretIntelligence.ts` and `apps/dashboard/src/App.tsx`
- [x] T045 [US5] Add compact target-label, engaged-status, and 24-hour aggressor presentation to turret cards in `apps/dashboard/src/components/TurretCard.tsx`
- [x] T046 [US5] Default the detail viewer to the latest priority event and render enriched target intelligence in `apps/dashboard/src/components/TurretDetail.tsx`
- [x] T047 [US5] Remove target type display from the turret detail panel in `apps/dashboard/src/components/TurretDetail.tsx`
- [x] T048 [US5] Update demo threat scenarios and shell totals in `apps/dashboard/src/demo-mode.ts` and `apps/dashboard/src/test-data.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Finalize documentation, route-level review, and feature-wide validation.

- [x] T049 [P] Update the documented design decisions in `docs/DESIGN_SYSTEM.md`
- [x] T050 [P] Update user-facing and workflow documentation in `CHANGELOG.md`, `AGENTS.md`, and `docs/EVE_FRONTIER.md`
- [x] T051 Run the review flow from `specs/005-eve-sentinel-theme/quickstart.md` and the validation commands for `apps/dashboard/src`, `apps/api/src`, and `packages/shared-types/src`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational completion
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational completion and establishes the branded shell MVP
- **User Story 2 (P2)**: Starts after Foundational completion and is safest after US1 because it builds on the new shell token system
- **User Story 3 (P3)**: Starts after Foundational completion and is safest after US1 because it keeps `/demo` aligned with the same shell identity
- **User Story 4 (P3)**: Starts after Foundational completion and is safest after US1 plus the turret-intelligence API foundation because its values depend on shared turret/intelligence data
- **User Story 5 (P3)**: Starts after Foundational completion and is safest after US4 because the same intelligence summaries feed both cards/detail and the statistics panel

### Within Each User Story

- Tests MUST be written and fail before implementation
- Shared contracts/hooks before component wiring
- Shell/token work before route-specific refinements
- Story complete before moving to the next priority if working sequentially

### Parallel Opportunities

- T004, T005, T009, and T010 can run in parallel once Setup is in place because they touch separate shared surfaces
- T011-T013 can run in parallel because they cover separate shell surfaces for the identity story
- T018-T020 can run in parallel because they cover cards, detail, and drawer/map surfaces separately
- T031-T033 can run in parallel because they cover shell stats rendering, integration, and demo fixtures separately
- T038-T042 can run in parallel because they cover API, hook, component, and fixture work separately

---

## Parallel Example: User Story 1

```bash
# Launch User Story 1 test work together:
Task: "Add live-shell branding coverage in apps/dashboard/src/App.test.tsx"
Task: "Add shared shell composition coverage in apps/dashboard/src/components/DashboardScreen.test.tsx"
Task: "Add fatal fallback branding coverage in apps/dashboard/src/components/AppErrorBoundary.test.tsx"
```

---

## Parallel Example: User Story 4

```bash
# Launch User Story 4 validation together:
Task: "Add shell statistics rendering coverage in apps/dashboard/src/components/StatisticsPanel.test.tsx"
Task: "Add dashboard integration coverage for statistics composition in apps/dashboard/src/App.test.tsx"
Task: "Add demo statistics fixture coverage in apps/dashboard/src/test-data.test.ts"
```

---

## Parallel Example: User Story 5

```bash
# Launch User Story 5 intelligence validation together:
Task: "Add API route and repository coverage for turret-intelligence summaries in apps/api/src/app.test.ts"
Task: "Add turret-intelligence hook coverage in apps/dashboard/src/hooks/useTurretIntelligence.test.ts"
Task: "Add turret card threat-summary coverage in apps/dashboard/src/components/TurretCard.test.tsx"
Task: "Add turret detail default-priority-event intelligence coverage in apps/dashboard/src/components/TurretDetail.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Review the branded live shell and confirm the product now reads as EVE Frontier-aligned

### Incremental Delivery

1. Ship the shell identity and core theme tokens with User Story 1
2. Add readability and interaction polish with User Story 2
3. Bring demo parity into line with User Story 3
4. Add the shell statistics panel with User Story 4
5. Finish with target intelligence and engaged-state behavior in User Story 5

### Parallel Team Strategy

With multiple developers:

1. One developer handles Setup + Foundational
2. After foundation:
    - Developer A: User Story 1 shell identity and logo treatment
    - Developer B: User Story 2 component readability and interaction polish
    - Developer C: User Story 3 demo parity and fixture alignment
3. Once the intelligence API stabilizes:
    - Developer A: User Story 4 statistics panel
    - Developer B: User Story 5 turret card/detail intelligence

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] labels map directly to the spec user stories
- User Story 1 is the recommended MVP scope
- `docs/DESIGN_SYSTEM.md` is a required output for this feature, not optional cleanup
- Demo mode is part of acceptance and must evolve with live dashboard contracts
