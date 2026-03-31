# Quickstart Guide

## Goal

Verify that all user-visible Sui addresses in the dashboard remain responsive to container width and preserve full-address access.

## Prerequisites

- Bun installed
- Workspace dependencies installed with `bun install`
- Dev dashboard available via `bun run --filter @sentinel/dashboard dev` or `podman compose -f docker-compose-dev.yml up`

## Verification Steps

1. Start the dashboard in demo mode or with a live wallet-enabled browser.
2. Open the dashboard and identify the wallet summary plus at least one turret detail view with Sui addresses.
3. Narrow the browser width and confirm that each visible address remains contained inside its card, header, or drawer without creating horizontal overflow.
4. Expand the browser again and confirm the address presentation adapts back to the available space.
5. Use each address copy interaction and verify that the visible control uses the EVE Frontier copy glyph before click, switches to success feedback after click, shows a tooltip reading `Copied to clipboard`, and copies the full Sui address rather than the shortened display text.

## Automated Checks

Run the dashboard lint and unit tests:

```bash
bun lint
bun run --filter @sentinel/dashboard test
```

Run browser coverage if address resize behavior is captured in E2E tests:

```bash
bun run --filter @sentinel/dashboard test:e2e
```
