<p align="center">
  <img src="./assets/logo.png" alt="Sentinel logo" width="140" />
</p>

<h1 align="center">
Sentinel
</h1>

<p align="center"><strong>Defensive telemetry for EVE Frontier turret operators.</strong></p>

## Table of Contents

- [What It Covers](#what-it-covers)
- [Tech Stack](#tech-stack)
- [Repository Layout](#repository-layout)
- [EVE Hackathon Notes](#eve-hackathon-notes)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Preferred Local Workflow](#preferred-local-workflow)
    - [Production-Style Stack](#production-style-stack)
    - [Host-Native Workflow](#host-native-workflow)
- [Validation](#validation)
- [Documentation](#documentation)
- [License](#license)

---

Sentinel is an EVE Frontier dashboard for live monitoring of a user's turret assemblies; their interactions, and current status.

The project combines a React dashboard, a Bun/Express support API, and a Rust indexer that follows turret activity on Sui blockchain.

## What It Covers

- Displaying Turret Smart Assembly objects owned by the logged in wallet
- Event history and threat intelligence from indexed on-chain turret events
- Solar-system mapping for working around the location obfuscation in EVE, players can assign solar-systems to their network nodes
- Galaxy plotting by network-node; assign solar systems to network-nodes to map turrets
- Live operator view

## Tech Stack

- `Bun` workspaces for the monorepo, scripts, and API runtime
- `React 19` and `Vite` for the dashboard
- `TypeScript` across the dashboard, API, and shared contracts
- `Tailwind CSS v4` for styling
- `Express 5` and `pg` for dashboard support APIs
- `Rust` with `tokio`, `reqwest`, `tokio-postgres`, and `diesel` for the Sui indexer
- `PostgreSQL` for indexed events, node mappings, and derived dashboard state
- `Podman Compose` for the preferred local development stack
- `Vitest`, Testing Library, Playwright, ESLint, and Prettier for validation

## Repository Layout

```text
.
|-- apps/
|   |-- dashboard/      # React dashboard UI
|   |-- api/            # Bun + Express support API
|   `-- indexer/        # Rust indexer for Sui turret events
|-- packages/
|   `-- shared-types/   # Shared GraphQL queries and TypeScript contracts
|-- docs/               # Product, domain, design system, ADRs
|-- specs/              # Speckit specs, plans, tasks, quickstarts
|-- assets/             # Shared branding assets
|-- docker-compose.dev.yml
`-- docker-compose.yml
```

## EVE Hackathon Notes

The 2026 EVE Hackathon was ongoing during Cycle 5 of EVE Frontier, and at this time there were
momumental changes made to the game. Some of these changes, such as certain on-chain events, were
not fully functional yet for the hackathon.

To work around missing on-chain events, this application created a "demo-mode" that populates the dashboard with static mocks.

Demo mode will be removed from the application after the on-chain events become available, it will
not be maintained long-term.

> NOTE: The data in demo mode is entirely static, it makes no attempt to simulate live data.

Access demo-mode by the `/demo` sub-path (e.g. `http://localhost:5173/demo`).

## Getting Started

### Prerequisites

- `Podman` and `podman compose`
- `Bun` 1.2+ for host-native workflows
- `Rust` and `cargo` if you want to run the indexer outside containers

### Preferred Local Workflow

The repo is designed to be iterated on with the development stack:

```bash
podman compose -f docker-compose.dev.yml up
```

Local services:

- dashboard: `http://127.0.0.1:5173`
- api: `http://127.0.0.1:3002`
- postgres: `127.0.0.1:5433`

Useful routes:

- live dashboard: `http://127.0.0.1:5173`
- demo dashboard: `http://127.0.0.1:5173/demo`

Use the live dashboard when you want the real wallet-connected flow. Use `/demo` when you want a fixture-backed review surface without depending on live telemetry.

Notes:

> This project was built and tested using `podman` and `podman compose`. Use `docker` at your own discretion.
>
> - The dev stack defaults to the current `Utopia` world assumptions
> - the demo route stays fixture-backed on purpose; it does not pretend to be live telemetry
> - some older repo quickstarts still mention `5174`, but the checked-in dashboard runtime is currently configured for `5173`

### Production-Style Stack

For a production-style container build, use the main compose file:

```bash
podman compose up --build
```

### Host-Native Workflow

If you want to run pieces directly on your machine instead of through Podman:

```bash
bun install
bun run dev
cargo run --manifest-path apps/indexer/Cargo.toml
```

The root `dev` script starts the dashboard and API together. The indexer runs separately.

## Validation

For dashboard-focused work, start with:

```bash
bun lint
bunx vitest run --environment jsdom
```

For the full repo:

```bash
bun test
```

For indexer-only work:

```bash
cargo test --manifest-path apps/indexer/Cargo.toml
```

## Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution rules and commit expectations
- [CHANGELOG.md](./CHANGELOG.md) for notable project changes
- Design and spec documentation is located in the `./docs` directory.

## License

This project is licensed under the [MIT License](./LICENSE.md).
