# Quickstart

## Goal

Validate the EVE Frontier theme overhaul, statistics panel, and recent target-intelligence flow across both live and demo routes.

## Prerequisites

1. Start the local stack:

    ```bash
    podman compose -f docker-compose-dev.yml up
    ```

2. Confirm the dashboard is available at `http://127.0.0.1:5174`.

## Review Flow

### 1. Check the live unconnected shell

1. Open `http://127.0.0.1:5174`.
2. Verify the wallet-connect shell uses the new logo, darker palette, and documented theme language.
3. Confirm the fallback wallet/install messaging still reads clearly under the new theme.

### 2. Check the demo route for full shell coverage

1. Open `http://127.0.0.1:5174/demo`.
2. Verify the header, cards, map frame, drawer, and detail panel share the same branded theme language.
3. Confirm the statistics panel is present and populated from demo fixtures.

### 3. Check turret intelligence on cards

1. Verify turret cards show the compact target label (`NPC` or resolved character name).
2. Confirm at least one demo fixture renders `ENGAGED` in the red engaged-state treatment.
3. Confirm each card displays the 24-hour aggressor count.

### 4. Check turret intelligence in the detail panel

1. Open a turret detail panel.
2. Verify the latest `PriorityListUpdatedEvent` is selected by default when available.
3. Confirm the detail panel shows target identity, tribe name when available, and aggressor state.

### 5. Check live/demo parity

1. Compare `http://127.0.0.1:5174` and `http://127.0.0.1:5174/demo`.
2. Confirm logo treatment, shell palette, spacing language, and fallback surfaces do not drift.

## Validation Commands

```bash
bun lint
bunx vitest run --environment jsdom
```

Use focused test runs while iterating, then broaden back to the default dashboard validation set before closing the feature.
