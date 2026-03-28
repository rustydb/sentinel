# ADR 002: Poll Sui Events via MoveEventModule and Persist Cursors

- Status: Accepted
- Date: 2026-03-27

## Context

Frontier Sentinel's indexer started as a placeholder loop that emitted one mock event and kept its progress only in memory.

That was enough to bootstrap the service shell, but it was not enough to satisfy the actual ingestion requirements:

1. The real turret events are `TurretCreatedEvent`, `PriorityListUpdatedEvent`, and `ExtensionAuthorizedEvent`.
2. The Sui `suix_queryEvents` API paginates by `EventID` cursor (`txDigest` + `eventSeq`), not by checkpoint number.
3. The existing `turret_events` table stores `checkpoint_sequence_number`, so the indexer still needs checkpoint data for lag tracking and downstream reads.
4. The deployed turret package ID is environment-specific, so the indexer cannot safely hardcode it.

## Decision

Frontier Sentinel will poll Sui events with a `MoveEventModule` filter and persist its RPC cursor in PostgreSQL.

Specifically:

- The indexer queries `suix_queryEvents` against `SUI_TURRET_PACKAGE_ID::turret`.
- Supported turret events are filtered explicitly by event name after fetch.
- The indexer persists its last processed RPC cursor in the `indexer_cursors` table.
- The indexer looks up each matching transaction's checkpoint through `sui_getTransactionBlock` so `turret_events.checkpoint_sequence_number` remains populated.
- If `SUI_TURRET_PACKAGE_ID` is not configured, the service stays alive and idle instead of crashing.

## Consequences

### Positive

- The indexer can resume from the last processed event page after a restart.
- Event ingestion matches the real Sui RPC contract instead of a mock loop.
- Checkpoint lag remains observable even though the query API itself paginates by event cursor.
- The service is safe to run in shared environments before the final turret package ID is wired in.

### Negative

- The indexer now depends on two RPC reads: event pages and transaction lookups for checkpoint metadata.
- Package ID configuration is mandatory for real ingestion.
- Cursor state adds another database table that must stay in sync with the runtime contract.

## Notes

- `MoveEventModule` is used instead of `MoveModule` because the turret event structs are defined in the `turret` module.
- Current package IDs:
    - `Utopia` (current sandbox default): `0xd12a70c74c1e759445d6f209b01d43d860e97fcf2ef72ccbbd00afd828043f75`
    - `Stillness` (planned later switch): `0x28b497559d65ab320d9da4613bf2498d5946b2c0ae3597ccfda3072ce127448c`
- Runtime configuration:
    - `SUI_TURRET_PACKAGE_ID`
    - `SUI_TURRET_EVENT_MODULE` (defaults to `turret`)
    - `SUI_RPC_URL`
