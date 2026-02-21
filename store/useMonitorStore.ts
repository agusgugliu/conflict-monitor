'use client';

import { useState, useCallback, useMemo } from 'react';
import type {
  MonitorFilterState,
  TensionStatus,
  SeverityLevel,
  Continent,
  ConflictTension,
  ContinentSection,
} from '@/types/geopolitical';
import {
  getFilteredContinentSections,
  getSummaryStats,
} from '@/data/geopolitical-monitor';

const DEFAULT_FILTERS: MonitorFilterState = {
  statuses: [],
  severities: [],
  continents: [],
  searchQuery: '',
};

export function useMonitorStore() {
  const [filters, setFilters] = useState<MonitorFilterState>(DEFAULT_FILTERS);
  const [selectedTension, setSelectedTension] = useState<ConflictTension | null>(null);
  const [expandedContinents, setExpandedContinents] = useState<Set<Continent>>(
    new Set(['Europe', 'Middle East', 'Asia', 'Africa', 'Americas', 'Oceania'])
  );

  // ── Derived state ──────────────────────────────────────────────────────────
  const filteredSections: ContinentSection[] = useMemo(
    () => getFilteredContinentSections(filters),
    [filters]
  );

  const stats = useMemo(() => getSummaryStats(), []);

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.severities.length > 0 ||
    filters.continents.length > 0 ||
    filters.searchQuery.trim().length > 0;

  // ── Filter toggles ─────────────────────────────────────────────────────────
  const toggleStatus = useCallback((status: TensionStatus) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }));
  }, []);

  const toggleSeverity = useCallback((severity: SeverityLevel) => {
    setFilters((prev) => ({
      ...prev,
      severities: prev.severities.includes(severity)
        ? prev.severities.filter((s) => s !== severity)
        : [...prev.severities, severity],
    }));
  }, []);

  const toggleContinent = useCallback((continent: Continent) => {
    setFilters((prev) => ({
      ...prev,
      continents: prev.continents.includes(continent)
        ? prev.continents.filter((c) => c !== continent)
        : [...prev.continents, continent],
    }));
  }, []);

  const setSearchQuery = useCallback((q: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: q }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // ── Continent accordion ────────────────────────────────────────────────────
  const toggleContinent_accordion = useCallback((continent: Continent) => {
    setExpandedContinents((prev) => {
      const next = new Set(prev);
      if (next.has(continent)) {
        next.delete(continent);
      } else {
        next.add(continent);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedContinents(
      new Set(['Europe', 'Middle East', 'Asia', 'Africa', 'Americas', 'Oceania'])
    );
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedContinents(new Set());
  }, []);

  return {
    // Filters
    filters,
    hasActiveFilters,
    toggleStatus,
    toggleSeverity,
    toggleContinent,
    setSearchQuery,
    resetFilters,
    // Data
    filteredSections,
    stats,
    // Selection
    selectedTension,
    setSelectedTension,
    // Accordion
    expandedContinents,
    toggleContinent_accordion,
    expandAll,
    collapseAll,
  };
}
