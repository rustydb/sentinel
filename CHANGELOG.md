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
- `005-eve-frontier-theme`, including the branded shell overhaul, pilot statistics panel, turret-intelligence summaries, and demo/live parity updates.

### Changed

- Refined project layout to support Bun monorepo and Docker-first infrastructure.
- Updated the dashboard to use the EVE Frontier copy/tick assets, responsive address rendering, and richer interactive polish across cards, buttons, and wallet controls.
- Updated turret rendering to follow the real EVE ownership chain and world type-info APIs for names and icons.
- Updated network-node presentation to use explicit `Network Node` terminology and mapped solar-system state instead of leaking `locationHash`.
- Updated the indexer to poll real Sui turret events for Utopia with durable cursor/checkpoint handling.
- Updated docs and ADR conventions to use numbered `ADR-XXX-...` filenames.
- Updated the dashboard map integration to use dynamic `ef-map-highlight` and `ef-map-navigate` messaging instead of iframe reloads.
- Updated API persistence to retain solar-system names and last-known turret mappings for orphaned turrets.
- Updated the dashboard shell to use the Frontier Sentinel logo SVG, dark EVE Frontier telemetry palette, favicon wiring, and documented design tokens.
- Added a served `favicon.svg` so modern browsers can load the dashboard icon without relying on repo-relative asset paths.
- Updated turret cards and detail panes to show recent target intelligence, `ENGAGED` status overrides, and 24-hour aggressor summaries.
- Updated demo mode to mirror the live shell styling and threat-summary scenarios instead of acting as a stale side path.

### Fixed

- Base task implementation formatting for automated spec-runners.
- Fixed fatal dashboard render failures to fall back to a recoverable error screen instead of a white page.
- Fixed dashboard white-screen crashes caused by over-broad wallet/provider usage.
- Fixed dashboard GraphQL and API proxying so the UI no longer depends on browser-side CORS workarounds.
- Fixed `ef-map` embedding to use the supported iframe contract.
- Fixed responsive Sui address behavior across resize, card, and detail surfaces.
- Fixed Podman container/build issues across the dashboard, API, and indexer stack.
- Fixed turret solar-system display so cards and detail panes show friendly names instead of raw IDs or hashes.
- Fixed dashboard shell surfaces that were still falling back to bright neutral panels after the theme overhaul.
- Fixed the landing page logo treatment to use the transparent SVG mark so it blends with the canvas instead of showing a mismatched square background.
