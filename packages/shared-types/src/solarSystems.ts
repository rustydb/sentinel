export type EveWorldName = 'utopia' | 'stillness';

export interface SolarSystemSearchResult {
  id: number;
  name: string;
  world: EveWorldName;
  matchText: string;
}
