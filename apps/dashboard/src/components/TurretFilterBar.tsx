import type { NetworkNodeView } from '../hooks/useNetworkNodes';
import type {
  DisplayTurretStatus,
  TurretFilterOption,
  TurretFilterState,
} from '../hooks/useTurretFilters';
import { useSolarSystemCatalog } from '../hooks/useSolarSystemCatalog';
import { useEffect, useRef, useState } from 'react';

interface TurretFilterBarProps {
  filters: TurretFilterState;
  statusOptions: TurretFilterOption[];
  classOptions: TurretFilterOption[];
  selectedNetworkNode: NetworkNodeView | null;
  hasActiveFilters: boolean;
  onSearchTextChange: (value: string) => void;
  onSolarSystemQueryChange: (value: string) => void;
  onAddSolarSystem: (value: string) => void;
  onRemoveSolarSystem: (value: string) => void;
  onStatusChange: (value: DisplayTurretStatus | null) => void;
  onClassNameChange: (value: string | null) => void;
  onClearSelectedNetworkNode: () => void;
  onClearAll: () => void;
}

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

const HEADER_FILTER_BUTTON_CLASS =
  'sentinel-action-button flex shrink-0 items-center gap-2 border-l border-sentinel-line px-3 py-3 text-[10px] uppercase tracking-[0.22em] sm:px-4';
const FILTER_BUTTON_CLASS =
  'sentinel-action-button border border-sentinel-line bg-sentinel-panel-inset px-3 py-2 text-xs uppercase';
const CLASS_BUTTON_WIDTH_CLASS = 'min-w-[14ch]';
const ACTIVE_FILTER_BUTTON_CLASS = 'border-sentinel-accent bg-sentinel-accent/10 text-sentinel-ink';

function statusIndicatorClass(status: DisplayTurretStatus | null): string {
  if (status === 'engaged') {
    return 'bg-sentinel-engaged text-sentinel-engaged';
  }

  if (status === 'online') {
    return 'bg-sentinel-positive text-sentinel-positive';
  }

  if (status === 'offline') {
    return 'bg-sentinel-muted text-sentinel-muted';
  }

  return 'bg-sentinel-line text-sentinel-muted';
}

function classBadgeClass(isActive: boolean): string {
  return isActive
    ? ACTIVE_FILTER_BUTTON_CLASS
    : 'border-sentinel-line bg-sentinel-panel text-sentinel-muted';
}

function resolveNodeLabel(node: NetworkNodeView | null): string {
  if (!node) {
    return '';
  }

  const customName =
    typeof node.displayName === 'string' && node.displayName.trim()
      ? node.displayName.trim()
      : null;

  return customName ?? node.nodeId;
}

export function TurretFilterBar({
  filters,
  statusOptions,
  classOptions,
  selectedNetworkNode,
  hasActiveFilters,
  onSearchTextChange,
  onSolarSystemQueryChange,
  onAddSolarSystem,
  onRemoveSolarSystem,
  onStatusChange,
  onClassNameChange,
  onClearSelectedNetworkNode,
  onClearAll,
}: TurretFilterBarProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { results } = useSolarSystemCatalog({ query: filters.solarSystemQuery });
  const selectedNodeLabel = resolveNodeLabel(selectedNetworkNode);
  const allStatusesSelected = filters.statuses.length === 0;
  const allClassesSelected = filters.classNames.length === 0;
  const visibleResults = results.filter(
    (result) =>
      !filters.solarSystems.some(
        (solarSystem) => solarSystem.trim().toLowerCase() === result.name.trim().toLowerCase(),
      ),
  );

  const renderSelectionMarker = (isActive: boolean) => (
    <span
      aria-hidden="true"
      className={joinClasses(
        'inline-flex size-4 shrink-0 items-center justify-center border text-[10px] leading-none',
        isActive
          ? 'border-sentinel-accent bg-sentinel-accent text-sentinel-panel-inset'
          : 'border-sentinel-line text-transparent',
      )}
    >
      +
    </span>
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  return (
    <div ref={menuRef} className="relative w-full">
      <div className="flex min-w-0 items-stretch border border-sentinel-line bg-sentinel-paper">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Search turrets</span>
          <input
            value={filters.searchText}
            onChange={(event) => onSearchTextChange(event.currentTarget.value)}
            placeholder="Search for turret ID or name"
            className="h-full w-full border-0 bg-transparent px-4 py-3 text-sm text-sentinel-ink placeholder:text-sentinel-muted focus:outline-none sm:text-base"
          />
        </label>
        <button
          type="button"
          aria-expanded={open}
          aria-label="Advanced search options"
          className={joinClasses(
            HEADER_FILTER_BUTTON_CLASS,
            hasActiveFilters && 'text-sentinel-accent',
          )}
          onClick={() => setOpen((current) => !current)}
        >
          <span>Filters</span>
          {hasActiveFilters ? (
            <span className="inline-flex min-w-6 items-center justify-center border border-sentinel-accent px-1 py-0.5 text-[10px] text-sentinel-accent">
              LIVE
            </span>
          ) : null}
          <span aria-hidden="true">{open ? '▴' : '▾'}</span>
        </button>
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 border border-sentinel-line bg-sentinel-panel p-4 shadow-[6px_6px_0_0_#050608]">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.24em] text-sentinel-muted">
              Solar System
            </p>
            <div className="mt-2 flex min-h-11 flex-wrap items-center gap-2 border border-sentinel-line bg-sentinel-paper px-3 py-2">
              {filters.solarSystems.map((solarSystem) => (
                <span
                  key={solarSystem}
                  className="inline-flex items-center gap-2 border border-sentinel-accent bg-sentinel-panel-inset px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-sentinel-ink"
                >
                  <span>{solarSystem}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${solarSystem}`}
                    className="sentinel-action-button border border-sentinel-line px-1 py-0 text-[9px] leading-none"
                    onClick={() => onRemoveSolarSystem(solarSystem)}
                  >
                    x
                  </button>
                </span>
              ))}
              <input
                value={filters.solarSystemQuery}
                onChange={(event) => onSolarSystemQueryChange(event.currentTarget.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && visibleResults.length > 0) {
                    event.preventDefault();
                    onAddSolarSystem(visibleResults[0].name);
                  }
                }}
                placeholder={
                  filters.solarSystems.length === 0 ? 'Search solar system' : 'Add solar system'
                }
                className="min-w-[12rem] flex-1 border-0 bg-transparent py-1 text-sm text-sentinel-ink placeholder:text-sentinel-muted focus:outline-none"
              />
            </div>
            {filters.solarSystemQuery.trim() ? (
              <div className="mt-2 max-h-44 overflow-y-auto border border-sentinel-line bg-sentinel-paper">
                {visibleResults.length > 0 ? (
                  <div className="space-y-px">
                    {visibleResults.map((result) => (
                      <button
                        key={`${result.world}-${result.id}`}
                        type="button"
                        className="sentinel-action-button block w-full border-b border-sentinel-line px-3 py-2 text-left text-xs uppercase last:border-b-0"
                        onClick={() => {
                          onAddSolarSystem(result.name);
                        }}
                      >
                        {result.name}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-xs uppercase text-sentinel-muted">
                    No solar systems match this search.
                  </div>
                )}
              </div>
            ) : null}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[max-content_max-content]">
            <div className="min-w-[12rem]">
              <p className="text-[10px] uppercase tracking-[0.24em] text-sentinel-muted">Status</p>
              <div className="mt-2 grid justify-start gap-2">
                <button
                  type="button"
                  aria-pressed={allStatusesSelected}
                  className={joinClasses(
                    FILTER_BUTTON_CLASS,
                    allStatusesSelected && ACTIVE_FILTER_BUTTON_CLASS,
                  )}
                  onClick={() => onStatusChange(null)}
                >
                  <span className="flex items-center gap-2">
                    {renderSelectionMarker(allStatusesSelected)}
                    <span
                      aria-hidden="true"
                      className={joinClasses('size-2 shrink-0', statusIndicatorClass(null))}
                    />
                    <span>All Statuses</span>
                  </span>
                </button>
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={filters.statuses.includes(option.value as DisplayTurretStatus)}
                    className={joinClasses(
                      FILTER_BUTTON_CLASS,
                      filters.statuses.includes(option.value as DisplayTurretStatus) &&
                        ACTIVE_FILTER_BUTTON_CLASS,
                    )}
                    onClick={() => onStatusChange(option.value as DisplayTurretStatus)}
                  >
                    <span className="flex items-center gap-2">
                      {renderSelectionMarker(
                        filters.statuses.includes(option.value as DisplayTurretStatus),
                      )}
                      <span
                        aria-hidden="true"
                        className={joinClasses(
                          'size-2 shrink-0',
                          statusIndicatorClass(option.value as DisplayTurretStatus),
                        )}
                      />
                      <span>{option.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-w-[15rem]">
              <p className="text-[10px] uppercase tracking-[0.24em] text-sentinel-muted">Class</p>
              <div className="mt-2 grid justify-start gap-2">
                <button
                  type="button"
                  aria-pressed={allClassesSelected}
                  className={joinClasses(
                    FILTER_BUTTON_CLASS,
                    CLASS_BUTTON_WIDTH_CLASS,
                    classBadgeClass(allClassesSelected),
                  )}
                  onClick={() => onClassNameChange(null)}
                >
                  <span className="flex items-center gap-2">
                    {renderSelectionMarker(allClassesSelected)}
                    <span className="inline-flex w-full justify-end">ALL CLASSES</span>
                  </span>
                </button>
                {classOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={filters.classNames.includes(option.value)}
                    className={joinClasses(
                      FILTER_BUTTON_CLASS,
                      CLASS_BUTTON_WIDTH_CLASS,
                      classBadgeClass(filters.classNames.includes(option.value)),
                    )}
                    onClick={() => onClassNameChange(option.value)}
                  >
                    <span className="flex items-center gap-2">
                      {renderSelectionMarker(filters.classNames.includes(option.value))}
                      <span className="inline-flex w-full justify-end">{option.label}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-sentinel-line pt-4">
            <div className="flex flex-wrap items-center gap-2">
              {selectedNetworkNode ? (
                <span className="flex items-center gap-2 border border-sentinel-accent bg-sentinel-panel-inset px-2 py-1 text-[10px] uppercase tracking-[0.22em] text-sentinel-ink">
                  <span className="text-sentinel-accent">Node</span>
                  <span className="max-w-[18rem] truncate">{selectedNodeLabel}</span>
                  <button
                    type="button"
                    className="sentinel-action-button border border-sentinel-line px-1.5 py-0.5 text-[9px] uppercase tracking-[0.18em]"
                    onClick={onClearSelectedNetworkNode}
                  >
                    Clear
                  </button>
                </span>
              ) : null}
            </div>

            <button
              type="button"
              className="sentinel-action-button border border-sentinel-line px-3 py-2 text-[10px] uppercase tracking-[0.22em]"
              onClick={onClearAll}
              disabled={!hasActiveFilters}
            >
              Clear all
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
