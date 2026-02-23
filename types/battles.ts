export type WarId = 'ww1' | 'ww2';

/**
 * Which side won the battle.
 * 'entente'  = WWI Allied side (France, UK, Russia, USA…)
 * 'central'  = WWI Central Powers (Germany, Austria-Hungary, Ottoman Empire)
 * 'allied'   = WWII Allied side (UK, USA, USSR, France…)
 * 'axis'     = WWII Axis (Germany, Italy, Japan)
 * 'soviet'   = Soviet-specific victory (for battles where USSR acted alone)
 * 'japan'    = Japanese victory
 * 'inconclusive' = No clear winner
 */
export type VictorSide =
  | 'entente'
  | 'central'
  | 'allied'
  | 'axis'
  | 'soviet'
  | 'japan'
  | 'inconclusive';

/** Visual importance weight — affects marker size and label visibility. */
export type BattleSignificance = 'major' | 'pivotal' | 'turning-point';

export type TheaterName =
  | 'Western Front'
  | 'Eastern Front'
  | 'Italian Front'
  | 'Gallipoli'
  | 'Middle East'
  | 'Naval'
  | 'Macedonian Front'
  | 'Eastern Europe'
  | 'North Africa'
  | 'Pacific'
  | 'Atlantic'
  | 'Mediterranean'
  | 'Northern Europe';

export interface Battle {
  id: string;
  warId: WarId;
  name: string;
  theater: TheaterName;
  /** ISO date of battle start: "YYYY-MM-DD" */
  date: string;
  /** ISO date of battle end — omit for single-day events */
  endDate?: string;
  coordinates: { lat: number; lng: number };
  /** Faction names on the attacking side */
  attackers: string[];
  /** Faction names on the defending side */
  defenders: string[];
  victorSide: VictorSide;
  casualties?: string;
  significance: BattleSignificance;
  summary: string;
}

/** A named front / theater rendered as a label on the map. */
export interface TheaterLabel {
  warId: WarId;
  /** Visible from this date */
  activeFrom: string;
  /** Visible until this date */
  activeTo: string;
  label: string;
  coordinates: { lat: number; lng: number };
  color: string;
}
