CREATE TABLE IF NOT EXISTS turret_events (
  tx_digest VARCHAR NOT NULL,
  event_seq BIGINT NOT NULL,
  checkpoint_sequence_number BIGINT NOT NULL,
  event_type VARCHAR NOT NULL,
  json_data JSONB NOT NULL,
  timestamp TIMESTAMP NOT NULL,
  PRIMARY KEY (tx_digest, event_seq)
);

