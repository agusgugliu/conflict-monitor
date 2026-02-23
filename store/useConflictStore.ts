'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Conflict, FilterState, ConflictType, ImpactLevel, Region } from '@/types/conflict';
import type { Battle, TheaterLabel } from '@/types/battles';
import { getConflictsForYear, MIN_YEAR, MAX_YEAR } from '@/lib/conflicts';
import {
  getBattlesForYearMonth,
  getTheaterLabelsForYearMonth,
  isDeepDiveYear,
  getWarIdForYear,
} from '@/lib/battles';
import { ww1Battles, ww1TheaterLabels } from '@/data/ww1-battles';
import { ww2Battles, ww2TheaterLabels } from '@/data/ww2-battles';

const ALL_BATTLES = [...ww1Battles, ...ww2Battles];
const ALL_THEATER_LABELS: TheaterLabel[] = [...ww1TheaterLabels, ...ww2TheaterLabels];

const DEFAULT_FILTERS: FilterState = { types: [], impacts: [], regions: [] };

export function useConflictStore() {
  const [activeYear, setActiveYear] = useState(MIN_YEAR);
  const [activeMonth, setActiveMonth] = useState(9); // Sep 1939 – Invasion of Poland
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
  const activeWarId = getWarIdForYear(activeYear);

  const activeConflicts = useMemo(
    () => getConflictsForYear(activeYear, filters),
    [activeYear, filters]
  );

  const activeBattles = useMemo(
    () => (isDeepDive ? getBattlesForYearMonth(ALL_BATTLES, activeYear, activeMonth) : []),
    [activeYear, activeMonth, isDeepDive]
  );

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
  const stateRef = useRef({ activeYear, activeMonth, playSpeed, viewMinYear, viewMaxYear });
  stateRef.current = { activeYear, activeMonth, playSpeed, viewMinYear, viewMaxYear };

  const tick = useCallback(() => {
    const { activeYear: yr, activeMonth: mo, viewMaxYear: maxYr } = stateRef.current;
    if (isDeepDiveYear(yr)) {
      // Month-by-month inside a deep-dive war
      if (mo >= 12) {
        const next = yr + 1;
        if (next > maxYr) { stopPlay(); return; }
        setActiveYear(next);
        setActiveMonth(1);
      } else {
        setActiveMonth(mo + 1);
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

  // Reset month to Jan when first entering a deep-dive year range
  const prevYearRef = useRef(activeYear);
  useEffect(() => {
    const wasDeep = isDeepDiveYear(prevYearRef.current);
    const nowDeep = isDeepDiveYear(activeYear);
    if (!wasDeep && nowDeep) setActiveMonth(1);
    prevYearRef.current = activeYear;
  }, [activeYear]);

  // ── View Range ────────────────────────────────────────────────────────────

  const setViewRange = useCallback((min: number, max: number) => {
    setViewMinYearState(min);
    setViewMaxYearState(max);
    // Clamp active year to the new range
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
    isDeepDive, activeWarId,
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
