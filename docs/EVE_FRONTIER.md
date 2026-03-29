---
title: Frontier Sentinel - EVE Frontier
version: 1.1.0
status: draft
created: 2026-03-27
updated: 2026-03-28
author: rustydb
description: Descriptions of the EVE Frontier game relevant for Frontier Sentinel
---

## APIs

Every EVE world has an API.

| World     | URL                                                    |
| --------- | ------------------------------------------------------ |
| Stillness | https://world-api-stillness.live.tech.evefrontier.com/ |
| Utopia    | https://world-api-utopia.uat.pub.evefrontier.com/      |

Agents can learn the API through the `doc.json` file located at `/docs/doc.json` on either API URL.

### Solar systems

Solar systems should be treated as a friendly-name and numeric-ID pair:

- `name` is what operators search for and what the dashboard displays
- `id` is what `ef-map` needs for dynamic highlight and focus messaging

For Frontier Sentinel, solar-system data is bundled locally and refreshed with `scripts/update-solar-systems.ts` rather than fetched on every search interaction.

## Game items (types)

### Iconography

Types in EVE Frontier may have icons associated with them. These icons may be pulled by querying the type API with that type's ID.

For example: `https://world-api-utopia.uat.pub.evefrontier.com/v2/types/${typeId}` would return an icon for that typeId or null on Utopia. Stillness currently serves the equivalent type data from `https://world-api-stillness.live.tech.evefrontier.com/v2/types/${typeId}`.

If any object in EVE is pulled by Frontier Security, its icon should also be fetched when an appropriate context for presenting information to the user.

### Display names

Names of smart assemblies can vary based on whether the owner has named it, or if there are variations of the assembly.

When presenting assemblies, always name them with the following precedence:

1. `.metadata.name` if not blank
1. `typeInfo.name` resolved by getting the type information from the types API

If `.metadata.name` is available, then `typeInfo.name` should be displayed near by using less emphasized text.

## Turrets

The Turret is a programmable defense structure in the EVE Frontier world. It is a Sui shared object anchored to a Network Node, projecting offensive or defensive power over a fixed location based on builder-defined targeting rules.

The Turret is defined by [turret.move](https://github.com/evefrontier/world-contracts/blob/main/contracts/world/sources/assemblies/turret.move) from the EVE Frontier world-contracts repository. The definition changes constantly, the upstream `turret.move` file should be referred to for latest.

The information contained in this file is for quick reference, but the upstream `turret.move` file should be the source of truth.

### Location presentation

When Frontier Sentinel presents a turret location:

1. use the network-node solar-system assignment if the current node is assigned
2. if the turret is orphaned, fall back to the retained last-known solar-system mapping when available
3. otherwise show `Unassigned`

Do not display `location.location_hash` as the human-readable solar-system label.

### Naming

Turrets, like other smart assemblies in EVE Frontier, can be named by their users. By default, a turret's name is a blank string.

The turret is available as the following types:

| Name         |
| ------------ |
| Mini Turret  |
| Turret       |
| Heavy Turret |

All turrets can be found by querying the world-specific `/v2/types` endpoint for their `type_id` returned from their onchain node.

### Data Structures

#### `Turret`

The core shared object representing the turret assembly.

| Field              | Type               | Description                                                               |
| ------------------ | ------------------ | ------------------------------------------------------------------------- |
| `id`               | `UID`              | Unique Sui object identifier.                                             |
| `key`              | `TenantItemId`     | Composite key derived from the in-game item ID and tenant.                |
| `owner_cap_id`     | `ID`               | ID of the `OwnerCap<Turret>` transferred to the owner's character.        |
| `type_id`          | `u64`              | The turret's type identifier (determines energy cost and specialization). |
| `status`           | `AssemblyStatus`   | Tracks whether the turret is anchored, online, offline, or unanchored.    |
| `location`         | `Location`         | The spatial coordinates of the turret (hashed).                           |
| `energy_source_id` | `Option<ID>`       | The ID of the connected Network Node (empty when orphaned).               |
| `metadata`         | `Option<Metadata>` | Optional metadata attached to the turret.                                 |
| `extension`        | `Option<TypeName>` | The registered extension's type name, if any.                             |

Example data:

```grpc
query GetObjectsByType($object_type: String, $first: Int) {
  objects(filter: {type: $object_type}, first: $first) {
    nodes {
      address
      version
      asMoveObject {
        contents {
          json
          type {
            repr
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

```json
{
    "address": "0x06c29785207a87fba7795b940686efa9c5df0a67115ac0df258bb46c6529f37b",
    "version": 809661257,
    "asMoveObject": {
        "contents": {
            "json": {
                "id": "0x06c29785207a87fba7795b940686efa9c5df0a67115ac0df258bb46c6529f37b",
                "key": {
                    "item_id": "1000000018041",
                    "tenant": "utopia"
                },
                "owner_cap_id": "0x504269415240b5ccde971ed2e58c8d6943f4c1f88943efa2656409273ffd1e0f",
                "type_id": "92404",
                "status": {
                    "status": {
                        "@variant": "OFFLINE"
                    }
                },
                "location": {
                    "location_hash": "yNaAVIxZS+xVpaEP7PSK+6DSPDQxcEfuIgbL6t/E14E="
                },
                "energy_source_id": "0xff82ba784a32c29a568346902a301b3323799890ece2146f4bb6be33d76be62f",
                "metadata": {
                    "assembly_id": "0x06c29785207a87fba7795b940686efa9c5df0a67115ac0df258bb46c6529f37b",
                    "name": "",
                    "description": "",
                    "url": ""
                },
                "extension": null
            },
            "type": {
                "repr": "0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75::turret::Turret"
            }
        }
    }
}
```

#### `TargetCandidate`

Represents a potential target in the turret's proximity. Serialized via BCS for on-chain priority list management. Each candidate carries exactly one `behaviour_change` reason per game invocation.

| Field              | Type                    | Description                                                     |
| ------------------ | ----------------------- | --------------------------------------------------------------- |
| `item_id`          | `u64`                   | In-game item ID of the target.                                  |
| `type_id`          | `u64`                   | Type identifier of the target (ship or NPC).                    |
| `group_id`         | `u64`                   | Group ID for ship classification (0 for NPCs); see table below. |
| `character_id`     | `u32`                   | Pilot's character ID (0 for NPCs).                              |
| `character_tribe`  | `u32`                   | Tribe ID of the target's pilot.                                 |
| `hp_ratio`         | `u64`                   | Percentage of structure HP remaining (0–100).                   |
| `shield_ratio`     | `u64`                   | Percentage of shield HP remaining (0–100).                      |
| `armor_ratio`      | `u64`                   | Percentage of armor HP remaining (0–100).                       |
| `is_aggressor`     | `bool`                  | `true` if the target is attacking anything on-grid.             |
| `priority_weight`  | `u64`                   | Priority weight for queue ordering.                             |
| `behaviour_change` | `BehaviourChangeReason` | The single most relevant behaviour change for this candidate.   |

#### `BehaviourChangeReason` (Enum)

Describes the single most relevant behavioural change for a `TargetCandidate`. The game sends exactly one reason per candidate; if both `ENTERED` and `STARTED_ATTACK` apply, the game sends `STARTED_ATTACK` (higher priority).

| Variant          | Description                                 |
| ---------------- | ------------------------------------------- |
| `UNSPECIFIED`    | No specific change (default).               |
| `ENTERED`        | Target entered the proximity of the turret. |
| `STARTED_ATTACK` | Target started attacking the base.          |
| `STOPPED_ATTACK` | Target stopped attacking the base.          |

#### `ReturnTargetPriorityList`

The return value from `get_target_priority_list`. Each entry maps a target to its computed priority weight. The game shoots the target with the highest `priority_weight`; ties are broken by list order.

| Field             | Type  | Description                               |
| ----------------- | ----- | ----------------------------------------- |
| `target_item_id`  | `u64` | The in-game item ID of the target.        |
| `priority_weight` | `u64` | Computed priority weight for this target. |

### Events

| Event                      | Fields                                                                                | Emitted When                              |
| -------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------- |
| `TurretCreatedEvent`       | `turret_id`, `turret_key`, `owner_cap_id`, `type_id`                                  | A new turret is anchored.                 |
| `PriorityListUpdatedEvent` | `turret_id`, `priority_list`                                                          | The targeting priority list changes.      |
| `ExtensionAuthorizedEvent` | `assembly_id`, `assembly_key`, `extension_type`, `previous_extension`, `owner_cap_id` | An extension is authorized (or replaced). |
| `ExtensionRevokedEvent `   | `assembly_id`, `assembly_key`, `revoked_extension`, `owner_cap_id`                    | An extension is revoked.                  |
