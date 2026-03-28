diesel::table! {
    turret_events (tx_digest, event_seq) {
        tx_digest -> Varchar,
        event_seq -> Int8,
        checkpoint_sequence_number -> Int8,
        event_type -> Varchar,
        json_data -> Jsonb,
        timestamp -> Timestamp,
    }
}

diesel::table! {
    indexer_cursors (pipeline_name) {
        pipeline_name -> Text,
        cursor_tx_digest -> Nullable<Text>,
        cursor_event_seq -> Nullable<Int8>,
        last_checkpoint_sequence_number -> Int8,
        updated_at -> Timestamptz,
    }
}
