import type { Battle, TheaterLabel } from '@/types/battles';

// ── Helper ───────────────────────────────────────────────────────────────────

function toYearMonth(iso: string): { year: number; month: number } {
  const d = new Date(iso);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

/**
 * Returns battles that were underway at the given year/month.
 * A battle is visible from its start date until (endDate + 2 months) to
 * keep it on screen briefly after it concludes.
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
 */
export function isDeepDiveYear(year: number): boolean {
  return (year >= 1914 && year <= 1918) || (year >= 1939 && year <= 1945);
}

export function getWarIdForYear(year: number): 'ww1' | 'ww2' | null {
  if (year >= 1914 && year <= 1918) return 'ww1';
  if (year >= 1939 && year <= 1945) return 'ww2';
  return null;
}

/** Month number (1-12) → short name */
export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** Color for each victor side */
export const VICTOR_COLORS: Record<string, string> = {
  entente: '#58a6ff',
  allied:  '#58a6ff',
  soviet:  '#f85149',
  central: '#e05252',
  axis:    '#e05252',
  japan:   '#f0a500',
  inconclusive: '#8b949e',
};
