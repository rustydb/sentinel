# frontier-sentinel Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-30

## Active Technologies

- TypeScript 5.8.x in the dashboard and shared-types packages, with the existing React 19 / Vite 6 stack + React 19, Vite 6, Bun, `@frontier-sentinel/shared-types`, existing dashboard hooks, Testing Library, Vitest 3, Playwright (007-turret-filters)
- No new storage; filtering is derived from the already loaded turret data and existing node / solar-system / type resolution surfaces (007-turret-filters)

- TypeScript 5.8.x for dashboard/API code, SQL for the existing PostgreSQL-backed indexer data + React 19, Vite 6, Bun, Express, `pg`, `@evefrontier/dapp-kit`, `@mysten/dapp-kit-react`, Vitest 3, Testing Library, Playwright (006-hot-load-indexer-updates)
- Existing PostgreSQL database for indexer-derived turret, event, and network-node state; existing dashboard fixture data for `/demo` (006-hot-load-indexer-updates)

- TypeScript 5.8.x for dashboard/API code, SQL for the existing PostgreSQL-backed indexer data + React 19, Vite 6, Tailwind CSS 4, Bun, Express, `pg`, `@evefrontier/dapp-kit`, `@mysten/dapp-kit-react`, Vitest 3, Testing Library, Playwright (005-eve-frontier-theme)
- Existing PostgreSQL database for indexer and assignment data, existing repo assets including `./assets/logo.png`, and documented design tokens in `docs/DESIGN_SYSTEM.md` (005-eve-frontier-theme)

- TypeScript 5.8.x for dashboard/API code, SQL for the existing PostgreSQL schema + React 19, Vite 6, Tailwind CSS 4, Bun, Express, `pg`, `@evefrontier/dapp-kit`, `@mysten/dapp-kit-react`, Vitest 3, Testing Library, Playwright (004-solar-system-assignment)
- Existing PostgreSQL database for node and retained turret mappings plus a versioned bundled solar-system catalog committed in the repo (004-solar-system-assignment)

- TypeScript 5.8.x, React 19.1.x + React 19, `@evefrontier/dapp-kit`, `@mysten/dapp-kit-react`, Tailwind CSS 4, Vite 6 (003-responsive-sui-addresses)

- TypeScript (Bun runtime), Rust (Edition 2021) + React 19, Vite 6, Tailwind CSS 4, Express 5, `sui-indexer-alt-framework`, `diesel`, `@evefrontier/dapp-kit` (001-bootstrap-sentinel)

## Project Structure

```text
src/
tests/
```

## Commands

cargo test [ONLY COMMANDS FOR ACTIVE TECHNOLOGIES][ONLY COMMANDS FOR ACTIVE TECHNOLOGIES] cargo clippy

## Code Style

TypeScript (Bun runtime), Rust (Edition 2021): Follow standard conventions

## Recent Changes

- 007-turret-filters: Added TypeScript 5.8.x in the dashboard and shared-types packages, with the existing React 19 / Vite 6 stack + React 19, Vite 6, Bun, `@frontier-sentinel/shared-types`, existing dashboard hooks, Testing Library, Vitest 3, Playwright

- 006-hot-load-indexer-updates: Added TypeScript 5.8.x for dashboard/API code, SQL for the existing PostgreSQL-backed indexer data + React 19, Vite 6, Bun, Express, `pg`, `@evefrontier/dapp-kit`, `@mysten/dapp-kit-react`, Vitest 3, Testing Library, Playwright

- 005-eve-frontier-theme: Added TypeScript 5.8.x for dashboard/API code, SQL for the existing PostgreSQL-backed indexer data + React 19, Vite 6, Tailwind CSS 4, Bun, Express, `pg`, `@evefrontier/dapp-kit`, `@mysten/dapp-kit-react`, Vitest 3, Testing Library, Playwright

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
