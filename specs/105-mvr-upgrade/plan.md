# Implementation Plan: Upgrade to MVR for Turret Package IDs

**Branch**: `105-mvr-upgrade` | **Date**: 2026-05-24 | **Spec**: [specs/105-mvr-upgrade/spec.md](file:///home/rusty/gitstuffs/rusty/sentinel/specs/105-mvr-upgrade/spec.md)
**Input**: Feature specification from `/specs/105-mvr-upgrade/spec.md`

## Summary

The goal is to replace the hardcoded turret package ID resolution with dynamic Move Version Registry (MVR) resolution. This involves adding the `@suins/mvr` SDK to the Dashboard and a dedicated MVR crate (or standard `sui-sdk` integration) to the Rust Indexer to resolve the active `Package ID` on startup using the original static package ID as an anchor.

## Technical Context

**Language/Version**: TypeScript (Dashboard), Rust 1.70+ (Indexer)
**Primary Dependencies**: `@suins/mvr`, `@mysten/sui`, `sui-sdk`
**Storage**: N/A
**Testing**: `vitest` (Dashboard), `cargo test` (Indexer)
**Target Platform**: Linux (Indexer), Web Browser (Dashboard)
**Project Type**: Monorepo (React UI + Rust daemon)
**Performance Goals**: MVR resolution on startup should not add more than 2 seconds to initialization.
**Constraints**: Brutalist UI constraints apply, but this is a pure backend/networking upgrade. No UI changes expected other than loading states.
**Scale/Scope**: Upgrading startup logic in 2 components.

## Constitution Check

_GATE: Passed_

- [x] **Code Quality**: Uses TypeScript, strict typing, and Docker best practices.
- [x] **Testing Standards**: Adheres to TDD and includes CI/CD test gates.
- [x] **UX Consistency**: Follows Brutalist design (monospace, thick borders, no gradients).
- [x] **Performance**: Designed for scalability (Cloud Run) and CI/CD benchmarks.

## Project Structure

### Documentation (this feature)

```text
specs/105-mvr-upgrade/
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Technical data model
├── quickstart.md        # Testing instructions
└── tasks.md             # Task breakdown (future)
```

### Source Code (repository root)

```text
apps/dashboard/
├── package.json         # Needs @suins/mvr dependency
└── src/
    └── world.ts         # Modified resolution logic

apps/indexer/
├── Cargo.toml           # Needs MVR dependency / sui-sdk updates
└── src/
    └── main.rs          # Modified startup routine
```

**Structure Decision**: The project is a standard workspace monorepo. We will directly modify the existing `apps/dashboard/src/world.ts` and `apps/indexer/src/main.rs`.

## Complexity Tracking

No violations. The simplest approach (startup-only resolution) was selected over periodic polling to minimize runtime complexity, tracking dynamic polling via an external issue (#113).
