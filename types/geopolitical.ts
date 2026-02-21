// ─── Primitive types ────────────────────────────────────────────────────────

export type Continent =
  | 'Europe'
  | 'Middle East'
  | 'Asia'
  | 'Africa'
  | 'Americas'
  | 'Oceania';

export type TensionStatus = 'critical' | 'elevated' | 'watchlist' | 'resolved';

export type SeverityLevel = 'high' | 'medium' | 'low';

export type CountryRole =
  | 'Belligerent'
  | 'Aggressor'
  | 'Defender'
  | 'Mediator'
  | 'Ally'
  | 'Observer'
  | 'Proxy'
  | 'Supplier';

// ─── Source ─────────────────────────────────────────────────────────────────

/**
 * Every news item MUST contain at least one Source.
 * Both `publisher` and `url` are required fields.
 */
export interface Source {
  publisher: string;
  url: string;
}

// ─── Country involvement ─────────────────────────────────────────────────────

export interface InvolvedCountry {
  name: string;
  flag: string; // emoji flag
  role: CountryRole;
}

// ─── News / Event ────────────────────────────────────────────────────────────

/**
 * A discrete news event associated with a tension.
 * `sources` is a non-empty array — every event must cite its origin.
 */
export interface GeopoliticalEvent {
  id: string;
  date: string; // ISO 8601: "YYYY-MM-DD"
  headline: string;
  summary: string;
  sources: [Source, ...Source[]]; // tuple enforces at least one source
}

// ─── Tension / Conflict ──────────────────────────────────────────────────────

export interface ConflictTension {
  id: string;
  name: string;
  continent: Continent;
  status: TensionStatus;
  severity: SeverityLevel;
  description: string;
  startDate: string; // ISO 8601
  lastUpdated: string; // ISO 8601
  countries: InvolvedCountry[];
  tags: string[];
  events: GeopoliticalEvent[];
}

// ─── Continent grouping ──────────────────────────────────────────────────────

/**
 * Top-level grouping. All tensions are grouped by continent.
 * This is the primary display unit — do not flatten this structure.
 */
export interface ContinentSection {
  continent: Continent;
  tensions: ConflictTension[];
}

// ─── Filter state ────────────────────────────────────────────────────────────

export interface MonitorFilterState {
  statuses: TensionStatus[];
  severities: SeverityLevel[];
  continents: Continent[];
  searchQuery: string;
}
