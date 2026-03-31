# Changelog

All notable changes to the Sentinel project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

## [Unreleased]

### Added

- Project Constitution establishing strict guidelines for Type Safety, DDD, and Brutalist UI.
- Initial monorepo specifications for `001-bootstrap` and `002-local-demo-mode`.
- Design constraints ensuring deterministic code generation and strict code formatting.
- Root [AGENTS.md] guidance for future agent sessions.
- A persistent lower-right dashboard build stamp showing version, commit hash, local dirty state, and a GitHub release-or-commit link for the running build, with the dashboard dev container now including `git` so the normal Podman workflow can resolve live build metadata.
- Consolidated the local compose setup to `docker-compose-dev.yml` and removed the stale `docker-compose.yml` references from project docs and specs.
- `003-responsive-sui-addresses`, including the shared `ResponsiveAddress` component and themed copy/tick feedback.
- Podman-friendly local development stack via `docker-compose.dev.yml`.
- EVE Wallet-first dashboard connection flow and ADR coverage for wallet-selection behavior.
- `004-solar-system-assignment`, including bundled solar-system catalogs, assignment UI, retained orphan mappings, and a network node side drawer.
- `005-eve-sentinel-theme`, including the branded shell overhaul, pilot statistics panel, turret-intelligence summaries, and demo/live parity updates.
- `006-hot-load-indexer-updates`, including visibility-aware dashboard polling, no-store live reads, selection continuity by turret ID, and fresh API headers for indexer-backed data.

### Changed

- Refined project layout to support Bun monorepo and Docker-first infrastructure.
- Expanded the repository README with the Sentinel logo, stack overview, local workflow, validation commands, documentation links, and license guidance.
- Updated dashboard world resolution to derive the active EVE world from the connected Eve Vault tenant so turret package IDs, world API lookups, and solar-system catalogs switch between Utopia and Stillness per login.
- Reworked the dashboard shell into a single inline command row with branded search, drawer-driven network-node filtering, badge-driven advanced filters, and a separate expandable metrics blind beneath it.
- Updated the dashboard to use the EVE Frontier copy/tick assets, responsive address rendering, and richer interactive polish across cards, buttons, and wallet controls.
- Updated turret rendering to follow the real EVE ownership chain and world type-info APIs for names and icons.
- Updated network-node presentation to use explicit `Network Node` terminology and mapped solar-system state instead of leaking `locationHash`.
- Updated the indexer to poll real Sui turret events for Utopia with durable cursor/checkpoint handling.
- Updated docs and ADR conventions to use numbered `ADR-XXX-...` filenames.
- Updated the dashboard map integration to use dynamic `ef-map-highlight` and `ef-map-navigate` messaging instead of iframe reloads.
- Updated API persistence to retain solar-system names and last-known turret mappings for orphaned turrets.
- Updated the dashboard shell to use the Sentinel logo SVG, dark EVE Frontier telemetry palette, favicon wiring, and documented design tokens.
- Added a served `favicon.svg` so modern browsers can load the dashboard icon without relying on repo-relative asset paths.
- Updated turret cards and detail panes to show recent target intelligence, `ENGAGED` status overrides, and 24-hour aggressor summaries.
- Updated demo mode to mirror the live shell styling and threat-summary scenarios instead of acting as a stale side path.
- Finalized the hot-load dashboard polish with expandable event-log payload blinds, local/UTC timestamp switching, and a more compact sticky toolbar.

### Fixed

- Restored the Sentinel dashboard shell to the canonical SVG logo, loaded the intended Outfit and JetBrains Mono fonts, and replaced the remaining white copy controls with themed surfaces.
- Removed stale `?demo=true` references in the dashboard workflow and wired `/demo` advanced filtering to the mocked status and class options.
- Base task implementation formatting for automated spec-runners.
- Fixed fatal dashboard render failures to fall back to a recoverable error screen instead of a white page.
- Fixed dashboard white-screen crashes caused by over-broad wallet/provider usage.
- Fixed turret card and detail target/tribe fields so they preserve natural casing instead of forcing all-caps styling.
- Removed the turret detail panel's target type field and updated the supporting spec docs to match.
- Fixed dashboard GraphQL and API proxying so the UI no longer depends on browser-side CORS workarounds.
- Fixed `ef-map` embedding to use the supported iframe contract.
- Fixed responsive Sui address behavior across resize, card, and detail surfaces.
- Fixed Podman container/build issues across the dashboard, API, and indexer stack.
- Fixed turret solar-system display so cards and detail panes show friendly names instead of raw IDs or hashes.
- Fixed dashboard shell surfaces that were still falling back to bright neutral panels after the theme overhaul.
- Fixed the landing page logo treatment to use the transparent SVG mark so it blends with the canvas instead of showing a mismatched square background.
- Fixed turret card status/class metadata rows so their labels and badges stay vertically aligned in narrower card layouts even when a badge wraps.
