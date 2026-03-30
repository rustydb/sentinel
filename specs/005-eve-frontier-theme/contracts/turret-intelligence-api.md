# Contract: Turret Intelligence Summary API

## Purpose

Define the dashboard-facing API contract for shell statistics and per-turret intelligence derived from the latest `PriorityListUpdatedEvent` plus recent aggressor activity from the indexer database.

## Endpoint

### `GET /api/turret-intelligence`

Returns intelligence summaries for the requested turrets.

**Query**

- `ids`: comma-separated turret IDs

**Response**

```json
{
    "data": [
        {
            "turretId": "0x...",
            "latestPriorityEvent": {
                "txDigest": "ABC123",
                "eventSeq": 7,
                "checkpointSequenceNumber": 987654,
                "timestamp": "2026-03-29T18:00:00.000Z"
            },
            "targetItemId": "1000000004321",
            "targetCharacterId": 41123,
            "targetDisplayName": "Captain Rusty",
            "isNpc": false,
            "tribeId": 18,
            "tribeName": "Vherokior",
            "targetTypeId": "92404",
            "isAggressor": true,
            "behaviorChange": "STARTED_ATTACK",
            "statusOverride": "ENGAGED",
            "aggressorsPast24Hours": 3
        }
    ]
}
```

## Behavior Rules

- If a turret has no `PriorityListUpdatedEvent`, `latestPriorityEvent` is `null` and target-related fields are null or explicit defaults.
- If `targetCharacterId` is `0`, the response sets `isNpc` to `true` and `targetDisplayName` to `NPC`.
- `statusOverride` is `ENGAGED` only when the latest `behaviorChange` is `STARTED_ATTACK`.
- `aggressorsPast24Hours` is always returned and defaults to `0`.

## Dashboard Consumption

- Turret cards consume `targetDisplayName`, `statusOverride`, and `aggressorsPast24Hours`.
- The statistics panel derives its grand total and engaged count from the same response set used for the cards.
- The detail panel uses `latestPriorityEvent` as the default event-log selection anchor.
