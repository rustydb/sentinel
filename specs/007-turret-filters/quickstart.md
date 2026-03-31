# Quickstart

## Goal

Verify the turret filtering experience end to end in the local dashboard.

## 1. Start The Dev Stack

```bash
podman compose -f docker-compose-dev.yml up
```

Open:

- dashboard: `http://127.0.0.1:5174`
- api: `http://127.0.0.1:3002`

## 2. Load Representative Turrets

- connect EVE Wallet
- wait for the turret list to render
- confirm the dashboard shows a mix of statuses, classes, and network-node states

## 3. Exercise The Filters

- filter by solar system and confirm only the matching turrets remain visible
- filter by a full turret ID and confirm only the matching turret remains visible
- filter by turret name and confirm the matching turret remains visible
- filter by known network node, status, and class to confirm each facet narrows the list

## 4. Verify Combined And Empty States

- apply at least two filters together and confirm the result set is the intersection of those filters
- clear one filter and confirm the remaining filters still apply
- clear all filters and confirm the full turret list returns
- apply a filter set that yields no matches and confirm the friendly empty-state suggestion appears

## 5. Verify Selection Behavior

- select a turret
- apply filters that keep it visible and confirm the selected context remains intact
- apply filters that hide it and confirm the dashboard leaves the selection state explicit rather than guessing

## 6. Validation Commands

```bash
bun lint
bunx vitest run --environment jsdom
```

Add focused interaction coverage for:

- turret filter bar state changes
- combined-filter empty states
- selected turret visibility after filtering
