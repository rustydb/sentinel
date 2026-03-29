import type { TurretData } from '@frontier-sentinel/shared-types';

import type { ResolvedTurretSolarSystem } from '../hooks/useTurretSolarSystems';

import { useTypeInfo } from '../hooks/useTypeInfo';
import { ResponsiveAddress, isSuiAddress } from './ResponsiveAddress';

const statusTone: Record<TurretData['status'], string> = {
  online: 'bg-sentinel-accent text-sentinel-ink',
  anchored: 'bg-sentinel-paper text-sentinel-ink',
  unanchored: 'bg-white text-sentinel-ink',
  destroyed: 'bg-sentinel-ink text-sentinel-paper',
  offline: 'bg-sentinel-muted text-sentinel-paper',
};

interface TurretCardProps {
  turret: TurretData;
  solarSystem?: ResolvedTurretSolarSystem | null;
  onSelect?: (turret: TurretData) => void;
  selected?: boolean;
}

function joinClasses(...classNames: Array<string | false | null | undefined>): string {
  return classNames.filter(Boolean).join(' ');
}

export function TurretCard({ turret, solarSystem, onSelect, selected = false }: TurretCardProps) {
  const orphaned = turret.energySourceId === 'orphaned';
  const addressValuedNode = isSuiAddress(turret.energySourceId) ? turret.energySourceId : null;
  const typeInfo = useTypeInfo(turret.typeId);
  const customName = turret.name?.trim() ? turret.name.trim() : null;
  const typeName = typeInfo?.name?.trim() ? typeInfo.name.trim() : null;
  const displayName = customName ?? typeName ?? turret.itemId;
  const typeSubtitle = customName && typeName ? typeName : null;

  return (
    <article
      className={joinClasses(
        'sentinel-interactive-card flex w-full cursor-pointer flex-col gap-4 border-4 border-sentinel-ink bg-sentinel-paper p-5 text-left shadow-[10px_10px_0_0_#111111]',
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
        <div className="col-start-1 row-start-1 flex size-14 items-center justify-center overflow-hidden border-2 border-sentinel-ink bg-white">
          {typeInfo?.iconUrl ? (
            <img
              src={typeInfo.iconUrl}
              alt={`${typeName ?? 'Turret'} icon`}
              className="h-full w-full object-cover object-center"
            />
          ) : (
            <span className="px-1 text-center text-[10px] uppercase tracking-[0.2em] text-sentinel-muted">
              {typeName ? typeName.slice(0, 2) : 'TR'}
            </span>
          )}
        </div>
        <div className="col-start-2 row-start-1 min-w-0">
          <ResponsiveAddress
            address={turret.id}
            as="div"
            className="w-full min-w-0 text-xs uppercase tracking-[0.3em] text-sentinel-muted"
            copyable={false}
          />
          <h3 className="mt-2 text-2xl uppercase">{displayName}</h3>
          {typeSubtitle ? (
            <p className="mt-1 truncate text-xs uppercase tracking-[0.2em] text-sentinel-muted">
              {typeSubtitle}
            </p>
          ) : null}
        </div>
        <div className="col-start-1 row-start-2 flex w-full items-center gap-2 self-start text-[10px] uppercase tracking-[0.2em]">
          <span className="text-sentinel-muted">Status:</span>
          <span
            className={`border-2 border-sentinel-ink px-3 py-1 text-xs uppercase ${statusTone[turret.status]}`}
          >
            {turret.status}
          </span>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm uppercase">
        <div className="min-w-0">
          <dt className="text-sentinel-muted">Network Node</dt>
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
          <dt className="text-sentinel-muted">Solar System</dt>
          <dd>{solarSystem?.solarSystemName ?? 'Unassigned'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-sentinel-muted">Aggressor</dt>
          <dd>{turret.aggressor ?? 'None'}</dd>
        </div>
      </dl>
      {orphaned ? (
        <p className="border-2 border-sentinel-danger bg-white px-3 py-2 text-xs uppercase text-sentinel-danger">
          Orphaned node assignment
        </p>
      ) : null}
    </article>
  );
}

interface TurretListProps {
  turrets: TurretData[];
  solarSystemsByTurretId?: Map<string, ResolvedTurretSolarSystem>;
  onSelect?: (turret: TurretData) => void;
  selectedTurretId?: string | null;
}

export function TurretList({
  turrets,
  solarSystemsByTurretId,
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
          onSelect={onSelect}
          selected={selectedTurretId === turret.id}
        />
      ))}
    </div>
  );
}
