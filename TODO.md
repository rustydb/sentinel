# Sentinel - Master TODO

> This file is the single source of truth for all outstanding code, documentation,
> infrastructure, and research tasks.

## Table of Contents

- [Feature Implementation](#feature-implementation)
- [CI/CD & Infrastructure](#cicd--infrastructure)

## Feature Implementation

> This file is the single source of truth for all outstanding code, documentation,
> infrastructure, and research tasks.

- [ ] **Discord notifcations** Add the ability to watch turrets and have their
      updates posted to Discord. Updates should be posted based on severity, and in
      summary. Allows configuration for anti-spam.

## CI/CD & Infrastructure

- [ ] **Manage Indexer Release** release-please does not support `Cargo.toml` files
      that do not live at the project root
      (https://github.com/googleapis/release-please/issues/2589). Close this gap for
      automatic release management of `apps/indexer` after bug resolution.
