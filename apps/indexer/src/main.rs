use std::{collections::HashMap, env};

use anyhow::{anyhow, Context, Result};
use chrono::{DateTime, NaiveDateTime, Utc};
use frontier_sentinel_indexer::handlers::retry_rpc;
use frontier_sentinel_indexer::models::IncomingTurretEvent;
use reqwest::Client as HttpClient;
use serde::de::DeserializeOwned;
use serde::Deserialize;
use serde_json::{json, Value};
use tokio::time::{interval, Duration};
use tokio_postgres::{Client as PgClient, NoTls};

const INDEXER_PIPELINE: &str = "turret_events";
const DEFAULT_POLL_INTERVAL_MS: u64 = 5_000;
const DEFAULT_PAGE_SIZE: u64 = 50;
const DEFAULT_MAX_PAGES_PER_POLL: usize = 10;
const DEFAULT_EVENT_MODULE: &str = "turret";
const SUPPORTED_TURRET_EVENTS: [&str; 3] = [
    "TurretCreatedEvent",
    "PriorityListUpdatedEvent",
    "ExtensionAuthorizedEvent",
];

#[derive(Debug, Clone)]
struct IndexerConfig {
    database_url: String,
    sui_rpc_url: String,
    turret_package_id: Option<String>,
    turret_event_module: String,
    poll_interval: Duration,
    page_size: u64,
    max_pages_per_poll: usize,
}

impl IndexerConfig {
    fn from_env() -> Result<Self> {
        let database_url = env::var("DATABASE_URL").context("DATABASE_URL is required")?;
        let sui_rpc_url = env::var("SUI_RPC_URL")
            .unwrap_or_else(|_| "https://fullnode.testnet.sui.io:443".to_string());
        let turret_package_id = env::var("SUI_TURRET_PACKAGE_ID")
            .ok()
            .map(|value| value.trim().to_string())
            .filter(|value| !value.is_empty())
            .map(normalize_object_id);
        let turret_event_module = env::var("SUI_TURRET_EVENT_MODULE")
            .unwrap_or_else(|_| DEFAULT_EVENT_MODULE.to_string());

        Ok(Self {
            database_url,
            sui_rpc_url,
            turret_package_id,
            turret_event_module,
            poll_interval: Duration::from_millis(parse_positive_u64(
                "INDEXER_POLL_INTERVAL_MS",
                DEFAULT_POLL_INTERVAL_MS,
            )),
            page_size: parse_positive_u64("INDEXER_PAGE_SIZE", DEFAULT_PAGE_SIZE),
            max_pages_per_poll: parse_positive_u64(
                "INDEXER_MAX_PAGES_PER_POLL",
                DEFAULT_MAX_PAGES_PER_POLL as u64,
            ) as usize,
        })
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Default)]
struct CursorState {
    cursor: Option<EventCursor>,
    last_checkpoint_sequence_number: i64,
}

#[derive(Debug, Clone, PartialEq, Eq)]
struct EventCursor {
    tx_digest: String,
    event_seq: i64,
}

#[derive(Debug, Clone)]
struct TransactionContextData {
    checkpoint_sequence_number: i64,
    timestamp: NaiveDateTime,
}

#[derive(Debug)]
struct PollSummary {
    fetched: usize,
    indexed: usize,
    pages: usize,
}

#[derive(Debug)]
struct PageOutcome {
    fetched: usize,
    indexed: usize,
    has_next_page: bool,
    next_state: CursorState,
}

struct Database {
    client: PgClient,
}

impl Database {
    async fn connect(database_url: &str) -> Result<Self> {
        let (client, connection) = tokio_postgres::connect(database_url, NoTls).await?;
        tokio::spawn(async move {
            if let Err(error) = connection.await {
                eprintln!("postgres connection error: {error}");
            }
        });

        let database = Self { client };
        database.ensure_schema().await?;
        Ok(database)
    }

    async fn ensure_schema(&self) -> Result<()> {
        self.client
            .batch_execute(
                r#"
                CREATE TABLE IF NOT EXISTS turret_events (
                  tx_digest VARCHAR NOT NULL,
                  event_seq BIGINT NOT NULL,
                  checkpoint_sequence_number BIGINT NOT NULL,
                  event_type VARCHAR NOT NULL,
                  json_data JSONB NOT NULL,
                  timestamp TIMESTAMP NOT NULL,
                  PRIMARY KEY (tx_digest, event_seq)
                );

                CREATE TABLE IF NOT EXISTS indexer_cursors (
                  pipeline_name TEXT PRIMARY KEY,
                  cursor_tx_digest TEXT,
                  cursor_event_seq BIGINT,
                  last_checkpoint_sequence_number BIGINT NOT NULL DEFAULT 0,
                  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                );
                "#,
            )
            .await?;

        Ok(())
    }

    async fn load_state(&self, pipeline_name: &str) -> Result<CursorState> {
        let row = self
            .client
            .query_opt(
                r#"
                SELECT cursor_tx_digest, cursor_event_seq, last_checkpoint_sequence_number
                FROM indexer_cursors
                WHERE pipeline_name = $1
                "#,
                &[&pipeline_name],
            )
            .await?;

        let Some(row) = row else {
            return Ok(CursorState::default());
        };

        let cursor_tx_digest: Option<String> = row.get(0);
        let cursor_event_seq: Option<i64> = row.get(1);
        let last_checkpoint_sequence_number: i64 = row.get(2);

        let cursor = match (cursor_tx_digest, cursor_event_seq) {
            (Some(tx_digest), Some(event_seq)) => Some(EventCursor {
                tx_digest,
                event_seq,
            }),
            _ => None,
        };

        Ok(CursorState {
            cursor,
            last_checkpoint_sequence_number,
        })
    }

    async fn save_state(&self, pipeline_name: &str, state: &CursorState) -> Result<()> {
        let cursor_tx_digest = state
            .cursor
            .as_ref()
            .map(|cursor| cursor.tx_digest.as_str());
        let cursor_event_seq = state.cursor.as_ref().map(|cursor| cursor.event_seq);

        self.client
            .execute(
                r#"
                INSERT INTO indexer_cursors (
                  pipeline_name,
                  cursor_tx_digest,
                  cursor_event_seq,
                  last_checkpoint_sequence_number,
                  updated_at
                )
                VALUES ($1, $2, $3, $4, NOW())
                ON CONFLICT (pipeline_name)
                DO UPDATE SET
                  cursor_tx_digest = EXCLUDED.cursor_tx_digest,
                  cursor_event_seq = EXCLUDED.cursor_event_seq,
                  last_checkpoint_sequence_number = EXCLUDED.last_checkpoint_sequence_number,
                  updated_at = NOW()
                "#,
                &[
                    &pipeline_name,
                    &cursor_tx_digest,
                    &cursor_event_seq,
                    &state.last_checkpoint_sequence_number,
                ],
            )
            .await?;

        Ok(())
    }

    async fn insert_event(&self, event: &IncomingTurretEvent) -> Result<()> {
        self.client
            .execute(
                r#"
                INSERT INTO turret_events (
                  tx_digest,
                  event_seq,
                  checkpoint_sequence_number,
                  event_type,
                  json_data,
                  timestamp
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (tx_digest, event_seq) DO NOTHING
                "#,
                &[
                    &event.tx_digest,
                    &event.event_seq,
                    &event.checkpoint_sequence_number,
                    &event.event_type,
                    &event.json_data,
                    &event.timestamp,
                ],
            )
            .await?;

        Ok(())
    }
}

#[derive(Debug, Clone)]
struct SuiRpcClient {
    http: HttpClient,
    url: String,
}

impl SuiRpcClient {
    fn new(url: String) -> Self {
        Self {
            http: HttpClient::new(),
            url,
        }
    }

    async fn query_events(
        &self,
        package_id: &str,
        module: &str,
        cursor: Option<&EventCursor>,
        limit: u64,
    ) -> Result<RpcEventPage> {
        let params = json!([
            move_event_module_filter(package_id, module),
            cursor_to_json(cursor),
            limit,
            false
        ]);

        retry_rpc(|| self.call("suix_queryEvents", params.clone())).await
    }

    async fn transaction_context(&self, digest: &str) -> Result<TransactionContextData> {
        let params = json!([
            digest,
            {
                "showBalanceChanges": false,
                "showEffects": false,
                "showEvents": false,
                "showInput": false,
                "showObjectChanges": false,
                "showRawEffects": false,
                "showRawInput": false
            }
        ]);

        let response: RpcTransactionBlock =
            retry_rpc(|| self.call("sui_getTransactionBlock", params.clone())).await?;
        let checkpoint_sequence_number = parse_i64(
            response
                .checkpoint
                .as_ref()
                .context("transaction response missing checkpoint")?,
        )?;
        let timestamp = match response.timestamp_ms.as_ref() {
            Some(timestamp_ms) => parse_timestamp_ms(timestamp_ms)?,
            None => Utc::now().naive_utc(),
        };

        Ok(TransactionContextData {
            checkpoint_sequence_number,
            timestamp,
        })
    }

    async fn call<T>(&self, method: &str, params: Value) -> Result<T>
    where
        T: DeserializeOwned,
    {
        let response = self
            .http
            .post(&self.url)
            .json(&json!({
                "jsonrpc": "2.0",
                "id": 1,
                "method": method,
                "params": params,
            }))
            .send()
            .await?
            .error_for_status()?;

        let envelope: RpcEnvelope<T> = response.json().await?;

        match (envelope.result, envelope.error) {
            (Some(result), None) => Ok(result),
            (_, Some(error)) => Err(anyhow!(
                "Sui RPC {} failed ({}): {}",
                method,
                error.code,
                error.message
            )),
            (None, None) => Err(anyhow!(
                "Sui RPC {} returned neither result nor error",
                method
            )),
        }
    }
}

#[derive(Debug, Deserialize)]
struct RpcEnvelope<T> {
    result: Option<T>,
    error: Option<RpcError>,
}

#[derive(Debug, Deserialize)]
struct RpcError {
    code: i64,
    message: String,
}

#[derive(Debug, Deserialize)]
struct RpcEventPage {
    data: Vec<RpcEvent>,
    #[serde(rename = "hasNextPage")]
    has_next_page: bool,
    #[serde(rename = "nextCursor")]
    next_cursor: Option<RpcEventId>,
}

#[derive(Debug, Deserialize, Clone)]
struct RpcEvent {
    id: RpcEventId,
    #[serde(rename = "type")]
    event_type: String,
    #[serde(rename = "parsedJson")]
    parsed_json: Value,
    #[serde(rename = "timestampMs")]
    timestamp_ms: Option<Value>,
}

#[derive(Debug, Deserialize, Clone)]
struct RpcEventId {
    #[serde(rename = "txDigest")]
    tx_digest: String,
    #[serde(rename = "eventSeq")]
    event_seq: Value,
}

#[derive(Debug, Deserialize)]
struct RpcTransactionBlock {
    checkpoint: Option<Value>,
    #[serde(rename = "timestampMs")]
    timestamp_ms: Option<Value>,
}

fn parse_positive_u64(name: &str, default: u64) -> u64 {
    env::var(name)
        .ok()
        .and_then(|value| value.parse::<u64>().ok())
        .filter(|value| *value > 0)
        .unwrap_or(default)
}

fn normalize_object_id(value: String) -> String {
    if value.starts_with("0x") {
        value
    } else {
        format!("0x{value}")
    }
}

fn move_event_module_filter(package_id: &str, module: &str) -> Value {
    json!({
        "MoveEventModule": {
            "package": package_id,
            "module": module,
        }
    })
}

fn cursor_to_json(cursor: Option<&EventCursor>) -> Value {
    cursor.map_or(Value::Null, |cursor| {
        json!({
            "txDigest": cursor.tx_digest,
            "eventSeq": cursor.event_seq.to_string(),
        })
    })
}

fn parse_i64(value: &Value) -> Result<i64> {
    match value {
        Value::String(raw) => raw
            .parse::<i64>()
            .with_context(|| format!("invalid integer string: {raw}")),
        Value::Number(raw) => raw
            .as_i64()
            .ok_or_else(|| anyhow!("integer is outside i64 range: {raw}")),
        _ => Err(anyhow!("expected integer value, got {value}")),
    }
}

fn parse_timestamp_ms(value: &Value) -> Result<NaiveDateTime> {
    let millis = parse_i64(value)?;
    DateTime::<Utc>::from_timestamp_millis(millis)
        .map(|timestamp| timestamp.naive_utc())
        .ok_or_else(|| anyhow!("invalid timestamp milliseconds: {millis}"))
}

fn short_event_type(event_type: &str) -> &str {
    event_type
        .split('<')
        .next()
        .unwrap_or(event_type)
        .rsplit("::")
        .next()
        .unwrap_or(event_type)
}

fn is_supported_turret_event(event_type: &str) -> bool {
    SUPPORTED_TURRET_EVENTS.contains(&short_event_type(event_type))
}

fn to_cursor(event_id: &RpcEventId) -> Result<EventCursor> {
    Ok(EventCursor {
        tx_digest: event_id.tx_digest.clone(),
        event_seq: parse_i64(&event_id.event_seq)?,
    })
}

fn cursor_from_page(page: &RpcEventPage) -> Result<Option<EventCursor>> {
    if let Some(next_cursor) = &page.next_cursor {
        return Ok(Some(to_cursor(next_cursor)?));
    }

    page.data
        .last()
        .map(|event| to_cursor(&event.id))
        .transpose()
}

fn merge_state(
    current: &CursorState,
    cursor: Option<EventCursor>,
    max_checkpoint: Option<i64>,
) -> CursorState {
    CursorState {
        cursor: cursor.or_else(|| current.cursor.clone()),
        last_checkpoint_sequence_number: max_checkpoint
            .unwrap_or(current.last_checkpoint_sequence_number)
            .max(current.last_checkpoint_sequence_number),
    }
}

fn to_incoming_event(
    event: &RpcEvent,
    tx_context: &TransactionContextData,
) -> Result<IncomingTurretEvent> {
    Ok(IncomingTurretEvent {
        tx_digest: event.id.tx_digest.clone(),
        event_seq: parse_i64(&event.id.event_seq)?,
        checkpoint_sequence_number: tx_context.checkpoint_sequence_number,
        event_type: event.event_type.clone(),
        json_data: event.parsed_json.clone(),
        timestamp: match event.timestamp_ms.as_ref() {
            Some(timestamp_ms) => parse_timestamp_ms(timestamp_ms)?,
            None => tx_context.timestamp,
        },
    })
}

async fn process_page(
    rpc: &SuiRpcClient,
    database: &Database,
    config: &IndexerConfig,
    state: &CursorState,
) -> Result<PageOutcome> {
    let Some(package_id) = config.turret_package_id.as_deref() else {
        return Ok(PageOutcome {
            fetched: 0,
            indexed: 0,
            has_next_page: false,
            next_state: state.clone(),
        });
    };

    let page = rpc
        .query_events(
            package_id,
            &config.turret_event_module,
            state.cursor.as_ref(),
            config.page_size,
        )
        .await?;
    let next_cursor = cursor_from_page(&page)?;
    let mut tx_context_cache: HashMap<String, TransactionContextData> = HashMap::new();
    let mut indexed = 0_usize;
    let mut max_checkpoint = None;

    for event in &page.data {
        if !is_supported_turret_event(&event.event_type) {
            continue;
        }

        let tx_context = match tx_context_cache.get(&event.id.tx_digest) {
            Some(tx_context) => tx_context.clone(),
            None => {
                let tx_context = rpc.transaction_context(&event.id.tx_digest).await?;
                tx_context_cache.insert(event.id.tx_digest.clone(), tx_context.clone());
                tx_context
            }
        };

        let incoming = to_incoming_event(event, &tx_context)?;
        database.insert_event(&incoming).await?;
        indexed += 1;
        max_checkpoint = Some(
            max_checkpoint
                .unwrap_or(tx_context.checkpoint_sequence_number)
                .max(tx_context.checkpoint_sequence_number),
        );
    }

    let next_state = merge_state(state, next_cursor, max_checkpoint);
    database.save_state(INDEXER_PIPELINE, &next_state).await?;

    Ok(PageOutcome {
        fetched: page.data.len(),
        indexed,
        has_next_page: page.has_next_page,
        next_state,
    })
}

async fn poll_until_caught_up(
    rpc: &SuiRpcClient,
    database: &Database,
    config: &IndexerConfig,
    state: &mut CursorState,
) -> Result<PollSummary> {
    let mut summary = PollSummary {
        fetched: 0,
        indexed: 0,
        pages: 0,
    };

    for _ in 0..config.max_pages_per_poll {
        let outcome = process_page(rpc, database, config, state).await?;
        *state = outcome.next_state;
        summary.fetched += outcome.fetched;
        summary.indexed += outcome.indexed;
        summary.pages += 1;

        if outcome.fetched == 0 || !outcome.has_next_page {
            break;
        }
    }

    Ok(summary)
}

#[tokio::main]
async fn main() -> Result<()> {
    let config = IndexerConfig::from_env()?;
    let database = Database::connect(&config.database_url).await?;
    let rpc = SuiRpcClient::new(config.sui_rpc_url.clone());
    let mut state = database.load_state(INDEXER_PIPELINE).await?;
    let mut ticker = interval(config.poll_interval);

    println!(
        "indexer starting with poll interval {:?}, event page size {}, module {}",
        config.poll_interval, config.page_size, config.turret_event_module
    );

    if config.turret_package_id.is_none() {
        println!("SUI_TURRET_PACKAGE_ID is not configured; indexer will stay idle until it is set");
    }

    loop {
        ticker.tick().await;

        let summary = poll_until_caught_up(&rpc, &database, &config, &mut state).await?;
        if summary.indexed > 0 {
            println!(
                "indexed {} turret event(s) across {} page(s); last checkpoint {}",
                summary.indexed, summary.pages, state.last_checkpoint_sequence_number
            );
        } else if summary.fetched > 0 {
            println!(
                "fetched {} event(s) with no supported turret matches across {} page(s); last checkpoint {}",
                summary.fetched, summary.pages, state.last_checkpoint_sequence_number
            );
        } else {
            println!(
                "no new events; last checkpoint {}",
                state.last_checkpoint_sequence_number
            );
        }
    }
}

#[cfg(test)]
mod tests {
    use serde_json::json;
    use tokio::time::Duration;

    use super::{
        cursor_from_page, is_supported_turret_event, merge_state, move_event_module_filter,
        parse_positive_u64, short_event_type, CursorState, EventCursor, RpcEvent, RpcEventId,
        RpcEventPage, DEFAULT_POLL_INTERVAL_MS,
    };

    #[test]
    fn accepts_supported_turret_event_tags() {
        assert!(is_supported_turret_event("TurretCreatedEvent"));
        assert!(is_supported_turret_event(
            "0xabc::events::PriorityListUpdatedEvent"
        ));
        assert!(is_supported_turret_event(
            "0xabc::events::ExtensionAuthorizedEvent"
        ));
    }

    #[test]
    fn rejects_unsupported_turret_event_tags() {
        assert!(!is_supported_turret_event("CharacterRenamed"));
        assert!(!is_supported_turret_event(
            "0xabc::events::TurretStatusChanged"
        ));
    }

    #[test]
    fn strips_module_prefix_from_event_type() {
        assert_eq!(
            short_event_type("0xabc::events::TurretCreatedEvent"),
            "TurretCreatedEvent"
        );
    }

    #[test]
    fn move_event_filter_targets_definition_module() {
        assert_eq!(
            move_event_module_filter("0x42", "turret"),
            json!({
                "MoveEventModule": {
                    "package": "0x42",
                    "module": "turret",
                }
            })
        );
    }

    #[test]
    fn cursor_from_page_prefers_next_cursor() {
        let page = RpcEventPage {
            data: vec![rpc_event("aaa", "0", "TurretCreatedEvent")],
            has_next_page: true,
            next_cursor: Some(RpcEventId {
                tx_digest: "bbb".into(),
                event_seq: json!("7"),
            }),
        };

        assert_eq!(
            cursor_from_page(&page).expect("cursor"),
            Some(EventCursor {
                tx_digest: "bbb".into(),
                event_seq: 7,
            })
        );
    }

    #[test]
    fn cursor_from_page_falls_back_to_last_event() {
        let page = RpcEventPage {
            data: vec![
                rpc_event("aaa", "0", "TurretCreatedEvent"),
                rpc_event("bbb", "3", "PriorityListUpdatedEvent"),
            ],
            has_next_page: false,
            next_cursor: None,
        };

        assert_eq!(
            cursor_from_page(&page).expect("cursor"),
            Some(EventCursor {
                tx_digest: "bbb".into(),
                event_seq: 3,
            })
        );
    }

    #[test]
    fn merge_state_advances_checkpoint_and_cursor() {
        let current = CursorState {
            cursor: Some(EventCursor {
                tx_digest: "aaa".into(),
                event_seq: 1,
            }),
            last_checkpoint_sequence_number: 11,
        };
        let next = merge_state(
            &current,
            Some(EventCursor {
                tx_digest: "bbb".into(),
                event_seq: 2,
            }),
            Some(14),
        );

        assert_eq!(next.last_checkpoint_sequence_number, 14);
        assert_eq!(
            next.cursor,
            Some(EventCursor {
                tx_digest: "bbb".into(),
                event_seq: 2,
            })
        );
    }

    #[test]
    fn poll_interval_defaults_to_five_seconds() {
        assert_eq!(
            Duration::from_millis(parse_positive_u64(
                "INDEXER_POLL_INTERVAL_MS",
                DEFAULT_POLL_INTERVAL_MS
            )),
            Duration::from_millis(5_000)
        );
    }

    fn rpc_event(tx_digest: &str, event_seq: &str, event_type: &str) -> RpcEvent {
        RpcEvent {
            id: RpcEventId {
                tx_digest: tx_digest.to_string(),
                event_seq: json!(event_seq),
            },
            event_type: event_type.to_string(),
            parsed_json: json!({ "turretId": "0x1" }),
            timestamp_ms: Some(json!("1710000000000")),
        }
    }
}
