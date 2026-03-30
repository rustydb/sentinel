# Tasks: Turret Filters

**Input**: Design documents from `/specs/007-turret-filters/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included because this feature uses a test-first implementation approach and needs interaction coverage for filtering, empty states, and selected-context behavior.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the feature scaffold and shared filter vocabulary

- [x] T001 Create the turret filter feature folder and placeholder component/hook files in `apps/dashboard/src/components/TurretFilterBar.tsx` and `apps/dashboard/src/hooks/useTurretFilters.ts`
- [x] T002 [P] Add shared filter-related types and helpers in `packages/shared-types/src/index.ts` if new exports are needed for filter state or class labels

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the shared filtering mechanics that every story depends on

- [x] T003 Implement turret filter state derivation and conjunctive matching in `apps/dashboard/src/hooks/useTurretFilters.ts`
- [x] T004 [P] Add turret-filter fixture coverage for identity, solar system, node state, status, and class combinations in `apps/dashboard/src/test-data.ts`
- [x] T005 [P] Add unit coverage for the filter matching rules in `apps/dashboard/src/hooks/useTurretFilters.test.ts`

**Checkpoint**: The dashboard can derive filtered turret lists, but the UI does not yet expose the controls.

---

## Phase 3: User Story 1 - Narrow The Turret List Quickly (Priority: P1) 🎯 MVP

**Goal**: Let operators narrow the visible turret list by solar system, turret identity, known network node, status, and class.

**Independent Test**: Load a mixed turret set, apply each filter one at a time, and confirm the visible turret list reduces to only the matching entries.

### Tests for User Story 1

- [x] T006 [P] [US1] Add interaction coverage for the turret filter bar in `apps/dashboard/src/components/TurretFilterBar.test.tsx`
- [x] T007 [P] [US1] Add dashboard-level coverage for applying a single active filter in `apps/dashboard/src/components/DashboardScreen.test.tsx`

### Implementation for User Story 1

- [x] T008 [US1] Implement the turret filter bar UI in `apps/dashboard/src/components/TurretFilterBar.tsx`
- [x] T009 [US1] Wire the filter bar into the dashboard shell in `apps/dashboard/src/components/DashboardScreen.tsx`
- [x] T010 [US1] Connect filtered turret lists into the app shell in `apps/dashboard/src/App.tsx`
- [x] T011 [US1] Ensure the turret list renders only filtered results in `apps/dashboard/src/components/TurretCard.tsx` and `apps/dashboard/src/components/DashboardScreen.tsx`

**Checkpoint**: User Story 1 is complete when the operator can filter turrets by a single facet and see the list update immediately.

---

## Phase 4: User Story 2 - Combine And Clear Filters Safely (Priority: P2)

**Goal**: Let operators layer multiple filters, clear one filter, or reset all filters without losing the rest of the active set.

**Independent Test**: Apply two or more filters together, confirm the result is the intersection, then clear one filter or all filters and confirm the expected broader set returns.

### Tests for User Story 2

- [x] T012 [P] [US2] Add interaction coverage for multi-filter combinations and clear-one/clear-all behavior in `apps/dashboard/src/components/TurretFilterBar.test.tsx`
- [x] T013 [P] [US2] Add dashboard coverage for combined filters and reset behavior in `apps/dashboard/src/components/DashboardScreen.test.tsx`

### Implementation for User Story 2

- [x] T014 [US2] Extend `apps/dashboard/src/hooks/useTurretFilters.ts` to support multiple active facets and individual facet clearing
- [x] T015 [US2] Add clear-one and clear-all controls to `apps/dashboard/src/components/TurretFilterBar.tsx`
- [x] T016 [US2] Preserve selected-turret visibility when the current filter set still includes it in `apps/dashboard/src/App.tsx`
- [x] T017 [US2] Keep the turret selection context explicit when filters hide the selected turret in `apps/dashboard/src/components/DashboardScreen.tsx`

**Checkpoint**: User Story 2 is complete when operators can layer filters and back out of them without rebuilding the whole view.

---

## Phase 5: User Story 3 - Preserve Honest State Labels While Filtering (Priority: P3)

**Goal**: Make edge states explicit by showing empty results with guidance and keeping class resolution honest.

**Independent Test**: Apply filters that produce no matches and confirm the empty-state suggestion appears; verify class metadata loading and failure states are explicit.

### Tests for User Story 3

- [x] T018 [P] [US3] Add interaction coverage for empty-filter suggestions and selected-context visibility in `apps/dashboard/src/components/DashboardScreen.test.tsx`
- [x] T019 [P] [US3] Add unit coverage for class loading and failure states in `apps/dashboard/src/hooks/useTypeInfo.test.ts`

### Implementation for User Story 3

- [x] T020 [US3] Render the friendly no-results suggestion when filtering returns zero turrets in `apps/dashboard/src/components/DashboardScreen.tsx`
- [x] T021 [US3] Surface explicit class loading and error states in `apps/dashboard/src/components/TurretCard.tsx`
- [x] T022 [US3] Keep the selected turret auto-scrolled into view when it remains visible after filtering in `apps/dashboard/src/components/DashboardScreen.tsx`

**Checkpoint**: User Story 3 is complete when empty results are honest, class state is explicit, and selected context remains understandable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finish cross-story validation, documentation, and cleanup

- [x] T023 [P] Update `specs/007-turret-filters/quickstart.md` if any validation steps changed during implementation
- [x] T024 [P] Add or refine dashboard integration tests around filter state persistence in `apps/dashboard/src/App.test.tsx`
- [x] T025 Run `bun lint` and `bunx vitest run --environment jsdom` and fix any issues reported across `apps/dashboard/src/**`
- [ ] T026 Verify the feature behavior in the local dashboard and capture any follow-up notes in `specs/007-turret-filters/research.md` if assumptions changed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational phase and provides the MVP filtering slice
- **User Story 2 (P2)**: Starts after Foundational phase and builds on the same shared filter hook
- **User Story 3 (P3)**: Starts after Foundational phase and refines the empty-state and class-resolution experience

### Within Each User Story

- Tests are written before implementation
- Shared filter logic comes before UI wiring
- Dashboard wiring comes before polish and cross-story refinement
- Each story should remain independently testable before moving to the next

### Parallel Opportunities

- `T002` can run in parallel with `T001`
- `T004` and `T005` can run in parallel after `T003` defines the filter shape
- `T006` and `T007` can run in parallel
- `T012` and `T013` can run in parallel
- `T018` and `T019` can run in parallel

---

## Parallel Example: User Story 1

```bash
Task: "Add interaction coverage for the turret filter bar in `apps/dashboard/src/components/TurretFilterBar.test.tsx`"
Task: "Add dashboard-level coverage for applying a single active filter in `apps/dashboard/src/components/DashboardScreen.test.tsx`"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. STOP and validate User Story 1 independently

### Incremental Delivery

1. Deliver single-facet filtering first
2. Add multi-filter composition and reset behavior second
3. Finish with empty-state guidance, class state honesty, and selected-context polish

### Parallel Team Strategy

1. One developer can build the shared filter hook while another prepares the filter bar tests
2. After the foundation lands, separate developers can work on the filter bar, dashboard wiring, and selected-context handling in parallel
3. Final polish can run alongside quickstart and integration-test updates

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Avoid same-file conflicts between parallel tasks
