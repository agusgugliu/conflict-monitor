export type WarId = 'ww1' | 'ww2' | 'ukraine' | 'iran-axis' | 'afgh-pak' | 'venezuela';

/**
 * Which side won / initiated the event.
 * Historical: entente/central (WWI), allied/axis/soviet/japan (WWII)
 * Modern: russia/ukraine, israel/hamas/houthi/iran/usa, pakistan/ttp, contested/ongoing
 */
export type VictorSide =
  | 'entente'
  | 'central'
  | 'allied'
  | 'axis'
  | 'soviet'
  | 'japan'
  | 'russia'
  | 'ukraine'
  | 'israel'
  | 'iran'
  | 'usa'
  | 'hamas'
  | 'houthi'
  | 'pakistan'
  | 'ttp'
  | 'inconclusive'
  | 'contested'
  | 'ongoing';

/** Visual importance weight — affects marker size and label visibility. */
export type BattleSignificance = 'major' | 'pivotal' | 'turning-point';

/**
 * For modern conflicts — describes the nature of the event beyond just "battle".
 */
export type EventType =
  | 'battle'
  | 'advance'
  | 'retreat'
  | 'airstrike'
  | 'missile'
  | 'ceasefire'
  | 'diplomatic'
  | 'assassination'
  | 'arrest'
  | 'protest';

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
  | 'Northern Europe'
  // Modern theaters
  | 'Eastern Ukraine'
  | 'Southern Ukraine'
  | 'Kharkiv Region'
  | 'Kursk Region'
  | 'Crimea'
  | 'Gaza Strip'
  | 'Southern Lebanon'
  | 'Red Sea'
  | 'Yemen'
  | 'Syria / Iraq'
  | 'Iran'
  | 'Pakistan-Afghanistan Border'
  | 'Venezuela';

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
  /** Faction names on the attacking / initiating side */
  attackers: string[];
  /** Faction names on the defending / responding side */
  defenders: string[];
  victorSide: VictorSide;
  casualties?: string;
  significance: BattleSignificance;
  summary: string;
  /** For modern conflicts: the nature of the event */
  eventType?: EventType;
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
