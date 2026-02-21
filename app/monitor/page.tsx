'use client';

import { Radio, Globe } from 'lucide-react';
import Link from 'next/link';
import { useMonitorStore } from '@/store/useMonitorStore';
import Navigation from '@/components/Navigation';
import MonitorSidebar from '@/components/monitor/MonitorSidebar';
import ContinentAccordion from '@/components/monitor/ContinentAccordion';

export default function MonitorPage() {
  const {
    filters,
    hasActiveFilters,
    toggleStatus,
    toggleSeverity,
    toggleContinent,
    setSearchQuery,
    resetFilters,
    filteredSections,
    stats,
    selectedTension,
    setSelectedTension,
    expandedContinents,
    toggleContinent_accordion,
    expandAll,
    collapseAll,
  } = useMonitorStore();

  const totalVisible = filteredSections.reduce((sum, s) => sum + s.tensions.length, 0);

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#e6edf3] overflow-hidden">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="glass-panel border-b border-[#30363d] px-4 py-3 flex items-center justify-between flex-shrink-0 z-20">
        {/* Brand + nav */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <Radio size={18} className="text-[#e05252]" />
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                Geopolitical Conflict Monitor
              </h1>
              <p className="text-[10px] text-[#8b949e] mt-0.5">
                Real-time global tensions dashboard · Mock data
              </p>
            </div>
          </div>
          <div className="h-5 w-px bg-[#30363d]" />
          <Navigation />
        </div>

        {/* Right: last updated + quick link to map */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-[#8b949e] hidden sm:block">
            Last updated: Feb 21, 2026
          </span>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#8b949e] hover:text-white border border-[#30363d] hover:border-[#8b949e]/50 transition-colors"
          >
            <Globe size={13} />
            <span className="hidden sm:inline">Historical Map</span>
          </Link>
        </div>
      </header>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 border-r border-[#30363d] p-4 overflow-y-auto">
          <MonitorSidebar
            filters={filters}
            stats={stats}
            hasActiveFilters={hasActiveFilters}
            onToggleStatus={toggleStatus}
            onToggleSeverity={toggleSeverity}
            onToggleContinent={toggleContinent}
            onSearchChange={setSearchQuery}
            onReset={resetFilters}
            onExpandAll={expandAll}
            onCollapseAll={collapseAll}
          />
        </div>

        {/* Main scrollable content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">
            {/* Content header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white">
                  Active Tensions by Continent
                </h2>
                <p className="text-xs text-[#8b949e] mt-0.5">
                  {totalVisible} tension{totalVisible !== 1 ? 's' : ''} shown
                  {hasActiveFilters && (
                    <span className="text-[#e05252] ml-1">· filtered</span>
                  )}
                </p>
              </div>

              {/* Mobile filter hint */}
              <p className="text-xs text-[#8b949e] lg:hidden">
                Filters available on larger screens
              </p>
            </div>

            {/* Continent sections — NEVER a flat list */}
            {filteredSections.length === 0 ? (
              <div className="glass-panel rounded-xl p-12 text-center">
                <p className="text-[#8b949e] text-sm">
                  No tensions match the current filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-3 text-xs text-[#58a6ff] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              filteredSections.map((section) => (
                <ContinentAccordion
                  key={section.continent}
                  section={section}
                  isExpanded={expandedContinents.has(section.continent)}
                  onToggle={toggleContinent_accordion}
                  selectedTension={selectedTension}
                  onSelectTension={setSelectedTension}
                />
              ))
            )}

            {/* Footer note */}
            <div className="pt-4 pb-8 text-center">
              <p className="text-[11px] text-[#8b949e]">
                Data is mock/illustrative only · Every event includes its cited source ·{' '}
                <Link href="/" className="text-[#58a6ff] hover:underline">
                  Switch to Historical Map →
                </Link>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
