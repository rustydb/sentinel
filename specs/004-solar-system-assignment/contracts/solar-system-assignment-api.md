# Contract: Solar System Assignment API

## Purpose

Define the dashboard-facing contract for persisting network-node assignments and reading retained turret solar-system mappings from the existing API/database layer.

## Existing Endpoint To Extend

### `GET /api/network-nodes`

Returns the persisted network-node assignment records.

**Response**

```json
{
    "data": [
        {
            "nodeId": "0x...",
            "solarSystemId": 31002477
        }
    ]
}
```

### `POST /api/network-nodes/:nodeId/solar-system`

Creates or replaces a network-node assignment.

**Request**

```json
{
    "solarSystemId": 31002477
}
```

**Response**

```json
{
    "data": {
        "nodeId": "0x...",
        "solarSystemId": 31002477
    }
}
```

### `DELETE /api/network-nodes/:nodeId/solar-system`

Removes the persisted assignment for a network node.

## New Endpoint

### `GET /api/turret-solar-systems`

Returns retained solar-system mappings for the requested turret IDs.

**Query**

- `ids`: comma-separated turret IDs

**Response**

```json
{
    "data": [
        {
            "turretId": "0x...",
            "solarSystemId": 31002477
        }
    ]
}
```

## New Sync Endpoint

### `POST /api/turret-solar-systems/sync`

Materializes retained turret mappings from currently known turret-to-node relationships.

**Request**

```json
{
    "turrets": [
        {
            "turretId": "0x...",
            "nodeId": "0x..."
        }
    ]
}
```

**Behavior**

- For each turret whose `nodeId` currently has a persisted network-node mapping, store or refresh that turret’s retained `solarSystemId`.
- Turrets without an active node mapping are ignored by sync and continue to rely on the last retained value, if any.

**Response**

```json
{
    "data": {
        "updated": 3
    }
}
```
