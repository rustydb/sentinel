import type { TurretData, TurretIntelligenceSummary } from '@frontier-sentinel/shared-types';

import type { ResolvedTurretSolarSystem } from '../hooks/useTurretSolarSystems';

import { useTypeInfo } from '../hooks/useTypeInfo';
import { ResponsiveAddress, isSuiAddress } from './ResponsiveAddress';

const statusTone: Record<TurretData['status'], string> = {
  online: 'bg-sentinel-positive/15 text-sentinel-positive',
  anchored: 'bg-sentinel-paper text-sentinel-ink',
  unanchored: 'bg-sentinel-shell text-sentinel-ink',
  destroyed: 'bg-sentinel-ink text-sentinel-paper',
  offline: 'bg-sentinel-panel-inset text-sentinel-muted',
};
const THEMED_LOADING_LABEL = '<SYNCING>';

interface TurretCardProps {
  turret: TurretData;
  solarSystem?: ResolvedTurretSolarSystem | null;
  intelligence?: TurretIntelligenceSummary | null;
  onSelect?: (turret: TurretData) => void;
  selected?: boolean;
}

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

export function TurretCard({
  turret,
  solarSystem,
  intelligence,
  onSelect,
  selected = false,
}: TurretCardProps) {
  const orphaned = turret.energySourceId === 'orphaned';
  const addressValuedNode = isSuiAddress(turret.energySourceId) ? turret.energySourceId : null;
  const { typeInfo, isLoading } = useTypeInfo(turret.typeId);
  const customName = turret.name?.trim() ? turret.name.trim() : null;
  const typeName = typeInfo?.name?.trim() ? typeInfo.name.trim() : null;
  const displayClass = typeName ?? (isLoading ? THEMED_LOADING_LABEL : 'Turret');
  const displayStatus = intelligence?.statusOverride === 'ENGAGED' ? 'engaged' : turret.status;
  const targetLabel = intelligence?.targetDisplayName ?? 'No Contact';
  const aggressorsPast24Hours = intelligence?.aggressorsPast24Hours ?? 0;

  return (
    <article
      className={joinClasses(
        'sentinel-interactive-card flex w-full cursor-pointer flex-col gap-4 border-2 border-sentinel-line bg-sentinel-paper p-5 text-left shadow-[6px_6px_0_0_#050608]',
        selected && 'is-selected',
      )}
      onClick={() => onSelect?.(turret)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect?.(turret);
        }
      }}
      role="button"
      tabIndex={0}
      aria-selected={selected}
      data-selected={selected ? 'true' : 'false'}
      data-testid={`turret-card-${turret.id}`}
    >
      <div className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2">
        <div className="col-start-1 row-start-1 flex size-14 items-center justify-center overflow-hidden border border-sentinel-line bg-sentinel-panel-inset">
          {typeInfo?.iconUrl ? (
            <img
              src={typeInfo.iconUrl}
              alt={`${typeName ?? 'Turret'} icon`}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <span className="px-1 text-center text-[10px] uppercase tracking-[0.2em] text-sentinel-muted">
              {typeName ? typeName.slice(0, 2) : isLoading ? '<<' : 'TR'}
            </span>
          )}
        </div>
        <div className="col-start-2 row-start-1 min-w-0">
          <ResponsiveAddress
            address={turret.id}
            as="div"
            className={joinClasses(
              'w-full min-w-0 text-[11px] uppercase tracking-[0.28em] text-sentinel-muted',
              !customName && 'invisible',
            )}
            copyable={false}
          />
          <h3 className="mt-2 text-[1.55rem] leading-none uppercase">
            {customName ? (
              customName.toUpperCase()
            ) : (
              <ResponsiveAddress
                address={turret.id}
                as="div"
                className="w-full min-w-0 uppercase"
                maxAbbreviation={20}
                textClassName="text-[1.35rem] leading-none tracking-[0.1em] text-sentinel-ink"
                copyable={false}
              />
            )}
          </h3>
        </div>
        <div className="col-start-1 col-span-2 row-start-2 mt-1 grid w-full grid-cols-2 gap-x-4 gap-y-2 self-start text-[10px] uppercase tracking-[0.2em]">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="pt-[1px] text-sentinel-muted leading-none">Status:</span>
              <span
                className={`border px-3 py-1 text-xs uppercase leading-none ${
                  displayStatus === 'engaged'
                    ? 'border-sentinel-engaged bg-sentinel-engaged/15 text-sentinel-engaged'
                    : statusTone[turret.status]
                }`}
              >
                {displayStatus}
              </span>
            </div>
          </div>
          <div className="min-w-0 justify-self-start">
            <div className="flex items-center justify-start gap-2">
              <span className="pt-[1px] text-sentinel-muted leading-none">Class:</span>
              <span
                className={`border px-3 py-1 text-xs uppercase leading-none ${'border-sentinel-line bg-sentinel-panel-inset text-sentinel-ink'}`}
              >
                {displayClass}
              </span>
            </div>
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-sentinel-line pt-4 text-sm uppercase">
        <div className="min-w-0">
          <dt className="text-[11px] tracking-[0.16em] text-sentinel-muted">Network Node</dt>
          <dd className={orphaned ? 'text-sentinel-danger' : 'min-w-0'}>
            {addressValuedNode ? (
              <ResponsiveAddress
                address={addressValuedNode}
                as="div"
                className="min-w-0"
                copyable={false}
              />
            ) : (
              turret.energySourceId
            )}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] tracking-[0.16em] text-sentinel-muted">Solar System</dt>
          <dd>{solarSystem?.solarSystemName ?? 'Unassigned'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] tracking-[0.16em] text-sentinel-muted">Recent Target</dt>
          <dd>{targetLabel}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] tracking-[0.16em] text-sentinel-muted">Aggressors 24H</dt>
          <dd>{aggressorsPast24Hours}</dd>
        </div>
      </dl>
      {orphaned ? (
        <p className="border border-sentinel-danger bg-sentinel-panel-inset px-3 py-2 text-xs uppercase text-sentinel-danger">
          Orphaned node assignment
        </p>
      ) : null}
    </article>
  );
}

interface TurretListProps {
  turrets: TurretData[];
  solarSystemsByTurretId?: Map<string, ResolvedTurretSolarSystem>;
  turretIntelligenceByTurretId?: Map<string, TurretIntelligenceSummary>;
  onSelect?: (turret: TurretData) => void;
  selectedTurretId?: string | null;
}

export function TurretList({
  turrets,
  solarSystemsByTurretId,
  turretIntelligenceByTurretId,
  onSelect,
  selectedTurretId,
}: TurretListProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {turrets.map((turret) => (
        <TurretCard
          key={turret.id}
          turret={turret}
          solarSystem={solarSystemsByTurretId?.get(turret.id) ?? null}
          intelligence={turretIntelligenceByTurretId?.get(turret.id) ?? null}
          onSelect={onSelect}
          selected={selectedTurretId === turret.id}
        />
      ))}
    </div>
  );
}
