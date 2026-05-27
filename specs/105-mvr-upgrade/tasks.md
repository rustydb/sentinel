# Tasks: Upgrade to MVR for Turret Package IDs

**Input**: Design documents from `/specs/105-mvr-upgrade/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [P] Add `@suins/mvr` dependency to `apps/dashboard/package.json`
- [ ] T002 [P] Research and add the appropriate MVR/SuiNS rust crate (or `sui-sdk` extensions) to `apps/indexer/Cargo.toml`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

_No blocking prerequisites required for this feature upgrade as it builds on existing Sui network connections._

---

## Phase 3: User Story 1 - Dynamic Package Resolution on Dashboard (Priority: P1) 🎯 MVP

**Goal**: Dashboard automatically loads the correct turret data after world contract upgrades using MVR.

**Independent Test**: Load the dashboard UI locally and verify it successfully resolves the `TurretPackageId` before rendering data.

### Implementation for User Story 1

- [x] T003 [US1] Implement `resolveTurretPackageIdAsync` in `apps/dashboard/src/world.ts` with placeholder logic due to SDK constraints.
- [x] T004 [US1] Update `apps/dashboard/src/hooks/useTurrets.ts` to use async resolution.
- [x] T005 [US1] Add a loading state in the UI while the MVR lookup is resolving (already handled in hook).

**Checkpoint**: Dashboard resolves the MVR package ID.

---

## Phase 4: User Story 2 - Dynamic Event Indexing (Priority: P1)

**Goal**: Rust indexer dynamically fetches the latest package ID on startup.

**Independent Test**: Start the indexer locally and verify via logs that it dynamically queries MVR.

### Implementation for User Story 2

- [x] T006 [US2] Implement MVR lookup logic in `apps/indexer/src/main.rs` before the event loops start.
- [x] T007 [US2] Refactor event filters to use the dynamically resolved package ID instead of the static environment variable.

**Checkpoint**: Indexer resolves the MVR package ID on startup.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T008 Update tests in `apps/dashboard/src/hooks/useTurrets.test.ts` to accommodate dynamic resolution.
- [ ] T009 Run quickstart.md validation locally to confirm both components work.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **User Stories (Phase 3 & 4)**: Depend on Setup completion. Can run in parallel since they touch different parts of the monorepo (TypeScript vs Rust).
- **Polish (Phase 5)**: Depends on User Stories completion.

### Parallel Opportunities

- Dashboard (T003-T005) and Indexer (T006-T007) implementation can be executed in parallel by different agents or developers.
