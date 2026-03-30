---
title: Sentinel - Deployment
version: 1.0.0
status: draft
created: 2026-03-30
updated: 2026-03-30
author: rustydb
description: Deployment configuration, release process, and environment management.
---

## Architecture Overview

Sentinel is a client-rendered single-page application (SPA) backed by a Backends-for-Frontends (BFF) API and a blockchain-indexing data pipeline. It is a polyglot, multi-process system leveraging three-tier architecture; each application is independently deployable.

| Tier             | Component                     | Role                                                                                   |
| ---------------- | ----------------------------- | -------------------------------------------------------------------------------------- |
| **Presentation** | `apps/dashboard` (React/Vite) | Client-side SPA — renders in the browser, fetches data from the API                    |
| **Application**  | `apps/api` (Bun/Express)      | Backend-for-frontend (BFF) — serves structured data to the dashboard                   |
| **Data**         | PostgreSQL                    | Persistent store for indexed blockchain state                                          |
| **Ingestion**    | `apps/indexer` (Rust)         | Event-driven pipeline — reads Sui on-chain events and writes derived state to Postgres |

### Deployment Architecture

### Development - `podman-compose`

For local development, the the full Sentinel project may be launched via `podman compose`/`docker compose`. The development compose files enable hot-reload for viewing live changes to any of the applications.

- Development (with hot-reload):

```bash
podman compose -f docker-compose.dev.yml up -d
```

- Production (no hot-reload):

```bash
podman compose up -d
```

## Production - Cloud Run + Cloud SQL

Sentinel uses Cloud Run and Cloud SQL for a scalable, high-performance solution for monitoring blockchain data. This model enables low-latency streaming of Sui data to support fast dApp performance.

- Compute: Cloud Run (Serverless) for the API (Node.js), dashboard (React), and Sui blockchain indexer (Rust framework)
- Database: Cloud SQL for PostgreSQL
- Storage/Ingestion: Artifact Registry for storing Docker Images
- Data Source: Sui Full Nodes

### GCP Infrastructure Setup

Sentinel's production layout requires three Google Cloud Run services to act as the presentation, BFF, and data ingestion layers, mapping exactly to our local Docker multi-process pattern.

**Database Layer:**
A Google Cloud SQL instance (`sentinel-db`) running PostgreSQL 16 operates as the central persistence layer.
The database connects to Cloud Run over Google's internal VPC, automatically managed via the Cloud Run `--add-cloudsql-instances` flag. A custom database and user role must be created before provisioning the services.

**Container Registry:**
Container images are pushed to Google Artifact Registry (`us-central1-docker.pkg.dev/YOUR_PROJECT/sentinel-repo`).

### Cloud Run Service Configuration

Each tier demands specific Cloud Run deployment configurations:

1. **Dashboard** (`apps/dashboard`):
    - Deployed dynamically serving the static React Vite build.
    - Connected to the API via `API_PROXY_URL` environment variables.
2. **API BFF** (`apps/api`):
    - Attached to the Cloud SQL instance using the `DATABASE_URL` environment variable mapped to `host=/cloudsql/...`.
3. **Indexer Daemon** (`apps/indexer`):
    - Rust daemon that continuously polls the blockchain. It requires a dummy health check HTTP server internally to satisfy Serverless infrastructure constraints.
    - **Critical Flags**: Must be deployed with `--no-cpu-throttling` and `--min-instances 1`. Standard Cloud Run behavior aggressively scales to 0 and throttles CPU processing between web requests, which will kill background indexers.

---

## Continuous Deployment (CI/CD)

Sentinel utilizes **GitHub Actions** (`.github/workflows/deploy.yml`) for automated deployments to Google Cloud.

To avoid storing long-lived JSON Service Account Keys inside GitHub Secrets, the deployment pipeline utilizes **Workload Identity Federation (WIF)**.

### GitHub Authentication

The repository is natively authorized in GCP via a Workload Identity Pool and Provider (`github-provider`). The GitHub Action authenticates via its OIDC token, temporarily assuming the permissions of the `github-actions-deployer` Service Account to write to Artifact Registry and deploy to Cloud Run.

Two secrets must be configured in the GitHub Repository:

- `GCP_WORKLOAD_IDENTITY_PROVIDER`: The provider pool identity string.
- `GCP_SERVICE_ACCOUNT`: The email of the deployer Service Account in GCP.

### Triggering Deployments

The workflow executes on two isolated events:

1. `release` tags being **published**.
2. **Manual invocation** via the UI (`workflow_dispatch`).

When triggered, it will concurrently build all three `podman/docker` container images, push them to the Artifact Registry, extract the updated routing hashes automatically, and safely execute rollout updates across all three backend systems.
