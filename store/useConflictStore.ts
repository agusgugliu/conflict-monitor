'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Conflict, FilterState, ConflictType, ImpactLevel, Region } from '@/types/conflict';
import { getConflictsForYear, MIN_YEAR, MAX_YEAR } from '@/lib/conflicts';

const DEFAULT_FILTERS: FilterState = {
  types: [],
  impacts: [],
  regions: [],
};

export function useConflictStore() {
  const [activeYear, setActiveYear] = useState(1939);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [playSpeed, setPlaySpeed] = useState(1); // years per second
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeConflicts = getConflictsForYear(activeYear, filters);

  const stopPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const startPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsPlaying(true);
    intervalRef.current = setInterval(() => {
      setActiveYear((prev) => {
        if (prev >= MAX_YEAR) {
          stopPlay();
          return MAX_YEAR;
        }
        return prev + 1;
      });
    }, 1000 / playSpeed);
  }, [playSpeed, stopPlay]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stopPlay();
    } else {
      if (activeYear >= MAX_YEAR) {
        setActiveYear(MIN_YEAR);
      }
      startPlay();
    }
  }, [isPlaying, activeYear, startPlay, stopPlay]);

  // Restart interval when speed changes while playing
  useEffect(() => {
    if (isPlaying) {
      startPlay();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playSpeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const toggleFilterType = useCallback((type: ConflictType) => {
    setFilters((prev) => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type],
    }));
  }, []);

  const toggleFilterImpact = useCallback((impact: ImpactLevel) => {
    setFilters((prev) => ({
      ...prev,
      impacts: prev.impacts.includes(impact)
        ? prev.impacts.filter((i) => i !== impact)
        : [...prev.impacts, impact],
    }));
  }, []);

  const toggleFilterRegion = useCallback((region: Region) => {
    setFilters((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.types.length > 0 || filters.impacts.length > 0 || filters.regions.length > 0;

  return {
    activeYear,
    setActiveYear,
    isPlaying,
    togglePlay,
    stopPlay,
    playSpeed,
    setPlaySpeed,
    selectedConflict,
    setSelectedConflict,
    filters,
    toggleFilterType,
    toggleFilterImpact,
    toggleFilterRegion,
    resetFilters,
    hasActiveFilters,
    activeConflicts,
  };
}
