import type { TurretData } from '@frontier-sentinel/shared-types';
import { useDeferredValue, useEffect, useState } from 'react';

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
  currentTurretId: string | null,
  nextTurret: TurretData,
): string | null {
  return currentTurretId === nextTurret.id ? null : nextTurret.id;
}

export default function DemoApp() {
  const deferredTurrets = useDeferredValue(demoTurrets);
  const [selectedTurretId, setSelectedTurretId] = useState<string | null>(null);
  const selectedTurret =
    selectedTurretId != null
      ? (deferredTurrets.find((turret) => turret.id === selectedTurretId) ?? null)
      : null;

  useEffect(() => {
    if (selectedTurretId == null) {
      return;
    }

    const selectedTurretExists = deferredTurrets.some((turret) => turret.id === selectedTurretId);
    if (!selectedTurretExists) {
      setSelectedTurretId(null);
    }
  }, [deferredTurrets, selectedTurretId]);

  return (
    <DashboardScreen
      turrets={deferredTurrets}
      loading={false}
      error={null}
      characterName={DEMO_CHARACTER_NAME}
      walletAddress={DEMO_WALLET_ADDRESS}
      onDisconnect={() => undefined}
      selectedTurret={selectedTurret}
      onSelectTurret={(turret) =>
        setSelectedTurretId(toggleSelectedTurret(selectedTurretId, turret))
      }
      onCloseTurret={() => setSelectedTurretId(null)}
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
