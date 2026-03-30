import type { ShellStatisticsSnapshot } from '@sentinel/shared-types';

interface StatisticsPanelProps {
  stats: ShellStatisticsSnapshot;
}

const STAT_ITEMS: Array<{ key: keyof ShellStatisticsSnapshot; label: string }> = [
  { key: 'totalTurrets', label: 'Total Turrets' },
  { key: 'engagedTurrets', label: 'Engaged' },
  { key: 'onlineTurrets', label: 'Online' },
  { key: 'offlineTurrets', label: 'Offline' },
  { key: 'aggressorsPast24Hours', label: 'Aggressors 24H' },
];

const statTone: Partial<Record<keyof ShellStatisticsSnapshot, string>> = {
  engagedTurrets: 'text-sentinel-engaged',
  onlineTurrets: 'text-sentinel-positive',
  aggressorsPast24Hours: 'text-sentinel-accent',
};

export function StatisticsPanel({ stats }: StatisticsPanelProps) {
  return (
    <section
      className="border-2 border-sentinel-line bg-sentinel-panel p-5"
      aria-label="Metrics"
      data-testid="statistics-panel"
    >
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {STAT_ITEMS.map((item) => (
          <div
            key={item.key}
            className="border border-sentinel-line bg-sentinel-panel-inset px-4 py-5"
          >
            <dt className="text-[10px] uppercase tracking-[0.28em] text-sentinel-muted">
              {item.label}
            </dt>
            <dd
              className={`mt-4 font-display text-3xl uppercase leading-none ${
                statTone[item.key] ?? 'text-sentinel-ink'
              }`}
            >
              {stats[item.key]}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
