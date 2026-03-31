# Quickstart

## Goal

Validate that the live dashboard picks up turret and network-node updates automatically while the operator stays on the same page.
The live shell uses visibility-aware polling and fresh GET reads, while `/demo` stays fixture-driven.

## Prerequisites

1. Start the local stack:

    ```bash
    podman compose -f docker-compose-dev.yml up
    ```

2. Confirm the dashboard is available at `http://127.0.0.1:5174`.

## Review Flow

### 1. Open the live dashboard

1. Open `http://127.0.0.1:5174`.
2. Confirm the shell loads normally and turrets/nodes render without manual refresh.

### 2. Change a network-node assignment

1. Use the node drawer or the API to update a network-node solar-system assignment.
2. Keep the dashboard open and wait one refresh cycle.
3. Confirm the network node card, turret solar-system label, and metrics reflect the updated state without reloading the page.

### 3. Change turret-derived state

1. Update a turret's indexed state so its status, event context, or intelligence summary changes.
2. Keep the turret list visible while the update lands.
3. Confirm the turret card and detail panel hot-load the newest state and preserve the current selection if the turret still exists.

### 4. Validate context preservation

1. Select a turret and leave the detail panel open.
2. Trigger an unrelated turret or node update.
3. Confirm the selected turret remains coherent and the drawer/detail state does not reset unnecessarily.
4. If the selected turret remains in the indexed data, confirm the detail panel keeps following the same turret ID even when its refreshed snapshot changes.

### 5. Review event-log interactions

1. Open the selected turret's event log.
2. Expand a row and confirm the payload opens like a blind with pretty-printed JSON.
3. Select another row or collapse the current row and confirm the previous blind closes smoothly.
4. Toggle the event timestamp mode between local time and UTC and confirm the table updates accordingly.

### 6. Check demo parity boundaries

1. Open `http://127.0.0.1:5174/demo`.
2. Confirm the demo route remains fixture-driven and does not depend on live polling to stay usable.

## Validation Commands

```bash
bun lint
bun run test:dashboard
bun run test:api
```

Use focused Vitest runs while iterating on specific hooks or components, then broaden back to the dashboard/API test suites before closing the feature.
