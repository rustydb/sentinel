use chrono::NaiveDateTime;
use diesel::{Insertable, Queryable};
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::schema::turret_events;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable, PartialEq)]
#[diesel(table_name = turret_events)]
pub struct StoredTurretEvent {
    pub tx_digest: String,
    pub event_seq: i64,
    pub checkpoint_sequence_number: i64,
    pub event_type: String,
    pub json_data: Value,
    pub timestamp: NaiveDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct IncomingTurretEvent {
    pub tx_digest: String,
    pub event_seq: i64,
    pub checkpoint_sequence_number: i64,
    pub event_type: String,
    pub json_data: Value,
    pub timestamp: NaiveDateTime,
}

impl From<IncomingTurretEvent> for StoredTurretEvent {
    fn from(event: IncomingTurretEvent) -> Self {
        Self {
            tx_digest: event.tx_digest,
            event_seq: event.event_seq,
            checkpoint_sequence_number: event.checkpoint_sequence_number,
            event_type: event.event_type,
            json_data: event.json_data,
            timestamp: event.timestamp,
        }
    }
}
