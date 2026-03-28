# Tasks: Responsive Sui Addresses

**Input**: Design documents from `/specs/003-responsive-sui-addresses/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included because the project constitution requires TDD and this feature changes shared UI behavior.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Bring in the upstream themed asset and create the file structure needed for the shared address component.

- [x] T001 Add the upstream EVE Frontier copy icon asset in `apps/dashboard/src/assets/copy.svg`
- [x] T002 Create the shared address component entry point in `apps/dashboard/src/components/ResponsiveAddress.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the reusable responsive-address behavior that every story depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Add baseline unit tests for responsive abbreviation and resize handling in `apps/dashboard/src/components/ResponsiveAddress.test.tsx`
- [x] T004 Implement the shared responsive address rendering behavior in `apps/dashboard/src/components/ResponsiveAddress.tsx`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Keep Address-Heavy Views Readable (Priority: P1) 🎯 MVP

**Goal**: Ensure the current dashboard address surfaces stay visually contained as their containers shrink.

**Independent Test**: Load the dashboard, narrow the viewport, and confirm the wallet summary plus turret address surfaces remain contained without horizontal overflow.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T005 [P] [US1] Add wallet-header responsive address coverage in `apps/dashboard/src/App.test.tsx`
- [x] T006 [P] [US1] Add narrow-container address rendering coverage in `apps/dashboard/src/components/TurretCard.test.tsx`
- [x] T007 [P] [US1] Add detail-drawer address containment coverage in `apps/dashboard/src/components/TurretDetail.test.tsx`

### Implementation for User Story 1

- [x] T008 [US1] Replace the wallet address text with `ResponsiveAddress` in `apps/dashboard/src/App.tsx`
- [x] T009 [US1] Replace Sui-address-valued card fields with `ResponsiveAddress` in `apps/dashboard/src/components/TurretCard.tsx`
- [x] T010 [US1] Replace detail-drawer address fields and add shrink-safe wrappers in `apps/dashboard/src/components/TurretDetail.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Preserve Full Address Access (Priority: P2)

**Goal**: Keep the full underlying address available through a themed copy action even when the display is shortened.

**Independent Test**: Interact with the address copy controls and verify they show the themed copy affordance and place the full address value on the clipboard.

### Tests for User Story 2 ⚠️

- [x] T011 [P] [US2] Add copy-button and clipboard assertions to `apps/dashboard/src/components/ResponsiveAddress.test.tsx`
- [x] T012 [P] [US2] Add full-address copy interaction coverage in `apps/dashboard/src/App.test.tsx`
- [x] T013 [P] [US2] Add full-address copy interaction coverage in `apps/dashboard/src/components/TurretDetail.test.tsx`

### Implementation for User Story 2

- [x] T014 [US2] Add the themed copy button behavior using `apps/dashboard/src/assets/copy.svg` in `apps/dashboard/src/components/ResponsiveAddress.tsx`
- [x] T015 [US2] Expose full-address copy actions from wallet and turret detail surfaces in `apps/dashboard/src/App.tsx` and `apps/dashboard/src/components/TurretDetail.tsx`
- [x] T016 [US2] Add full-address copy actions for address-bearing card fields in `apps/dashboard/src/components/TurretCard.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Apply One Consistent Address Pattern (Priority: P3)

**Goal**: Ensure all current dashboard address surfaces and fixtures use the same shared contract so future changes do not drift.

**Independent Test**: Compare the wallet header, turret cards, turret detail drawer, and demo fixtures and confirm they all use the same responsive display and themed copy behavior.

### Tests for User Story 3 ⚠️

- [x] T017 [P] [US3] Add shared-pattern regression coverage in `apps/dashboard/src/App.test.tsx`, `apps/dashboard/src/components/TurretCard.test.tsx`, and `apps/dashboard/src/components/TurretDetail.test.tsx`
- [x] T018 [P] [US3] Add fixture-alignment coverage for address-bearing turret data in `apps/dashboard/src/test-data.test.ts`

### Implementation for User Story 3

- [x] T019 [US3] Normalize address-bearing demo fixtures for shared responsive rendering in `apps/dashboard/src/test-data.ts`
- [x] T020 [US3] Remove any remaining one-off Sui address rendering in `apps/dashboard/src/App.tsx`, `apps/dashboard/src/components/TurretCard.tsx`, and `apps/dashboard/src/components/TurretDetail.tsx`
- [x] T021 [US3] Update the address guidance to reference the shared component and themed copy control in `docs/DESIGN_SYSTEM.md`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and feature-wide cleanup

- [x] T022 [P] Run the responsive-address verification steps from `specs/003-responsive-sui-addresses/quickstart.md`
- [x] T023 Run dashboard lint and targeted test validation for `apps/dashboard/src/App.tsx`, `apps/dashboard/src/components/ResponsiveAddress.tsx`, `apps/dashboard/src/components/TurretCard.tsx`, `apps/dashboard/src/components/TurretDetail.tsx`, `apps/dashboard/src/test-data.test.ts`, and related test files

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: Depend on Foundational completion
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational completion and delivers the MVP
- **User Story 2 (P2)**: Starts after Foundational completion and builds on the shared component introduced for US1
- **User Story 3 (P3)**: Starts after Foundational completion and is safest after US1/US2 because it consolidates the final shared pattern

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Shared component behavior before surface adoption
- Surface adoption before consistency cleanup
- Story complete before moving to the next priority if working sequentially

### Parallel Opportunities

- T003 can run while T001-T002 are in place because it targets a separate test file
- T005-T007 can run in parallel once the foundational component contract is defined
- T011-T013 can run in parallel because they touch separate test files
- T017-T018 can run in parallel because they cover different validation layers

---

## Parallel Example: User Story 1

```bash
# Launch User Story 1 test work together:
Task: "Add wallet-header responsive address coverage in apps/dashboard/src/App.test.tsx"
Task: "Add narrow-container address rendering coverage in apps/dashboard/src/components/TurretCard.test.tsx"
Task: "Add detail-drawer address containment coverage in apps/dashboard/src/components/TurretDetail.test.tsx"
```

---

## Parallel Example: User Story 2

```bash
# Launch User Story 2 copy-flow tests together:
Task: "Add copy-button and clipboard assertions to apps/dashboard/src/components/ResponsiveAddress.test.tsx"
Task: "Add full-address copy interaction coverage in apps/dashboard/src/App.test.tsx"
Task: "Add full-address copy interaction coverage in apps/dashboard/src/components/TurretDetail.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Confirm address-heavy views remain readable under resize

### Incremental Delivery

1. Ship the shared component and US1 to eliminate layout breakage
2. Add US2 to restore full-address copy behavior with the themed control
3. Add US3 to remove drift across remaining surfaces and fixtures
4. Finish with lint/test/quickstart validation

### Parallel Team Strategy

With multiple developers:

1. One developer finishes Setup + Foundational
2. After foundation:
    - Developer A: User Story 1 surface adoption
    - Developer B: User Story 2 copy interaction
    - Developer C: User Story 3 fixture/doc consistency

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] labels map directly to the spec user stories
- User Story 1 is the recommended MVP scope
- Use the upstream EVE Frontier copy asset rather than inventing a new icon
- Keep tasks scoped to exact files to avoid cross-story ambiguity
