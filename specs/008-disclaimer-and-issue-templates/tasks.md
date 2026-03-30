---
description: 'Task list for Disclaimer and Issue Templates'
---

# Tasks: Disclaimer and Issue Templates

**Input**: Design documents from `/specs/008-disclaimer-and-issue-templates/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

There is no complex shared setup needed for a frontend string update or markdown additions.

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

There are no blocking infrastructural prerequisites.

---

## Phase 3: User Story 1 - View Disclaimer in Dashboard (Priority: P1) 🎯 MVP

**Goal**: As a Sentinel user, I need to see a clear disclaimer indicating the prerelease status and legal context.

**Independent Test**: Load the dashboard and verify the footer/disclaimer contains the exact text at the appropriate styling constraint.

### Implementation for User Story 1

- [x] T001 [US1] Add the exact disclaimer text with `text-xs font-mono` to the main UI wrapper in `apps/dashboard/src/App.tsx` or its established persistent layout component.
- [x] T002 [US1] Wrap the `GitHub` text in the disclaimer with an anchor tag linking to `https://github.com/rustydb/sentinel/issues`.

**Checkpoint**: The dashboard visibly presents the disclaimer at the bottom and the link works.

---

## Phase 4: User Story 2 - Report Issues via GitHub Templates (Priority: P1)

**Goal**: Add GitHub issue templates for bug reports and feature requests.

**Independent Test**: Try to create an issue on GitHub and verify the new templates exist.

### Implementation for User Story 2

- [x] T003 [P] [US2] Create Bug Report template in `.github/ISSUE_TEMPLATE/bug_report.md`
- [x] T004 [P] [US2] Create Feature Request template in `.github/ISSUE_TEMPLATE/feature_request.md`

**Checkpoint**: Both issue templates exist natively in the `.github/ISSUE_TEMPLATE` root dir.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T005 Verify formatting locally via `bun lint` or `bunx vitest run` in the `apps/dashboard` package.

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (P1)**: No dependencies.
- **User Story 2 (P1)**: No dependencies.

### Within Each User Story

- The layout component updates are trivial and can be done synchronously.

### Parallel Opportunities

- User Story 1 and User Story 2 can be developed in 100% parallel as they touch distinct files (the dashboard codebase vs `.github/` folder).

---

## Implementation Strategy

### Incremental Delivery

1. Start with Phase 4 (US2) since it operates purely in markdown and establishes the GitHub structure.
2. Complete Phase 3 (US1) adding the UI textual component in the React dashboard.
3. Validate typography rules and execute Phase 5 polish tests.
