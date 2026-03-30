import type { EveWorldName } from '@sentinel/shared-types';
import { createContext, useContext, type ReactNode } from 'react';

const WorldContext = createContext<EveWorldName>('utopia');

export function WorldProvider({ world, children }: { world: EveWorldName; children: ReactNode }) {
  return <WorldContext.Provider value={world}>{children}</WorldContext.Provider>;
}

export function useCurrentWorld(): EveWorldName {
  return useContext(WorldContext);
}
