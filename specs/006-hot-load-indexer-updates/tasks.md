# Tasks: Hot-load Indexer Updates

**Input**: Design documents from `/specs/006-hot-load-indexer-updates/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/, quickstart.md

**Tests**: Included because this feature is live-data behavior with clear regression points across hooks, routes, and selection state.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Shared refresh scaffolding and freshness helpers that the live dashboard will build on

- [x] T001 [P] Create the dashboard refresh coordinator scaffold in `apps/dashboard/src/hooks/useDashboardRefresh.ts` and the matching test harness in `apps/dashboard/src/hooks/useDashboardRefresh.test.tsx`
- [x] T002 [P] Add an API freshness helper entry point in `apps/api/src/routes.ts` and the corresponding freshness assertions in `apps/api/src/app.test.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core refresh plumbing that MUST be complete before any user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Update `apps/dashboard/src/hooks/useTurrets.ts` and `apps/dashboard/src/hooks/useNetworkNodes.ts` to accept a shared refresh tick and use `cache: 'no-store'` for live reads
- [x] T004 [P] Update `apps/dashboard/src/hooks/useTurretSolarSystems.ts`, `apps/dashboard/src/hooks/useTurretIntelligence.ts`, and `apps/dashboard/src/hooks/useTurretEvents.ts` to accept the shared refresh tick and revalidate live reads
- [x] T005 [P] Add `Cache-Control: no-store` headers to the live GET endpoints in `apps/api/src/routes.ts` and cover them in `apps/api/src/app.test.ts`

**Checkpoint**: The live data sources are ready to hot-load without stale browser or intermediary caching.

---

## Phase 3: User Story 1 - Keep Dashboard Data Current (Priority: P1) 🎯 MVP

**Goal**: The live dashboard refreshes turret assemblies, node assignments, solar-system mappings, metrics, and event context automatically without requiring a manual reload.

**Independent Test**: Change the indexed turret or network-node data while the live dashboard stays open, then confirm the list, drawer, metrics, and current detail surfaces update on their own.

### Tests for User Story 1

- [x] T006 [P] [US1] Add visibility/focus polling coverage in `apps/dashboard/src/hooks/useDashboardRefresh.test.tsx` and `apps/dashboard/src/App.test.tsx`

### Implementation for User Story 1

- [x] T007 [US1] Implement the visibility-aware polling coordinator in `apps/dashboard/src/hooks/useDashboardRefresh.ts`
- [x] T008 [US1] Wire `useDashboardRefresh` into `apps/dashboard/src/App.tsx` so the live dashboard revalidates turrets, nodes, solar systems, intelligence, and events automatically

**Checkpoint**: User Story 1 should now keep the live dashboard current without a page reload.

---

## Phase 4: User Story 2 - Preserve Operator Context During Updates (Priority: P2)

**Goal**: The dashboard keeps the operator oriented while live data changes arrive, preserving the selected turret when possible and clearing it gracefully when it disappears.

**Independent Test**: Select a turret, let the live data change, and confirm the selection stays on the same turret when it still exists or clears cleanly when it no longer does.

### Tests for User Story 2

- [x] T009 [P] [US2] Add selection continuity coverage in `apps/dashboard/src/App.test.tsx` and `apps/dashboard/src/components/DashboardScreen.test.tsx`

### Implementation for User Story 2

- [x] T010 [P] [US2] Refactor `apps/dashboard/src/App.tsx` to store the selected turret by ID and resolve the current object from the freshest turret snapshot
- [x] T011 [P] [US2] Mirror the ID-based selection model in `apps/dashboard/src/DemoApp.tsx` so demo mode keeps the same selection behavior when the fixture list changes
- [x] T012 [US2] Update `apps/dashboard/src/components/DashboardScreen.tsx` so selected-card scrolling, detail-panel anchoring, and clear-on-missing behavior stay stable with refreshed snapshots

**Checkpoint**: User Story 2 should now preserve operator context across routine hot-loads.

---

## Phase 5: User Story 3 - Reflect Freshness In Counts And Event Context (Priority: P3)

**Goal**: Metrics, aggressor counts, and latest event-driven turret context stay aligned with the newest indexed state as updates arrive.

**Independent Test**: Update the event source or summary data while the dashboard is open, then confirm the metrics panel, turret cards, and detail panel reflect the refreshed counts and latest event context.

### Tests for User Story 3

- [x] T013 [P] [US3] Add freshness and event-context coverage in `apps/dashboard/src/hooks/useTurretEvents.test.tsx`, `apps/dashboard/src/components/StatisticsPanel.test.tsx`, and `apps/dashboard/src/components/TurretDetail.test.tsx`

### Implementation for User Story 3

- [x] T014 [US3] Update `apps/dashboard/src/hooks/useTurretEvents.ts` so the selected page re-fetches on refresh ticks without losing pagination state
- [x] T015 [P] [US3] Update `apps/dashboard/src/hooks/useTurretIntelligence.ts` and `apps/dashboard/src/components/StatisticsPanel.tsx` so shell counts refresh with the newest snapshot
- [x] T016 [P] [US3] Update `apps/dashboard/src/components/TurretCard.tsx` and `apps/dashboard/src/components/TurretDetail.tsx` so the latest event-driven context stays aligned with refreshed intelligence

**Checkpoint**: User Story 3 should now keep summary counts and event-driven context in sync with the live indexer state.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and documentation updates that apply across the whole feature

- [x] T017 [P] Update `specs/006-hot-load-indexer-updates/quickstart.md`, `specs/006-hot-load-indexer-updates/contracts/dashboard-live-refresh.md`, and `CHANGELOG.md` with the final live-refresh behavior and validation notes

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
    - User stories can then proceed in parallel if staffed
    - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - establishes the live refresh loop
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - selection logic may integrate with User Story 1 but should remain independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - builds on the refreshed live snapshots and can integrate with Users 1/2 without depending on their completion

### Within Each User Story

- Tests MUST be written and fail before implementation
- Shared plumbing before UI orchestration
- Hook changes before component changes when behavior flows through the shell
- Story complete before moving to the next priority

---

## Parallel Opportunities

### Parallel Example: Setup

```bash
Task: "Create the dashboard refresh coordinator scaffold in `apps/dashboard/src/hooks/useDashboardRefresh.ts` and the matching test harness in `apps/dashboard/src/hooks/useDashboardRefresh.test.tsx`"
Task: "Add an API freshness helper entry point in `apps/api/src/routes.ts` and the corresponding freshness assertions in `apps/api/src/app.test.ts`"
```

### Parallel Example: User Story 1

```bash
Task: "Add visibility/focus polling coverage in `apps/dashboard/src/hooks/useDashboardRefresh.test.tsx` and `apps/dashboard/src/App.test.tsx`"
Task: "Implement the visibility-aware polling coordinator in `apps/dashboard/src/hooks/useDashboardRefresh.ts`"
Task: "Wire `useDashboardRefresh` into `apps/dashboard/src/App.tsx` so the live dashboard revalidates turrets, nodes, solar systems, intelligence, and events automatically"
```

### Parallel Example: User Story 2

```bash
Task: "Add selection continuity coverage in `apps/dashboard/src/App.test.tsx` and `apps/dashboard/src/components/DashboardScreen.test.tsx`"
Task: "Refactor `apps/dashboard/src/App.tsx` to store the selected turret by ID and resolve the current object from the freshest turret snapshot"
Task: "Mirror the ID-based selection model in `apps/dashboard/src/DemoApp.tsx` so demo mode keeps the same selection behavior when the fixture list changes"
```

### Parallel Example: User Story 3

```bash
Task: "Add freshness and event-context coverage in `apps/dashboard/src/hooks/useTurretEvents.test.tsx`, `apps/dashboard/src/components/StatisticsPanel.test.tsx`, and `apps/dashboard/src/components/TurretDetail.test.tsx`"
Task: "Update `apps/dashboard/src/hooks/useTurretIntelligence.ts` and `apps/dashboard/src/components/StatisticsPanel.tsx` so shell counts refresh with the newest snapshot"
Task: "Update `apps/dashboard/src/components/TurretCard.tsx` and `apps/dashboard/src/components/TurretDetail.tsx` so the latest event-driven context stays aligned with refreshed intelligence"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. STOP and VALIDATE: confirm the live dashboard hot-loads turret and network-node changes without manual refresh
5. Demo the live refresh loop before extending selection continuity or event-context polish

### Incremental Delivery

1. Complete Setup + Foundational → refresh plumbing is ready
2. Add User Story 1 → live dashboard updates itself
3. Add User Story 2 → operator selection stays coherent during refreshes
4. Add User Story 3 → metrics and event-driven context stay aligned
5. Finish with documentation and changelog updates

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
    - Developer A: User Story 1 refresh wiring
    - Developer B: User Story 2 selection continuity
    - Developer C: User Story 3 freshness and event context
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid vague tasks, same-file conflicts, and cross-story dependencies that break independence
