# Quickstart Guide

## Prerequisites

- **Bun**: Make sure Bun is installed (`curl -fsSL https://bun.sh/install | bash`).
- **Podman**: Ensure `podman` and `podman compose` are available for the database / containers.
- **Rust**: Optionally required if developing the indexer without Docker.

## Setup Instructions

1. **Install Dependencies**
   Run the following from the root directory:

    ```bash
    bun install
    ```

2. **Start Development Environment**
   Start the supporting services:

    ```bash
    podman compose -f docker-compose-dev.yml up -d postgres
    ```

    In separate terminals start the dashboard and API:

    ```bash
    bun run --filter @sentinel/dashboard dev
    bun run --filter @sentinel/api dev
    ```

    Start the indexer when you need event ingestion:

    ```bash
    export EVE_PACKAGE_ID=0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75
    cargo run --manifest-path apps/indexer/Cargo.toml
    ```

    The indexer polls `EVE_PACKAGE_ID::turret` and persists its RPC cursor in PostgreSQL so it can resume from the last processed page.
    Current world package IDs:
    - `Utopia` (current sandbox default):
        - `0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75`
        - `0x07e6b810c2dff6df56ea7fbad9ff32f4d84cbee53e496267515887b712924bd1`
    - `Stillness` (planned later switch):
        - `0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c`
        - `0xd2fd1224f881e7a705dbc211888af11655c315f2ee0f03fe680fc3176e6e4780`

3. **Verify Health**
   Check that the API is running at `http://localhost:3001/api/health`.
   Open `http://localhost:5173/demo` for a dependency-free UI smoke test, or `http://localhost:5173` for live wallet mode.

4. **Testing**
   Run the test suite across all workspaces:

    ```bash
    bun run test
    ```

    Run browser coverage separately:

    ```bash
    bun run test:e2e
    ```

    For local browser automation notes, see:
    [`docs/testing-with-sui-test-wallet.md`](../../docs/testing-with-sui-test-wallet.md)

5. **Container Verification**
   Validate the container stack end-to-end:
    ```bash
    podman compose -f docker-compose-dev.yml up --build
    ```
