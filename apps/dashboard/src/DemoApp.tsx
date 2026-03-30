import type { TurretData } from '@frontier-sentinel/shared-types';
import { useDeferredValue, useState } from 'react';

import { DashboardScreen } from './components/DashboardScreen';
import {
  DEMO_CHARACTER_NAME,
  DEMO_WALLET_ADDRESS,
  demoEventsState,
  demoNetworkNodes,
  demoNodeActions,
  demoTurretIntelligenceByTurretId,
  demoTurretStats,
  demoSolarSystemsByTurretId,
  demoTurrets,
} from './demo-mode';

function toggleSelectedTurret(
  current: TurretData | null,
  nextTurret: TurretData,
): TurretData | null {
  return current?.id === nextTurret.id ? null : nextTurret;
}

export default function DemoApp() {
  const deferredTurrets = useDeferredValue(demoTurrets);
  const [selectedTurret, setSelectedTurret] = useState<TurretData | null>(null);

  return (
    <DashboardScreen
      turrets={deferredTurrets}
      loading={false}
      error={null}
      characterName={DEMO_CHARACTER_NAME}
      walletAddress={DEMO_WALLET_ADDRESS}
      onDisconnect={() => undefined}
      selectedTurret={selectedTurret}
      onSelectTurret={(turret) => setSelectedTurret(toggleSelectedTurret(selectedTurret, turret))}
      onCloseTurret={() => setSelectedTurret(null)}
      nodes={demoNetworkNodes}
      drawerLoading={false}
      eventsState={demoEventsState}
      solarSystemsByTurretId={demoSolarSystemsByTurretId}
      turretIntelligenceByTurretId={demoTurretIntelligenceByTurretId}
      stats={demoTurretStats}
      onAssignSolarSystem={demoNodeActions.assignNode}
      onUnassignSolarSystem={demoNodeActions.unassignNode}
      onResetEvents={demoEventsState.reset}
    />
  );
}
