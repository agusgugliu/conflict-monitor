'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Conflict, FilterState, ConflictType, ImpactLevel, Region } from '@/types/conflict';
import type { Battle, TheaterLabel } from '@/types/battles';
import { getConflictsForYear, MIN_YEAR, MAX_YEAR } from '@/lib/conflicts';
import {
  getBattlesForYearMonth,
  getBattlesForYearMonthWeek,
  getTheaterLabelsForYearMonth,
  isDeepDiveYear,
  isWeeklyDiveYear,
  getWarIdForYear,
} from '@/lib/battles';
import { ww1Battles, ww1TheaterLabels } from '@/data/ww1-battles';
import { ww2Battles, ww2TheaterLabels } from '@/data/ww2-battles';
import { ukraineEvents, ukraineTheaterLabels } from '@/data/ukraine-events';
import { iranAxisEvents, iranAxisTheaterLabels } from '@/data/iran-axis-events';
import { afghPakEvents, afghPakTheaterLabels } from '@/data/afgh-pak-events';
import { venezuelaEvents, venezuelaTheaterLabels } from '@/data/venezuela-events';

const ALL_BATTLES = [
  ...ww1Battles,
  ...ww2Battles,
  ...ukraineEvents,
  ...iranAxisEvents,
  ...afghPakEvents,
  ...venezuelaEvents,
];
const ALL_THEATER_LABELS: TheaterLabel[] = [
  ...ww1TheaterLabels,
  ...ww2TheaterLabels,
  ...ukraineTheaterLabels,
  ...iranAxisTheaterLabels,
  ...afghPakTheaterLabels,
  ...venezuelaTheaterLabels,
];

const DEFAULT_FILTERS: FilterState = { types: [], impacts: [], regions: [] };

export function useConflictStore() {
  const [activeYear, setActiveYear] = useState(MIN_YEAR);
  const [activeMonth, setActiveMonth] = useState(9); // Sep 1939 – Invasion of Poland
  const [activeWeek, setActiveWeek] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [playSpeed, setPlaySpeed] = useState(1);
  const [viewMinYear, setViewMinYearState] = useState(MIN_YEAR);
  const [viewMaxYear, setViewMaxYearState] = useState(MAX_YEAR);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Derived ──────────────────────────────────────────────────────────────

  const isDeepDive = isDeepDiveYear(activeYear);
  const isWeeklyDeepDive = isWeeklyDiveYear(activeYear);
  const activeWarId = getWarIdForYear(activeYear);

  const activeConflicts = useMemo(
    () => getConflictsForYear(activeYear, filters),
    [activeYear, filters]
  );

  const activeBattles = useMemo(() => {
    if (!isDeepDive) return [];
    if (isWeeklyDeepDive) {
      return getBattlesForYearMonthWeek(ALL_BATTLES, activeYear, activeMonth, activeWeek);
    }
    return getBattlesForYearMonth(ALL_BATTLES, activeYear, activeMonth);
  }, [activeYear, activeMonth, activeWeek, isDeepDive, isWeeklyDeepDive]);

  const activeTheaterLabels = useMemo(
    () => (isDeepDive ? getTheaterLabelsForYearMonth(ALL_THEATER_LABELS, activeYear, activeMonth) : []),
    [activeYear, activeMonth, isDeepDive]
  );

  // ── Playback ─────────────────────────────────────────────────────────────

  const stopPlay = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setIsPlaying(false);
  }, []);

  // Keep a ref to current state so the interval tick always reads fresh values
  const stateRef = useRef({ activeYear, activeMonth, activeWeek, playSpeed, viewMinYear, viewMaxYear });
  stateRef.current = { activeYear, activeMonth, activeWeek, playSpeed, viewMinYear, viewMaxYear };

  const tick = useCallback(() => {
    const { activeYear: yr, activeMonth: mo, activeWeek: wk, viewMaxYear: maxYr } = stateRef.current;
    if (isDeepDiveYear(yr)) {
      if (isWeeklyDiveYear(yr)) {
        // Modern conflicts: week-by-week
        if (wk >= 5) {
          if (mo >= 12) {
            const next = yr + 1;
            if (next > maxYr) { stopPlay(); return; }
            setActiveYear(next);
            setActiveMonth(1);
            setActiveWeek(1);
          } else {
            setActiveMonth(mo + 1);
            setActiveWeek(1);
          }
        } else {
          setActiveWeek(wk + 1);
        }
      } else {
        // Historical (WW1/WW2): month-by-month
        if (mo >= 12) {
          const next = yr + 1;
          if (next > maxYr) { stopPlay(); return; }
          setActiveYear(next);
          setActiveMonth(1);
        } else {
          setActiveMonth(mo + 1);
        }
      }
    } else {
      // Year-by-year everywhere else
      if (yr >= maxYr) { stopPlay(); return; }
      setActiveYear(yr + 1);
    }
  }, [stopPlay]);

  const startPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(true);
    intervalRef.current = setInterval(tick, 1000 / stateRef.current.playSpeed);
  }, [tick]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlay();
    } else {
      const { viewMinYear: minYr, viewMaxYear: maxYr } = stateRef.current;
      if (activeYear >= maxYr) setActiveYear(minYr);
      startPlay();
    }
  }, [isPlaying, activeYear, startPlay, stopPlay]);

  // Restart interval if speed changes while playing
  useEffect(() => {
    if (isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(tick, 1000 / playSpeed);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playSpeed]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  // Reset month+week when first entering a deep-dive year range
  const prevYearRef = useRef(activeYear);
  useEffect(() => {
    const wasDeep = isDeepDiveYear(prevYearRef.current);
    const nowDeep = isDeepDiveYear(activeYear);
    if (!wasDeep && nowDeep) {
      setActiveMonth(isWeeklyDiveYear(activeYear) ? 1 : 1);
      setActiveWeek(1);
    }
    prevYearRef.current = activeYear;
  }, [activeYear]);

  // ── View Range ────────────────────────────────────────────────────────────

  const setViewRange = useCallback((min: number, max: number) => {
    setViewMinYearState(min);
    setViewMaxYearState(max);
    setActiveYear((prev) => Math.max(min, Math.min(max, prev)));
  }, []);

  // ── Filters ───────────────────────────────────────────────────────────────

  const toggleFilterType = useCallback((type: ConflictType) => {
    setFilters((p) => ({
      ...p,
      types: p.types.includes(type) ? p.types.filter((t) => t !== type) : [...p.types, type],
    }));
  }, []);

  const toggleFilterImpact = useCallback((impact: ImpactLevel) => {
    setFilters((p) => ({
      ...p,
      impacts: p.impacts.includes(impact) ? p.impacts.filter((i) => i !== impact) : [...p.impacts, impact],
    }));
  }, []);

  const toggleFilterRegion = useCallback((region: Region) => {
    setFilters((p) => ({
      ...p,
      regions: p.regions.includes(region) ? p.regions.filter((r) => r !== region) : [...p.regions, region],
    }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const hasActiveFilters =
    filters.types.length > 0 || filters.impacts.length > 0 || filters.regions.length > 0;

  return {
    activeYear, setActiveYear,
    activeMonth, setActiveMonth,
    activeWeek, setActiveWeek,
    isDeepDive, isWeeklyDeepDive, activeWarId,
    isPlaying, togglePlay, stopPlay,
    playSpeed, setPlaySpeed,
    selectedConflict, setSelectedConflict,
    selectedBattle, setSelectedBattle,
    filters, toggleFilterType, toggleFilterImpact, toggleFilterRegion,
    resetFilters, hasActiveFilters,
    activeConflicts,
    activeBattles,
    activeTheaterLabels,
    viewMinYear,
    viewMaxYear,
    setViewRange,
  };
}
