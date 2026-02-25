import type { Battle, TheaterLabel, WarId } from '@/types/battles';

// ── Helpers ───────────────────────────────────────────────────────────────────

function toYearMonth(iso: string): { year: number; month: number } {
  const d = new Date(iso);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

/** Returns week-of-month (1–5) for an ISO date string. */
export function weekOfMonth(iso: string): number {
  const day = new Date(iso).getUTCDate();
  return Math.min(5, Math.ceil(day / 7));
}

const MODERN_WAR_IDS: Set<WarId> = new Set(['ukraine', 'iran-axis', 'afgh-pak', 'venezuela']);

// ── Battle filters ────────────────────────────────────────────────────────────

/**
 * Returns battles that were underway at the given year/month.
 * Used for WWI/WWII (month-level granularity).
 */
export function getBattlesForYearMonth(
  battles: Battle[],
  year: number,
  month: number
): Battle[] {
  return battles.filter((b) => {
    const start = toYearMonth(b.date);
    const startNum = start.year * 12 + start.month;
    const nowNum = year * 12 + month;

    if (nowNum < startNum) return false;

    if (b.endDate) {
      const end = toYearMonth(b.endDate);
      const endNum = end.year * 12 + end.month + 2; // linger 2 months
      return nowNum <= endNum;
    }

    // Single-day battles linger for 3 months
    return nowNum <= startNum + 3;
  });
}

/**
 * Returns modern-conflict events at week-level granularity.
 * Modern events are shown for their exact week, plus lingering 1 week.
 * Historical (WW1/WW2) events fall back to month-level logic.
 */
export function getBattlesForYearMonthWeek(
  battles: Battle[],
  year: number,
  month: number,
  week: number
): Battle[] {
  return battles.filter((b) => {
    const d = new Date(b.date);
    const bYear = d.getUTCFullYear();
    const bMonth = d.getUTCMonth() + 1;

    if (MODERN_WAR_IDS.has(b.warId)) {
      // Modern: show events from this week (and linger 1 week)
      if (bYear !== year || bMonth !== month) {
        // Check linger across month boundary (week 1 can linger from previous month week 5)
        if (week !== 1) return false;
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        if (bYear === prevYear && bMonth === prevMonth) {
          return weekOfMonth(b.date) === 5; // last week of previous month lingers
        }
        return false;
      }
      const bWeek = weekOfMonth(b.date);
      return bWeek === week || bWeek === week - 1;
    } else {
      // Historical (WW1/WW2): month-level logic
      const startNum = bYear * 12 + bMonth;
      const nowNum = year * 12 + month;
      if (nowNum < startNum) return false;
      if (b.endDate) {
        const end = toYearMonth(b.endDate);
        const endNum = end.year * 12 + end.month + 2;
        return nowNum <= endNum;
      }
      return nowNum <= startNum + 3;
    }
  });
}

/**
 * Returns theater labels visible at the given year/month.
 */
export function getTheaterLabelsForYearMonth(
  labels: TheaterLabel[],
  year: number,
  month: number
): TheaterLabel[] {
  return labels.filter((l) => {
    const from = toYearMonth(l.activeFrom);
    const to = toYearMonth(l.activeTo);
    const nowNum = year * 12 + month;
    return nowNum >= from.year * 12 + from.month && nowNum <= to.year * 12 + to.month;
  });
}

/**
 * Returns true when the year is within a supported deep-dive war's range.
 * Includes WWI, WWII, and the modern conflict era (2022+).
 */
export function isDeepDiveYear(year: number): boolean {
  return (year >= 1914 && year <= 1918) || (year >= 1939 && year <= 1945) || year >= 2022;
}

export function getWarIdForYear(year: number): WarId | null {
  if (year >= 1914 && year <= 1918) return 'ww1';
  if (year >= 1939 && year <= 1945) return 'ww2';
  if (year >= 2022) return 'ukraine'; // primary modern-era context
  return null;
}

/** Whether this year uses week-level granularity (modern conflicts). */
export function isWeeklyDiveYear(year: number): boolean {
  return year >= 2022;
}

/** Month number (1-12) → short name */
export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Color for each victor side */
export const VICTOR_COLORS: Record<string, string> = {
  // Historical
  entente:      '#58a6ff',
  allied:       '#58a6ff',
  soviet:       '#f85149',
  central:      '#e05252',
  axis:         '#e05252',
  japan:        '#f0a500',
  // Modern — Ukraine conflict
  ukraine:      '#58a6ff',
  russia:       '#e05252',
  // Modern — Middle East
  israel:       '#3fb950',
  usa:          '#3fb950',
  iran:         '#f0a500',
  hamas:        '#e05252',
  houthi:       '#f0a500',
  // Modern — South Asia
  pakistan:     '#a371f7',
  ttp:          '#e05252',
  // Generic
  inconclusive: '#8b949e',
  contested:    '#8b949e',
  ongoing:      '#8b949e',
};
