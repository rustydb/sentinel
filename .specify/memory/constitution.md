<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles:
  - I. Code Quality: Added MUST for ESLint (TypeScript) and rustfmt (Rust)
- Added sections: None
- Removed sections: None
- Templates requiring updates: None
- Follow-up TODOs: None
-->

# Frontier Sentinel Constitution

## Core Principles

### I. Code Quality

- MUST be written in TypeScript with strict typing.
- MUST adhere to Docker best practices (multi-stage builds, non-root users, distroless for prod).
- MUST enforce ESLint for TypeScript linting and rustfmt for Rust formatting.
- **Rationale**: High code quality ensures maintainability and minimizes bugs in production.

### II. Testing Standards

- MUST employ TDD (Test-Driven Development): Tests written → User approved → Tests fail → Then implement.
- MUST include unit, integration, and E2E tests in the CI/CD pipeline (Fail fast).
- **Rationale**: Comprehensive testing guarantees reliability and safe refactoring.

### III. User Experience Consistency

- MUST follow a Brutalist, raw, and high-contrast design style.
- MUST use monospace fonts and thick borders; MUST avoid gradients, shadows, and rounded corners.
- **Rationale**: A distinct, brutalist aesthetic provides a cohesive and unmistakable brand identity.

### IV. Performance Requirements

- MUST design for scalability and elasticity (e.g., scale to zero with Cloud Run).
- MUST meet strict performance benchmarks in the CI/CD pipeline (caching, path filtering).
- **Rationale**: Performance is critical for edge deployments and optimal cloud resource usage.

## Governance

- The Constitution supersedes all other practices.
- Amendments require documentation, approval, and semantic versioning bumps.
- All PRs/reviews MUST verify compliance with these principles through automated CI/CD checks.
- The extended reference is `docs/CONSTITUTION.md`; this file is the speckit-consumable distillation.

**Version**: 1.1.0 | **Ratified**: 2026-03-26 | **Last Amended**: 2026-03-27
