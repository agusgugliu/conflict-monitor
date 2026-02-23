export type ConflictType =
  | 'Interstate'
  | 'Civil War'
  | 'Independence'
  | 'Conquest'
  | 'Rebellion';

export type ImpactLevel = 'high' | 'medium' | 'low';
export type Region = 'Europe' | 'Americas' | 'Asia' | 'Africa' | 'Middle East' | 'Oceania';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Battle {
  name: string;
  coordinates: Coordinates;
  year?: number;
}

export interface Conflict {
  id: string;
  name: string;
  /** Integer year. Negative = BC (e.g. -218 = 218 BC). */
  start_year: number;
  /** Integer year or null if ongoing. */
  end_year: number | null;
  /** ISO date string, optional — provided when exact date is known. */
  start_date?: string;
  end_date?: string | null;
  coordinates: Coordinates;
  type: ConflictType;
  impact: ImpactLevel;
  region: Region;
  belligerents: string[];
  casualties: string;
  summary: string;
  affected_countries?: string[];
  battles?: Battle[];
}

export interface FilterState {
  types: ConflictType[];
  impacts: ImpactLevel[];
  regions: Region[];
}
