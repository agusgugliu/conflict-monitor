import conflictsData from '@/data/conflicts.json';
import { Conflict, FilterState } from '@/types/conflict';

export const allConflicts: Conflict[] = conflictsData as Conflict[];

export const MIN_YEAR = -1500;
export const MAX_YEAR = 2026;

export function getConflictsForYear(year: number, filters: FilterState): Conflict[] {
  return allConflicts.filter((conflict) => {
    const startYear = new Date(conflict.start_date).getFullYear();
    const endYear = conflict.end_date ? new Date(conflict.end_date).getFullYear() : MAX_YEAR;

    // Active during this year
    const isActive = startYear <= year && endYear >= year;
    if (!isActive) return false;

    // Type filter (empty = all)
    if (filters.types.length > 0 && !filters.types.includes(conflict.type)) return false;

    // Impact filter
    if (filters.impacts.length > 0 && !filters.impacts.includes(conflict.impact)) return false;

    // Region filter
    if (filters.regions.length > 0 && !filters.regions.includes(conflict.region)) return false;

    return true;
  });
}

export function getYearRange(): { min: number; max: number } {
  return { min: MIN_YEAR, max: MAX_YEAR };
}
