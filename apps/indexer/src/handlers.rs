use std::{future::Future, time::Duration};

use anyhow::Result;

use crate::models::{IncomingTurretEvent, StoredTurretEvent};

pub trait TurretEventStore {
    fn insert(&mut self, event: StoredTurretEvent) -> Result<()>;
}

#[derive(Default)]
pub struct InMemoryStore {
    pub events: Vec<StoredTurretEvent>,
}

impl TurretEventStore for InMemoryStore {
    fn insert(&mut self, event: StoredTurretEvent) -> Result<()> {
        self.events.push(event);
        Ok(())
    }
}

pub struct TurretEventHandler<S> {
    store: S,
}

impl<S> TurretEventHandler<S>
where
    S: TurretEventStore,
{
    pub fn new(store: S) -> Self {
        Self { store }
    }

    pub fn handle(&mut self, event: IncomingTurretEvent) -> Result<()> {
        self.store.insert(event.into())
    }

    pub fn store(&self) -> &S {
        &self.store
    }
}

pub async fn retry_rpc<T, F, Fut>(mut operation: F) -> Result<T>
where
    F: FnMut() -> Fut,
    Fut: Future<Output = Result<T>>,
{
    let mut delay = Duration::from_secs(1);

    for attempt in 0..5 {
        match operation().await {
            Ok(value) => return Ok(value),
            Err(error) if attempt == 4 => return Err(error),
            Err(_) => {
                tokio::time::sleep(delay).await;
                delay = delay.saturating_mul(2);
            }
        }
    }

    unreachable!("retry loop always returns")
}

#[cfg(test)]
mod tests {
    use anyhow::anyhow;
    use chrono::NaiveDateTime;

    use super::{retry_rpc, InMemoryStore, TurretEventHandler};
    use crate::models::IncomingTurretEvent;

    #[test]
    fn parses_and_stores_supported_turret_events() {
        let mut handler = TurretEventHandler::new(InMemoryStore::default());
        let timestamp = NaiveDateTime::parse_from_str("2026-03-26 12:00:00", "%Y-%m-%d %H:%M:%S")
            .expect("timestamp");
        let event = IncomingTurretEvent {
            tx_digest: "0xabc".to_string(),
            event_seq: 1,
            checkpoint_sequence_number: 50,
            event_type: "ExtensionAuthorizedEvent".to_string(),
            json_data: serde_json::json!({ "turretId": "0x1", "extension": "0x2" }),
            timestamp,
        };

        handler.handle(event).expect("stores event");

        assert_eq!(handler.store().events.len(), 1);
        assert_eq!(
            handler.store().events[0].event_type,
            "ExtensionAuthorizedEvent"
        );
    }

    #[tokio::test]
    async fn retries_rpc_with_exponential_backoff() {
        let mut attempts = 0;

        let value = retry_rpc(|| {
            attempts += 1;
            async move {
                if attempts < 3 {
                    Err(anyhow!("rate limited"))
                } else {
                    Ok(attempts)
                }
            }
        })
        .await
        .expect("eventually succeeds");

        assert_eq!(value, 3);
    }
}
