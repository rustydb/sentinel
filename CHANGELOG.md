# Changelog

All notable changes to the Frontier Sentinel project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## [Unreleased]

### Added

- Project Constitution establishing strict guidelines for Type Safety, DDD, and Brutalist UI.
- Initial monorepo specifications for `001-bootstrap-sentinel` and `002-local-demo-mode`.
- Design constraints ensuring deterministic code generation and strict code formatting.
- Root [AGENTS.md] guidance for future agent sessions.
- `003-responsive-sui-addresses`, including the shared `ResponsiveAddress` component and themed copy/tick feedback.
- Podman-friendly local development stack via `docker-compose.dev.yml`.
- EVE Wallet-first dashboard connection flow and ADR coverage for wallet-selection behavior.
- `004-solar-system-assignment`, including bundled solar-system catalogs, assignment UI, retained orphan mappings, and a network node side drawer.

### Changed

- Refined project layout to support Bun monorepo and Docker-first infrastructure.
- Updated the dashboard to use the EVE Frontier copy/tick assets, responsive address rendering, and richer interactive polish across cards, buttons, and wallet controls.
- Updated turret rendering to follow the real EVE ownership chain and world type-info APIs for names and icons.
- Updated network-node presentation to use explicit `Network Node` terminology and mapped solar-system state instead of leaking `locationHash`.
- Updated the indexer to poll real Sui turret events for Utopia with durable cursor/checkpoint handling.
- Updated docs and ADR conventions to use numbered `ADR-XXX-...` filenames.
- Updated the dashboard map integration to use dynamic `ef-map-highlight` and `ef-map-navigate` messaging instead of iframe reloads.
- Updated API persistence to retain solar-system names and last-known turret mappings for orphaned turrets.

### Fixed

- Base task implementation formatting for automated spec-runners.
- Fixed dashboard white-screen crashes caused by over-broad wallet/provider usage.
- Fixed dashboard GraphQL and API proxying so the UI no longer depends on browser-side CORS workarounds.
- Fixed `ef-map` embedding to use the supported iframe contract.
- Fixed responsive Sui address behavior across resize, card, and detail surfaces.
- Fixed Podman container/build issues across the dashboard, API, and indexer stack.
- Fixed turret solar-system display so cards and detail panes show friendly names instead of raw IDs or hashes.
