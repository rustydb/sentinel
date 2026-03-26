# Implementation Plan: Bootstrap Sentinel

**Branch**: `001-bootstrap-sentinel` | **Date**: 2026-03-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-bootstrap-sentinel/spec.md`

## Summary

Bootstrap the entire Frontier Sentinel monorepo from scratch, encompassing a React 19 + Tailwind CSS 4 frontend, an Express API backend, a Rust-based Sui event indexer, and a Move smart contract package. Connects to the EVE Vault wallet for on-chain interaction.

## Technical Context

**Language/Version**: TypeScript (Bun runtime), Rust (Edition 2021)
**Primary Dependencies**: React 19, Vite 6, Tailwind CSS 4, Express 5, `sui-indexer-alt-framework`, `diesel`, `@evefrontier/dapp-kit`
**Storage**: PostgreSQL (production), SQLite in-memory (testing)
**Testing**: Vitest, `@testing-library/react`, `supertest`, `cargo test`. TDD approach.
**Target Platform**: Web browser, Node (via Bun), Linux (Podman containerized)
**Project Type**: Monorepo Web Application, API, and Indexer
**Performance Goals**: API response < 200ms p95; Indexer < 10s behind real-time
**Constraints**: Brutalist UI styling (monospace, zero rounded corners), strict CI/CD gates
**Scale/Scope**: Monorepo with 4 apps/packages, orchestrated via `docker-compose`

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Code Quality**: Uses TypeScript, strict typing, and Docker best practices (multi-stage builds in Podman, non-root environments).
- [x] **Testing Standards**: Adheres to TDD and includes CI/CD test gates.
- [x] **UX Consistency**: Follows Brutalist design explicitly scoped (Outfit/JetBrains Mono, `#ff5f1f` primary accent).
- [x] **Performance**: Designed for scalability and CI/CD benchmarks.

## Project Structure

### Documentation (this feature)

```text
specs/001-bootstrap-sentinel/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
apps/
├── dashboard/          # React 19 + Vite + TypeScript + Tailwind 4
├── api/                # Express 5 + TypeScript + PostgreSQL
└── indexer/            # Rust + Diesel + Sui Indexer
packages/
└── shared-types/       # Common types, GraphQL queries, constants
tools/
└── scripts/            # CLI utilities
```

**Structure Decision**: Monorepo format utilizing Bun workspaces (`apps/*`, `packages/*`, `tools/*`).
