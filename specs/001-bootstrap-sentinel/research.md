# Phase 0: Outline & Research

## Unknowns Addressed

None. The original from-scratch design document provided a complete, detailed, and resolved architecture for this project.

## Technology Decisions

- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS 4 (via `@theme` block integration)
- **Containerization**: Podman/Docker compatible, multi-stage builds.
- **Backend API**: Express 5 + PostgreSQL for network node management mapping.
- **Data Indexing**: Rust + `sui-indexer-alt-framework` for on-chain events.
- **Smart Contracts**: Sui Move (turret_extension)

## Alternatives Considered

- Using a monolithic backend vs microservices: A separated Express API and Rust Indexer approach was chosen to leverage the specific strengths of `sui-indexer-alt-framework` offloading the intensive blockchain event parsing, while keeping standard web API traffic in Node.
