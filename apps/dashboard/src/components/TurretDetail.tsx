import type { TurretData, TurretIntelligenceSummary } from '@sentinel/shared-types';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import type { useTurretEvents } from '../hooks/useTurretEvents';
import type { ResolvedTurretSolarSystem } from '../hooks/useTurretSolarSystems';
import { ResponsiveAddress, isSuiAddress } from './ResponsiveAddress';
import { SolarSystemAutocomplete } from './SolarSystemAutocomplete';
import { useTypeInfo } from '../hooks/useTypeInfo';
import { readTurretStatus } from '../hooks/useTurretFilters';

type EventHook = ReturnType<typeof useTurretEvents>;
const ACTION_BUTTON_CLASS =
  'sentinel-action-button border border-sentinel-line px-3 py-2 uppercase';
const INLINE_ACTION_BUTTON_CLASS =
  'sentinel-action-button border border-sentinel-line px-2 py-1 text-xs uppercase';
const INLINE_DANGER_ACTION_BUTTON_CLASS =
  'sentinel-action-button sentinel-action-button--danger border border-sentinel-danger px-2 py-1 text-xs uppercase text-sentinel-danger';
const THEMED_LOADING_LABEL = 'LOADING ...';
const closeIconUrl =
  'https://raw.githubusercontent.com/evefrontier/dapps/refs/heads/main/packages/libs/ui-components/assets/close.svg';
const copyIconUrl = new URL('../assets/copy.svg', import.meta.url).href;
const tickIconUrl = new URL('../assets/tick.svg', import.meta.url).href;
type EventSortKey = 'date' | 'time';
type SortDirection = 'asc' | 'desc';
type EventTimeZone = 'local' | 'utc';
type JsonTokenKind = 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation' | 'text';

interface JsonToken {
  text: string;
  kind: JsonTokenKind;
}

function toEventDate(value: string): Date {
  return new Date(value);
}

function formatEventDate(value: string, timeZone: EventTimeZone): string {
  return toEventDate(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: timeZone === 'utc' ? 'UTC' : undefined,
  });
}

function formatEventTime(value: string, timeZone: EventTimeZone): string {
  return toEventDate(value).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timeZone === 'utc' ? 'UTC' : undefined,
  });
}

function getEventDateKey(value: string, timeZone: EventTimeZone): string {
  const date = toEventDate(value);
  return timeZone === 'utc'
    ? `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
        date.getUTCDate(),
      ).padStart(2, '0')}`
    : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate(),
      ).padStart(2, '0')}`;
}

function getEventTimeKey(value: string, timeZone: EventTimeZone): string {
  const date = toEventDate(value);
  return timeZone === 'utc'
    ? `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(
        2,
        '0',
      )}:${String(date.getUTCSeconds()).padStart(2, '0')}`
    : `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(
        2,
        '0',
      )}:${String(date.getSeconds()).padStart(2, '0')}`;
}

function formatEventSummary(event: EventHook['events'][number]): string {
  const eventSegments = event.eventType.split('::').filter(Boolean);
  if (eventSegments.length >= 2) {
    return `::${eventSegments.slice(-2).join('::')}`;
  }

  return event.eventType;
}

function compareEventRows(
  left: EventHook['events'][number],
  right: EventHook['events'][number],
  sortKey: EventSortKey,
  direction: SortDirection,
  timeZone: EventTimeZone,
): number {
  const multiplier = direction === 'asc' ? 1 : -1;
  const leftDate = getEventDateKey(left.timestamp, timeZone);
  const rightDate = getEventDateKey(right.timestamp, timeZone);
  const leftTime = getEventTimeKey(left.timestamp, timeZone);
  const rightTime = getEventTimeKey(right.timestamp, timeZone);
  const primaryComparison =
    sortKey === 'date' ? leftDate.localeCompare(rightDate) : leftTime.localeCompare(rightTime);

  if (primaryComparison !== 0) {
    return primaryComparison * multiplier;
  }

  return left.timestamp.localeCompare(right.timestamp) * multiplier;
}

function tokenizeJsonLine(line: string): JsonToken[] {
  const tokens: JsonToken[] = [];
  const pattern =
    /("(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\],:])/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        text: line.slice(lastIndex, match.index),
        kind: 'text',
      });
    }

    const token = match[0];
    let kind: JsonTokenKind = 'punctuation';

    if (token.startsWith('"')) {
      kind = line.slice(pattern.lastIndex).match(/^\s*:/) ? 'key' : 'string';
    } else if (token === 'true' || token === 'false') {
      kind = 'boolean';
    } else if (token === 'null') {
      kind = 'null';
    } else if (/^-?\d/.test(token)) {
      kind = 'number';
    }

    tokens.push({
      text: token,
      kind,
    });

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < line.length) {
    tokens.push({
      text: line.slice(lastIndex),
      kind: 'text',
    });
  }

  return tokens;
}

function renderJsonPayload(value: unknown): ReactNode {
  const json = JSON.stringify(value, null, 2) ?? 'null';

  return json.split('\n').map((line, lineIndex) => (
    <span key={`${lineIndex}-${line}`} className="block">
      {tokenizeJsonLine(line).map((token, tokenIndex) => {
        const className = (() => {
          switch (token.kind) {
            case 'key':
              return 'text-sentinel-accent';
            case 'string':
              return 'text-sentinel-positive';
            case 'number':
              return 'text-sentinel-glow';
            case 'boolean':
              return 'text-sentinel-danger';
            case 'null':
              return 'text-sentinel-muted';
            case 'punctuation':
              return 'text-sentinel-muted';
            case 'text':
              return 'text-sentinel-ink';
          }
        })();

        return (
          <span key={`${lineIndex}-${tokenIndex}`} className={className}>
            {token.text}
          </span>
        );
      })}
    </span>
  ));
}

interface TurretDetailProps {
  turret: TurretData | null;
  currentSolarSystem: ResolvedTurretSolarSystem | null;
  intelligence: TurretIntelligenceSummary | null;
  eventsState: EventHook;
  onAssignSolarSystem: (
    nodeId: string,
    assignment: { solarSystemId: number; solarSystemName: string | null },
  ) => Promise<void>;
  onUnassignSolarSystem: (nodeId: string) => Promise<void>;
  onClose: () => void;
  panelRef?: (node: HTMLElement | null) => void;
}

export function TurretDetail({
  turret,
  currentSolarSystem,
  intelligence,
  eventsState,
  onAssignSolarSystem,
  onUnassignSolarSystem,
  onClose,
  panelRef,
}: TurretDetailProps) {
  const [editingSolarSystem, setEditingSolarSystem] = useState(false);
  const [eventSortKey, setEventSortKey] = useState<EventSortKey>('date');
  const [eventSortDirection, setEventSortDirection] = useState<SortDirection>('desc');
  const [eventTimeZone, setEventTimeZone] = useState<EventTimeZone>('local');
  const [copiedSolarSystem, setCopiedSolarSystem] = useState(false);
  const { typeInfo, isLoading, error } = useTypeInfo(turret?.typeId);
  const [selectedEventKey, setSelectedEventKey] = useState<string | null>(null);
  const copyFeedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedEventKey(null);
  }, [turret?.id]);

  useEffect(() => {
    return () => {
      if (copyFeedbackTimerRef.current != null) {
        window.clearTimeout(copyFeedbackTimerRef.current);
      }
    };
  }, []);

  if (!turret) {
    return null;
  }

  const currentNodeId = isSuiAddress(turret.energySourceId) ? turret.energySourceId : null;
  const typeName = typeInfo?.name?.trim() ? typeInfo.name.trim() : null;
  const detailTitle =
    typeof turret.name === 'string' && turret.name.trim()
      ? turret.name.trim()
      : error
        ? 'ERROR!'
        : (typeName ?? (isLoading ? THEMED_LOADING_LABEL : 'Turret'));
  const displayStatus = readTurretStatus(
    turret,
    new Map(intelligence ? [[turret.id, intelligence]] : []),
  ).toUpperCase();
  const sortedEvents = [...eventsState.events].sort((left, right) =>
    compareEventRows(left, right, eventSortKey, eventSortDirection, eventTimeZone),
  );
  const solarSystemLabel = currentSolarSystem?.solarSystemName ?? 'Unassigned';
  const hasTarget =
    typeof intelligence?.targetDisplayName === 'string' &&
    intelligence.targetDisplayName.trim() !== '' &&
    intelligence.targetDisplayName !== 'No Contact';
  const targetLabel = hasTarget ? (intelligence?.targetDisplayName ?? 'None') : 'None';
  const aggressorLabel = hasTarget
    ? intelligence?.isAggressor == null
      ? 'Unknown'
      : intelligence.isAggressor
        ? 'Yes'
        : 'No'
    : 'N/A';
  const tribeLabel = hasTarget ? (intelligence?.tribeName ?? 'Unknown') : 'None';

  async function handleCopySolarSystem(): Promise<void> {
    if (!currentSolarSystem?.solarSystemName || !navigator.clipboard?.writeText) {
      return;
    }

    await navigator.clipboard.writeText(currentSolarSystem.solarSystemName);
    setCopiedSolarSystem(true);

    if (copyFeedbackTimerRef.current != null) {
      window.clearTimeout(copyFeedbackTimerRef.current);
    }

    copyFeedbackTimerRef.current = window.setTimeout(() => {
      setCopiedSolarSystem(false);
      copyFeedbackTimerRef.current = null;
    }, 1600);
  }

  return (
    <aside
      ref={panelRef}
      className="fixed inset-x-0 bottom-0 border-2 border-sentinel-line bg-sentinel-paper p-6 shadow-[0_-6px_0_0_#050608]"
      data-testid="turret-detail"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">
              Selected turret
            </p>
            <h2 className="mt-2 min-w-0 text-3xl uppercase">{detailTitle}</h2>
            <p className="mt-2 text-xs uppercase tracking-[0.3em] text-sentinel-muted">
              Status <span className="ml-2 text-sentinel-ink">{displayStatus}</span>
            </p>
            <ResponsiveAddress
              address={turret.id}
              as="div"
              className="mt-2 w-full min-w-0 max-w-full"
              copyLabel="turret address"
            />
          </div>
          <button
            className={ACTION_BUTTON_CLASS}
            type="button"
            aria-label="Dismiss turret detail"
            onClick={onClose}
          >
            <img
              src={closeIconUrl}
              alt=""
              aria-hidden="true"
              className="size-4 brightness-0 invert contrast-200"
            />
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="min-w-0 border border-sentinel-line p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">
              Latest Target Intelligence
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="border border-sentinel-line bg-sentinel-panel-inset p-3">
                <p className="text-[10px] tracking-[0.25em] text-sentinel-muted">Target</p>
                <p className="mt-2 text-lg">{targetLabel}</p>
              </div>
              <div className="border border-sentinel-line bg-sentinel-panel-inset p-3">
                <p className="text-[10px] uppercase tracking-[0.25em] text-sentinel-muted">
                  Aggressor
                </p>
                <p className="mt-2 text-lg uppercase">{aggressorLabel}</p>
              </div>
              <div className="border border-sentinel-line bg-sentinel-panel-inset p-3">
                <p className="text-[10px] tracking-[0.25em] text-sentinel-muted">Tribe</p>
                <p className="mt-2 text-lg">{tribeLabel}</p>
              </div>
            </div>
            {intelligence?.latestPriorityEvent ? (
              <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-sentinel-muted">
                Source Event {intelligence.latestPriorityEvent.txDigest}#
                {intelligence.latestPriorityEvent.eventSeq}
              </p>
            ) : null}
          </section>

          <section className="min-w-0 border border-sentinel-line p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">
              Node assignment
            </p>
            <div className="mt-3 flex items-start gap-3">
              <div className="min-w-0 flex-1">
                {currentNodeId ? (
                  <ResponsiveAddress
                    address={currentNodeId}
                    as="div"
                    className="w-full min-w-0 max-w-full text-lg"
                    copyLabel="assigned node address"
                  />
                ) : (
                  <p className="text-lg uppercase">{turret.energySourceId}</p>
                )}
              </div>
              {currentNodeId ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className={INLINE_ACTION_BUTTON_CLASS}
                    onClick={() => setEditingSolarSystem((current) => !current)}
                  >
                    {currentSolarSystem?.solarSystemId ? 'Reassign' : 'Assign'}
                  </button>
                  {currentSolarSystem?.solarSystemId ? (
                    <button
                      type="button"
                      className={INLINE_DANGER_ACTION_BUTTON_CLASS}
                      onClick={() => {
                        void onUnassignSolarSystem(currentNodeId);
                      }}
                    >
                      Unassign
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Solar System</p>
              <div className="mt-2 flex items-center gap-2">
                <p className="min-w-0 flex-1 text-lg uppercase">{solarSystemLabel}</p>
                {currentSolarSystem?.solarSystemName ? (
                  <button
                    type="button"
                    className={`flex size-7 shrink-0 items-center justify-center border-2 border-sentinel-ink bg-sentinel-panel-inset text-sentinel-ink transition-all duration-200 ease-out ${
                      copiedSolarSystem
                        ? 'bg-sentinel-ink text-sentinel-paper shadow-[2px_2px_0_0_#ff5f1f]'
                        : 'hover:bg-sentinel-accent hover:text-sentinel-paper'
                    }`}
                    aria-label="Copy solar system"
                    onClick={() => {
                      void handleCopySolarSystem();
                    }}
                  >
                    <img
                      src={copiedSolarSystem ? tickIconUrl : copyIconUrl}
                      alt=""
                      aria-hidden="true"
                      className={copiedSolarSystem ? 'h-3.5 w-3.5' : 'size-3'}
                    />
                  </button>
                ) : null}
              </div>
            </div>
            {editingSolarSystem && currentNodeId ? (
              <div className="mt-4">
                <SolarSystemAutocomplete
                  initialQuery={currentSolarSystem?.solarSystemName ?? ''}
                  onSelect={(result) => {
                    void onAssignSolarSystem(currentNodeId, {
                      solarSystemId: result.id,
                      solarSystemName: result.name,
                    })
                      .then(() => setEditingSolarSystem(false))
                      .catch(() => undefined);
                  }}
                  onCancel={() => setEditingSolarSystem(false)}
                />
              </div>
            ) : null}
            {currentSolarSystem?.resolutionSource === 'retained' ? (
              <p className="mt-4 border border-sentinel-line bg-sentinel-panel-inset px-3 py-2 text-xs uppercase">
                Using retained solar-system mapping from the last assigned network node.
              </p>
            ) : null}
          </section>

          <section className="min-w-0 border border-sentinel-line p-4 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Event log</p>
              <button
                type="button"
                role="switch"
                aria-checked={eventTimeZone === 'utc'}
                aria-label={`Event time zone: ${eventTimeZone === 'local' ? 'Local' : 'UTC'}`}
                className="relative flex h-8 w-36 items-center overflow-hidden border border-sentinel-line bg-sentinel-panel-inset px-1 text-[10px] uppercase tracking-[0.22em] text-sentinel-muted"
                onClick={() =>
                  setEventTimeZone((current) => (current === 'local' ? 'utc' : 'local'))
                }
              >
                <span
                  className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] border border-sentinel-accent bg-sentinel-accent transition-transform duration-200 ease-out ${
                    eventTimeZone === 'utc' ? 'translate-x-full' : 'translate-x-0'
                  }`}
                  aria-hidden="true"
                />
                <span className="relative z-10 flex w-full items-center justify-between px-2">
                  <span
                    className={
                      eventTimeZone === 'local' ? 'text-sentinel-paper' : 'text-sentinel-muted'
                    }
                  >
                    Local
                  </span>
                  <span
                    className={
                      eventTimeZone === 'utc' ? 'text-sentinel-paper' : 'text-sentinel-muted'
                    }
                  >
                    UTC
                  </span>
                </span>
              </button>
            </div>
            <div className="mt-4 grid gap-2 border-b border-sentinel-line pb-2 text-[10px] uppercase tracking-[0.22em] text-sentinel-muted sm:grid-cols-[8.5rem_6.5rem_minmax(0,1fr)]">
              <button
                type="button"
                className="flex items-center gap-1 py-0.5 text-left justify-self-start"
                onClick={() => {
                  setEventSortKey('date');
                  setEventSortDirection((current) =>
                    eventSortKey === 'date' && current === 'asc' ? 'desc' : 'asc',
                  );
                }}
              >
                <span className="normal-case">Date</span>
                <span aria-hidden="true">
                  {eventSortKey === 'date' ? (eventSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1 py-0.5 text-left justify-self-start"
                onClick={() => {
                  setEventSortKey('time');
                  setEventSortDirection((current) =>
                    eventSortKey === 'time' && current === 'asc' ? 'desc' : 'asc',
                  );
                }}
              >
                <span className="normal-case">Time</span>
                <span aria-hidden="true">
                  {eventSortKey === 'time' ? (eventSortDirection === 'asc' ? '↑' : '↓') : '↕'}
                </span>
              </button>
              <span className="normal-case py-0.5 justify-self-start">Event</span>
            </div>
            {eventsState.loading ? (
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-sentinel-muted">
                Syncing event telemetry...
              </p>
            ) : null}
            <ul className="mt-4 space-y-3">
              {sortedEvents.map((event) => (
                <li
                  key={`${event.txDigest}-${event.eventSeq}`}
                  className={`border px-3 py-2 ${
                    selectedEventKey === `${event.txDigest}-${event.eventSeq}`
                      ? 'border-sentinel-accent bg-sentinel-panel-inset'
                      : 'border-sentinel-line'
                  }`}
                >
                  <button
                    type="button"
                    className="grid w-full items-center gap-2 text-left sm:grid-cols-[8.5rem_6.5rem_minmax(0,1fr)]"
                    aria-expanded={selectedEventKey === `${event.txDigest}-${event.eventSeq}`}
                    aria-label={`Toggle payload for ${formatEventSummary(event)}`}
                    onClick={() =>
                      setSelectedEventKey((current) =>
                        current === `${event.txDigest}-${event.eventSeq}`
                          ? null
                          : `${event.txDigest}-${event.eventSeq}`,
                      )
                    }
                  >
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sentinel-muted">
                      {formatEventDate(event.timestamp, eventTimeZone)}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sentinel-muted">
                      {formatEventTime(event.timestamp, eventTimeZone)}
                    </p>
                    <p className="text-xs leading-none">{formatEventSummary(event)}</p>
                  </button>
                  <div
                    aria-hidden={selectedEventKey !== `${event.txDigest}-${event.eventSeq}`}
                    className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin-top] duration-300 ease-out ${
                      selectedEventKey === `${event.txDigest}-${event.eventSeq}`
                        ? 'mt-3 grid-rows-[1fr] opacity-100'
                        : 'mt-0 grid-rows-[0fr] opacity-0 pointer-events-none'
                    }`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="border border-sentinel-line bg-sentinel-shell p-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-sentinel-muted">
                          Payload
                        </p>
                        <pre className="mt-2 overflow-x-auto font-mono text-[10px] leading-relaxed">
                          {renderJsonPayload(event.jsonData)}
                        </pre>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {eventsState.nextPage ? (
              <button
                type="button"
                className={`mt-4 ${ACTION_BUTTON_CLASS}`}
                onClick={eventsState.next}
              >
                Load more
              </button>
            ) : null}
          </section>
        </div>
      </div>
    </aside>
  );
}
