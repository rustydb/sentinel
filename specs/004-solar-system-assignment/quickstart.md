# Quickstart

## Goal

Validate the solar-system assignment workflow end to end in the local dev stack.

## 1. Refresh The Bundled Solar-System Catalog

Run the catalog refresh script from the repo root:

```bash
bun run scripts/update-solar-systems.ts
```

Expected result:

- the shared bundled catalog is updated from the configured Utopia and Stillness `/v2/solarsystems` endpoints
- the generated artifact remains committed in the repo for local search and friendly-name resolution

## 2. Start The Dev Stack

```bash
podman compose -f docker-compose-dev.yml up
```

Open:

- dashboard: `http://127.0.0.1:5174`
- api: `http://127.0.0.1:3002`

## 3. Connect Wallet And Load Assets

- connect EVE Wallet
- confirm turret cards render normally
- open the network node drawer

## 4. Assign A Solar System

- choose a network node
- use `Assign` to search by solar-system name
- confirm a result by keyboard or pointer
- verify the node card now shows the friendly solar-system name
- verify the node exposes `Reassign` and `Unassign`

## 5. Verify Turret And Map Behavior

- confirm turrets using that node now show the same friendly solar-system name on the card and in the detail pane
- with no turret selected, confirm the map highlights all assigned solar systems
- select one turret and confirm the map focuses that single solar system without reloading the iframe
- deselect the turret and confirm the map returns to the all-assigned-systems highlight state

## 6. Verify Orphaned Retention

- simulate or load an orphaned turret with a previously retained mapping
- confirm the turret still shows its friendly solar-system name
- confirm the network node drawer can still be empty if no current network nodes remain
- confirm selecting the orphaned turret still focuses the retained solar system

## 7. Validation Commands

```bash
bun lint
bunx vitest run --environment jsdom
```

Add focused Playwright coverage for:

- network node drawer open/close
- solar-system autocomplete assignment
- map highlight vs focus behavior
