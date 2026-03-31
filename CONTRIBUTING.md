# Contributing to Sentinel

First off, thank you for considering contributing to Sentinel!
This document outlines the absolutely critical rules and expectations for contributing to this project.

By participating, you agree to abide by our specific aesthetic, technical, and security constraints.

## 1. The Constitution is the Law

Before writing a single line of code, you **MUST** read the [Project Constitution](docs/CONSTITUTION.md).
It contains non-negotiable architectural mandates:

- **Type Safety Above All**: Target ES2022. `any` is strictly prohibited. Favor `unknown` and discriminated unions.
- **Brutalist UI Aesthetics**: We use zero border-radius (`0px`) globally. Sharp, angular, high-contrast UI only.
- **Clean State**: Immutable data and pure functions where practical.
- **Security**: Never log secrets. Prevent XSS via React's built-in escapes or explicit sanitization blocks.

## 2. Commit Standards

We govern all commit history strictly:

- **Signed Commits**: All commits **MUST** be GPG-signed. Commits without signatures will be rejected by our CI.

    ```bash
    git config commit.gpgsign true
    ```

- **Conventional Commits**: Every commit message must adopt the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) structure (e.g., `feat:`, `fix:`, `docs:`, `chore:`).
    - **Impact on Releases**: Your commits directly control our **Independent Versioning** strategy.
        - **Path-Based**: Only components with files changed in your commit will receive a version bump.
        - **Bump Types**: `fix:` triggers a patch bump (`0.1.0` -> `0.1.1`), `feat:` triggers a minor bump (`0.1.0` -> `0.2.0`), and `feat!:` triggers a major bump (`0.1.0` -> `1.0.0`).
        - **Scope**: While optional, using scopes like `feat(api):` or `fix(dashboard):` helps generate cleaner changelogs.

## 3. Development Workflow

1. Read the [CONSTITUTION.md](./docs/CONSTITUTION.md) - it is the absolute source of truth for all conventions.

1. **Branching**: Branch off `main` using the specific feature numbering system (e.g. `001-feature-name`).
1. **Implementation**:
    - Write comprehensive **Unit Tests** for any new utility, algorithm or generator. Include both happy and unhappy paths.
    - Write **Playwright UI Tests** for any alterations to the UX or interactions.
1. **Verification**:
    - Ensure your code is completely clean. Run `tsc -b` and the exact same linters/formatters as the CI system.
    - Never run generic `grep` validations over `/dist` or `node_modules`. Stick closely to `src/`.
1. **Pull Requests**: Pull Requests should point to `main` and undergo code review against the Constitution.

## 4. Naming Conventions

- **PascalCase**: React components, TypeScript interfaces, classes, enums, type aliases (`TurretCard.tsx`). Don't use the 'I' prefix for interfaces.
- **camelCase**: Variables, utility functions, filenames for logic (`codeGenerator.ts`).
- **kebab-case**: General organizational directories.

Thank you for building a robust and resilient Sentinel!
