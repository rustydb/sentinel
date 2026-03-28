import type { TurretData } from '@frontier-sentinel/shared-types';

const statusTone: Record<TurretData['status'], string> = {
  online: 'bg-sentinel-accent text-sentinel-ink',
  anchored: 'bg-sentinel-paper text-sentinel-ink',
  unanchored: 'bg-white text-sentinel-ink',
  destroyed: 'bg-sentinel-ink text-sentinel-paper',
  offline: 'bg-sentinel-muted text-sentinel-paper',
};

interface TurretCardProps {
  turret: TurretData;
  onSelect?: (turret: TurretData) => void;
}

export function TurretCard({ turret, onSelect }: TurretCardProps) {
  const orphaned = turret.energySourceId === 'orphaned';

  return (
    <button
      type="button"
      className="flex w-full flex-col gap-4 border-4 border-sentinel-ink bg-sentinel-paper p-5 text-left shadow-[10px_10px_0_0_#111111]"
      onClick={() => onSelect?.(turret)}
      data-testid={`turret-card-${turret.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-sentinel-muted">Turret</p>
          <h3 className="mt-2 text-2xl uppercase">{turret.name ?? turret.itemId}</h3>
        </div>
        <span
          className={`border-2 border-sentinel-ink px-3 py-1 text-xs uppercase ${statusTone[turret.status]}`}
        >
          {turret.status}
        </span>
      </div>
      <dl className="grid grid-cols-2 gap-3 text-sm uppercase">
        <div>
          <dt className="text-sentinel-muted">Node</dt>
          <dd className={orphaned ? 'text-sentinel-danger' : ''}>{turret.energySourceId}</dd>
        </div>
        <div>
          <dt className="text-sentinel-muted">System</dt>
          <dd>{turret.locationHash ?? 'Unknown'}</dd>
        </div>
        <div>
          <dt className="text-sentinel-muted">Aggressor</dt>
          <dd>{turret.aggressor ?? 'None'}</dd>
        </div>
        <div>
          <dt className="text-sentinel-muted">Item</dt>
          <dd>{turret.itemId}</dd>
        </div>
      </dl>
      {orphaned ? (
        <p className="border-2 border-sentinel-danger bg-white px-3 py-2 text-xs uppercase text-sentinel-danger">
          Orphaned node assignment
        </p>
      ) : null}
    </button>
  );
}

interface TurretListProps {
  turrets: TurretData[];
  onSelect?: (turret: TurretData) => void;
}

export function TurretList({ turrets, onSelect }: TurretListProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {turrets.map((turret) => (
        <TurretCard key={turret.id} turret={turret} onSelect={onSelect} />
      ))}
    </div>
  );
}
