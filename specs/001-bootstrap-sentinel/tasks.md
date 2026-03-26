# Tasks: Bootstrap Sentinel

**Input**: Design documents from `/specs/001-bootstrap-sentinel/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Initialize Bun monorepo and workspace root configuration in package.json
- [ ] T002 [P] Configure global ESLint, Prettier, Husky, and commitlint to enforce Conventional Commits
- [ ] T002b [P] Configure root and workspace `tsconfig.json` files for strict ES2022 targeting
- [ ] T003 Initialize `@frontier-sentinel/shared-types` package structure
- [ ] T004 Initialize `@frontier-sentinel/api` Express project structure
- [ ] T005 Initialize `@frontier-sentinel/dashboard` React+Vite project structure
- [ ] T006 Initialize `@frontier-sentinel/indexer` Rust project structure
- [ ] T008 [P] Configure Tailwind CSS 4 `@theme` in apps/dashboard/src/index.css
- [ ] T009 [P] Create base Dockerfiles for apps/api, apps/dashboard, and apps/indexer
- [ ] T009b [P] Setup Playwright framework for End-to-End browser UI testing in apps/dashboard/tests/e2e/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [ ] T010 Setup `docker-compose.yml` with PostgreSQL and dependent services
- [ ] T011 Setup apps/indexer database schema and Diesel migrations for `turret_events`
- [ ] T012 Setup apps/api database connection pool and `network_node_systems` table
- [ ] T013 [P] Implement `TurretData`, `TurretEvent`, and GraphQL constants in packages/shared-types/src/index.ts
- [ ] T014 [P] Scaffold basic API HTTP server with `/api/health` endpoint in apps/api/src/app.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Connect Wallet and View Dashboard (Priority: P1) 🎯 MVP

**Goal**: As a user, I want to connect my EVE Vault wallet so that I can view a dashboard of all my owned turret Smart Assembly objects.

**Independent Test**: Can be fully tested by connecting a wallet and verifying that the dashboard displays a grid of Turret Cards with accurate status, network node, and location.

### Tests for User Story 1 (TDD REQUIRED)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T015 [P] [US1] Unit test for TurretCard component in apps/dashboard/src/components/TurretCard.test.tsx
- [ ] T016 [P] [US1] Contract test for fetching wallet assemblies in apps/dashboard/src/hooks/useTurrets.test.ts
- [ ] T016b [US1] Playwright E2E test for Wallet Connection and Dashboard grid rendering

### Implementation for User Story 1

- [ ] T017 [US1] Wrap dashboard `App` with `EveFrontierProvider` for wallet connection in apps/dashboard/src/main.tsx
- [ ] T018 [P] [US1] Create `TurretCard` and `TurretList` components in apps/dashboard/src/components/TurretCard.tsx
- [ ] T019 [US1] Implement `useTurrets` hook executing `GET_CHARACTER_AND_OWNED_OBJECTS` GraphQL query in apps/dashboard/src/hooks/useTurrets.ts
- [ ] T020 [US1] Connect `TurretList` to `useTurrets` hook to display the grid in apps/dashboard/src/App.tsx

**Checkpoint**: User Story 1 MVP should be independently testable.

---

## Phase 4: User Story 4 - Index On-Chain Events (Priority: P1)

**Goal**: Background service that listens to Sui blockchain and stores turret events into PostgreSQL.

**Independent Test**: Fully tested by running Rust indexer against testnet and querying PostgreSQL `turret_events`.

### Tests for User Story 4 (TDD REQUIRED)

- [ ] T021 [P] [US4] Unit test for parsing TurretStatusChanged events in apps/indexer/src/handlers.rs
- [ ] T022 [P] [US4] Integration test for database insertion in apps/indexer/tests/db_tests.rs

### Implementation for User Story 4

- [ ] T023 [P] [US4] Implement `StoredTurretEvent` model in apps/indexer/src/models.rs
- [ ] T024 [US4] Implement checkpoint subscriber and event filtering in apps/indexer/src/main.rs
- [ ] T025 [US4] Implement `TurretEventHandler` to write events to database in apps/indexer/src/handlers.rs

---

## Phase 5: User Story 2 - View Turret Details and Event Log (Priority: P2)

**Goal**: Bottom-sheet drawer with full on-chain address, node assignments, and paginated event log.

**Independent Test**: Open the detail drawer, verify event log and node assignment components.

### Tests for User Story 2 (TDD REQUIRED)

- [ ] T026 [P] [US2] API test for network-nodes CRUD endpoints in apps/api/src/app.test.ts
- [ ] T027 [P] [US2] Component test for TurretDetail drawer in apps/dashboard/src/components/TurretDetail.test.tsx
- [ ] T027b [US2] Playwright E2E interaction test for TurretDetail drawer and network node assignment flow

### Implementation for User Story 2

- [ ] T028 [P] [US2] Implement `/api/network-nodes` and related CRUD endpoints in apps/api/src/routes.ts
- [ ] T029 [P] [US2] Implement `/api/events/:turretId` endpoint in apps/api/src/routes.ts
- [ ] T030 [P] [US2] Create `TurretDetail` component and bottom-sheet drawer UI in apps/dashboard/src/components/TurretDetail.tsx
- [ ] T031 [US2] Implement `useNetworkNodes` and `useTurretEvents` hooks in apps/dashboard/src/hooks/
- [ ] T032 [US2] Integrate hooks into `TurretDetail` for pagination and node assignment

---

## Phase 6: User Story 3 - View Turret Locations on Universe Map (Priority: P2)

**Goal**: See turrets' locations on an embedded universe map (ef-map).

**Independent Test**: Map iframe loads and receives `postMessage` events to navigate to systems.

### Tests for User Story 3 (TDD REQUIRED)

- [ ] T033 [P] [US3] Unit test for MapEmbed postMessage logic in apps/dashboard/src/components/MapEmbed.test.tsx
- [ ] T033b [US3] Playwright E2E visual test validating Map iframe embedding and spatial navigation constraints

### Implementation for User Story 3

- [ ] T034 [P] [US3] Create `MapEmbed` component with ef-map.com iframe in apps/dashboard/src/components/MapEmbed.tsx
- [ ] T035 [US3] Add location click handlers to `TurretDetail` to trigger map navigation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T036 Update `quickstart.md` with final run verification steps
- [ ] T037 [P] Configure GitHub Actions CI/CD workflows in `.github/workflows/`
- [ ] T038 Review all UI components for Brutalist design constraints (no gradients, sharp borders)

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1. Blocks all user stories.
- **User Stories (Phase 3+)**: US1 and US4 can proceed in parallel. US2 depends on US4 (needs event log). US3 can run parallel to US2.
- **Polish (Final Phase)**: Depends on completion of all user stories.

### Parallel Opportunities

```bash
# Example parallel tests for US1
Task: T015 Component test for TurretCard
Task: T016 Contract test for useTurrets

# Example parallel models/UI for US2
Task: T028 API CRUD endpoints
Task: T030 TurretDetail drawer UI
```

## Implementation Strategy

### Incremental Delivery
1. Complete Setup + Foundational
2. Deliver User Story 1 (MVP: Wallet + Dashboard grid)
3. Deliver User Story 4 (Indexer background processing)
4. Deliver User Story 2 (Detail drawer + integrated events)
5. Deliver User Story 3 (Map embedding)
