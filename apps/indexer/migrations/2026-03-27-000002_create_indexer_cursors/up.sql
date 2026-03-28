CREATE TABLE IF NOT EXISTS indexer_cursors (
  pipeline_name TEXT PRIMARY KEY,
  cursor_tx_digest TEXT,
  cursor_event_seq BIGINT,
  last_checkpoint_sequence_number BIGINT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
