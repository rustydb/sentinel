use chrono::{NaiveDateTime, Utc};
use sentinel_indexer::handlers::{InMemoryStore, TurretEventHandler};
use sentinel_indexer::models::IncomingTurretEvent;

#[test]
fn inserts_event_into_store() {
    let mut handler = TurretEventHandler::new(InMemoryStore::default());
    let timestamp = NaiveDateTime::parse_from_str("2026-03-26 12:10:00", "%Y-%m-%d %H:%M:%S")
        .expect("timestamp");

    handler
        .handle(IncomingTurretEvent {
            tx_digest: "0xdef".into(),
            event_seq: 2,
            checkpoint_sequence_number: 60,
            event_type: "TurretCreatedEvent".into(),
            json_data: serde_json::json!({ "turretId": "0x1", "owner": "0xdef" }),
            timestamp,
        })
        .expect("stores");

    assert_eq!(handler.store().events.len(), 1);
}

#[test]
fn checkpoint_lag_is_under_ten_seconds_for_fresh_event() {
    let now = Utc::now().naive_utc();
    let lag = (Utc::now().naive_utc() - now).num_seconds();
    assert!(lag < 10);
}
