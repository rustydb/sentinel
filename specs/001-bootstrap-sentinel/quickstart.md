# Quickstart Guide

## Prerequisites

- **Bun**: Make sure Bun is installed (`curl -fsSL https://bun.sh/install | bash`).
- **Podman / Docker**: Ensure docker-compose is available for the database / containers.
- **Rust**: Optionally required if developing the indexer without Docker.

## Setup Instructions

1. **Install Dependencies**
   Run the following from the root directory:
   ```bash
   bun install
   ```

2. **Start Development Environment**
   Start the supporting databases via compose:
   ```bash
   docker-compose -f docker-compose.dev.yml up -d db
   ```
   Start the applications:
   ```bash
   bun run dev
   ```

3. **Verify Health**
   Check that the API is running at `http://localhost:3001/api/health`.

4. **Testing**
   Run the test suite across all workspaces:
   ```bash
   bun run test
   ```
