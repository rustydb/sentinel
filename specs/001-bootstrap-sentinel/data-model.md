# Data Model

## `TurretData` (Frontend representation)

- `id`: string (Sui object address)
- `itemId`: string (In-game item ID)
- `name`: string (optional, Assembly name)
- `status`: enum ("online", "anchored", "unanchored", "destroyed", "offline")
- `locationHash`: string (optional, Hashed location)
- `isOnline`: boolean (Derived from status)
- `typeId`: string (Raw type_id from on-chain object)
- `energySourceId`: string (Connected network node ID, "orphaned" if none)
- `extension`: string (optional, Registered extension type name)

## `TurretEvent` (Database/Indexer mapping)

Table: `turret_events`

- `tx_digest`: VARCHAR (Primary Key part 1)
- `event_seq`: BIGINT (Primary Key part 2)
- `checkpoint_sequence_number`: BIGINT
- `event_type`: VARCHAR
- `json_data`: JSONB
- `timestamp`: TIMESTAMP

## `NetworkNodeMapping` (Database)

Table: `network_node_systems`

- `node_id`: TEXT (Primary Key)
- `solar_system_id`: INTEGER

## `IndexerCursor` (Database)

Table: `indexer_cursors`

- `pipeline_name`: TEXT (Primary Key)
- `cursor_tx_digest`: TEXT (nullable)
- `cursor_event_seq`: BIGINT (nullable)
- `last_checkpoint_sequence_number`: BIGINT
- `updated_at`: TIMESTAMPTZ
