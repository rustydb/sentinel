# Tasks: Solar System Assignment

**Input**: Design documents from `/specs/004-solar-system-assignment/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included because the project constitution and plan call for unit, API, and browser coverage before feature implementation is considered complete.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the shared solar-system catalog surfaces and file scaffolding the rest of the feature depends on.

- [x] T001 Create the bundled solar-system catalog module in `packages/shared-types/src/solarSystems.ts`
- [x] T002 Create the catalog refresh script in `scripts/update-solar-systems.ts`
- [x] T003 [P] Export the solar-system catalog types and helpers from `packages/shared-types/src/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish persistence and shared data flows that every user story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Add repository and handler coverage for network-node assignments and retained turret mappings in `apps/api/src/app.test.ts`
- [x] T005 Extend the API type contracts for network-node assignments, retained turret mappings, and sync payloads in `apps/api/src/types.ts`
- [x] T006 Extend the API database bootstrap for retained turret mappings in `apps/api/src/db.ts`
- [x] T007 Implement repository support for network-node assignment persistence and retained turret mappings in `apps/api/src/repositories.ts`
- [x] T008 Implement the assignment, retained-mapping, and sync routes in `apps/api/src/routes.ts`
- [x] T009 [P] Add shared solar-system lookup and search helpers in `packages/shared-types/src/solarSystems.ts` and `packages/shared-types/src/index.test.ts`
- [x] T010 [P] Create the dashboard solar-system catalog hook in `apps/dashboard/src/hooks/useSolarSystemCatalog.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Assign Solar Systems To Network Nodes (Priority: P1) 🎯 MVP

**Goal**: Let operators assign, reassign, and unassign solar systems for network nodes from the drawer and turret detail workflow.

**Independent Test**: Open the network node drawer, assign a solar system by name, confirm the node now shows `Reassign` and `Unassign`, then clear or change the assignment from the drawer or turret detail pane.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T011 [P] [US1] Add autocomplete search and keyboard-selection coverage in `apps/dashboard/src/components/SolarSystemAutocomplete.test.tsx`
- [x] T012 [P] [US1] Add drawer assignment and unassignment flow coverage in `apps/dashboard/src/components/NetworkNodeDrawer.test.tsx`
- [x] T013 [P] [US1] Add turret-detail assignment-action coverage in `apps/dashboard/src/components/TurretDetail.test.tsx`

### Implementation for User Story 1

- [x] T014 [US1] Implement the solar-system autocomplete UI in `apps/dashboard/src/components/SolarSystemAutocomplete.tsx`
- [x] T015 [US1] Extend network-node client state and assignment mutations in `apps/dashboard/src/hooks/useNetworkNodes.ts`
- [x] T016 [US1] Implement the network-node drawer assignment workflow in `apps/dashboard/src/components/NetworkNodeDrawer.tsx`
- [x] T017 [US1] Add the detail-pane assign/reassign action beside the network node field in `apps/dashboard/src/components/TurretDetail.tsx`
- [x] T018 [US1] Wire the drawer open state and assignment callbacks into `apps/dashboard/src/App.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Turret Solar Systems And Map Focus (Priority: P2)

**Goal**: Show friendly solar-system names on turrets, preserve retained mappings for orphaned turrets, and drive `ef-map` between highlight and focused states without iframe reloads.

**Independent Test**: Assign solar systems to one or more nodes, confirm the unselected map highlights all assigned systems, select a turret to focus one system, and clear the selection to restore the broader highlight state.

### Tests for User Story 2 ⚠️

- [x] T019 [P] [US2] Add current-versus-retained solar-system resolution coverage in `apps/dashboard/src/hooks/useTurrets.test.ts`
- [x] T020 [P] [US2] Add friendly-name and unassigned-state coverage in `apps/dashboard/src/components/TurretCard.test.tsx` and `apps/dashboard/src/components/TurretDetail.test.tsx`
- [x] T021 [P] [US2] Add highlight-versus-focus map behavior coverage in `apps/dashboard/src/components/MapEmbed.test.tsx` and `apps/dashboard/tests/e2e/map.spec.ts`

### Implementation for User Story 2

- [x] T022 [US2] Implement retained turret solar-system sync and read support in `apps/api/src/repositories.ts`, `apps/api/src/routes.ts`, and `apps/api/src/types.ts`
- [x] T023 [US2] Resolve current and retained solar-system names for turrets in `apps/dashboard/src/hooks/useTurretSolarSystems.ts` and `apps/dashboard/src/hooks/useTurrets.ts`
- [x] T024 [US2] Render friendly solar-system states on turret cards and in the detail pane in `apps/dashboard/src/components/TurretCard.tsx` and `apps/dashboard/src/components/TurretDetail.tsx`
- [x] T025 [US2] Update the map embed to use dynamic `ef-map-highlight` and `ef-map-navigate` messaging in `apps/dashboard/src/components/MapEmbed.tsx`
- [x] T026 [US2] Coordinate turret selection, deselection, and map state in `apps/dashboard/src/App.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Inspect Network Nodes Alongside Turrets (Priority: P3)

**Goal**: Present network nodes as first-class cards in a side drawer, merging live ownership data with persisted assignment state while keeping orphaned turrets understandable.

**Independent Test**: Open the drawer, confirm node cards render with iconography and abbreviated addresses, verify empty-state handling, and use the assign or unassign actions from that list.

### Tests for User Story 3 ⚠️

- [x] T027 [P] [US3] Add network-node card and empty-drawer coverage in `apps/dashboard/src/components/NetworkNodeCard.test.tsx` and `apps/dashboard/src/components/NetworkNodeDrawer.test.tsx`
- [x] T028 [P] [US3] Add demo-fixture coverage for node cards and orphaned retained mappings in `apps/dashboard/src/test-data.test.ts`

### Implementation for User Story 3

- [x] T029 [US3] Implement the network-node card component with type-info artwork, responsive address, and assignment state in `apps/dashboard/src/components/NetworkNodeCard.tsx`
- [x] T030 [US3] Discover current network nodes from on-chain ownership and merge them with persisted assignments in `apps/dashboard/src/hooks/useNetworkNodes.ts`
- [x] T031 [US3] Finish the drawer list, empty state, and card composition in `apps/dashboard/src/components/NetworkNodeDrawer.tsx`
- [x] T032 [US3] Integrate the node drawer alongside turret and orphaned states in `apps/dashboard/src/App.tsx`
- [x] T033 [US3] Align demo-mode fixtures with network-node cards and retained solar-system mappings in `apps/dashboard/src/test-data.ts`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Finalize docs, regression coverage, and end-to-end validation across the completed feature.

- [x] T034 [P] Update operator and implementation documentation in `docs/EVE_FRONTIER.md`, `AGENTS.md`, and `CHANGELOG.md`
- [x] T035 Run the validation steps from `specs/004-solar-system-assignment/quickstart.md` and targeted lint/test coverage for `apps/dashboard/src`, `apps/api/src`, `packages/shared-types/src`, and `scripts/update-solar-systems.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational completion and delivers the first operator-usable assignment workflow
- **User Story 2 (P2)**: Starts after Foundational completion and is safest after US1 because it consumes persisted assignment data
- **User Story 3 (P3)**: Starts after Foundational completion and is safest after US1 because it expands the drawer workflow around the same assignment surface

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Shared data flow before view wiring
- Assignment persistence before retained-map resolution
- Story complete before moving to the next priority if working sequentially

### Parallel Opportunities

- T004, T009, and T010 can run in parallel once Setup is in place because they touch separate files
- T011-T013 can run in parallel because they cover separate UI files for the same assignment story
- T019-T021 can run in parallel because they cover hook, component, and browser map behavior separately
- T027-T028 can run in parallel because they cover node-drawer UI and fixture alignment independently

---

## Parallel Example: User Story 1

```bash
# Launch User Story 1 test work together:
Task: "Add autocomplete search and keyboard-selection coverage in apps/dashboard/src/components/SolarSystemAutocomplete.test.tsx"
Task: "Add drawer assignment and unassignment flow coverage in apps/dashboard/src/components/NetworkNodeDrawer.test.tsx"
Task: "Add turret-detail assignment-action coverage in apps/dashboard/src/components/TurretDetail.test.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch User Story 2 map/location validation together:
Task: "Add current-versus-retained solar-system resolution coverage in apps/dashboard/src/hooks/useTurrets.test.ts"
Task: "Add friendly-name and unassigned-state coverage in apps/dashboard/src/components/TurretCard.test.tsx and apps/dashboard/src/components/TurretDetail.test.tsx"
Task: "Add highlight-versus-focus map behavior coverage in apps/dashboard/src/components/MapEmbed.test.tsx and apps/dashboard/tests/e2e/map.spec.ts"
```

---

## Parallel Example: User Story 3

```bash
# Launch User Story 3 drawer validation together:
Task: "Add network-node card and empty-drawer coverage in apps/dashboard/src/components/NetworkNodeCard.test.tsx and apps/dashboard/src/components/NetworkNodeDrawer.test.tsx"
Task: "Add demo-fixture coverage for node cards and orphaned retained mappings in apps/dashboard/src/test-data.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm solar-system assignment works from the drawer and detail pane

### Incremental Delivery

1. Ship the shared catalog, API persistence, and US1 assignment workflow
2. Add US2 to turn assignments into turret-facing location context and dynamic map behavior
3. Add US3 to make network nodes a first-class operator surface in the drawer
4. Finish with documentation and full quickstart validation

### Parallel Team Strategy

With multiple developers:

1. One developer handles Setup + Foundational
2. After foundation:
    - Developer A: User Story 1 assignment UI and mutations
    - Developer B: User Story 2 turret resolution and map focus
    - Developer C: User Story 3 node-card presentation and drawer refinement

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] labels map directly to the spec user stories
- User Story 1 is the recommended MVP scope
- The node drawer must merge on-chain network-node discovery with persisted assignment state
- The map must use the dynamic `ef-map` postMessage API rather than reloading the iframe
