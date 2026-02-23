'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { useConflictStore } from '@/store/useConflictStore';
import Timeline from '@/components/Timeline';
import FilterPanel from '@/components/FilterPanel';
import ConflictDetailPanel from '@/components/ConflictDetailPanel';
import ConflictList from '@/components/ConflictList';
import Navigation from '@/components/Navigation';
import BattleDetailPanel from '@/components/BattleDetailPanel';

// Dynamically import map to avoid SSR issues with react-simple-maps
const ConflictMap = dynamic(() => import('@/components/ConflictMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#e05252] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#8b949e]">Loading map...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [filterOpen, setFilterOpen] = useState(false);

  const {
    activeYear,
    setActiveYear,
    activeMonth,
    setActiveMonth,
    isDeepDive,
    activeWarId,
    isPlaying,
    togglePlay,
    playSpeed,
    setPlaySpeed,
    selectedConflict,
    setSelectedConflict,
    selectedBattle,
    setSelectedBattle,
    filters,
    toggleFilterType,
    toggleFilterImpact,
    toggleFilterRegion,
    resetFilters,
    hasActiveFilters,
    activeConflicts,
    activeBattles,
    activeTheaterLabels,
    viewMinYear,
    viewMaxYear,
    setViewRange,
  } = useConflictStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      {/* Header */}
      <header className="glass-panel border-b border-[#30363d] px-4 py-3 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <Globe size={20} className="text-[#e05252]" />
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              Historical Conflict Map
            </h1>
            <p className="text-[10px] text-[#8b949e] mt-0.5">
              Interactive atlas of global conflicts 1800–2026
            </p>
          </div>
        </div>

        {/* Right side: nav + filters */}
        <div className="flex items-center gap-2">
          <Navigation />
          <div className="h-4 w-px bg-[#30363d]" />
          <div className="relative">
            <FilterPanel
              isOpen={filterOpen}
              onToggle={() => setFilterOpen((o) => !o)}
              filters={filters}
              onToggleType={toggleFilterType}
              onToggleImpact={toggleFilterImpact}
              onToggleRegion={toggleFilterRegion}
              onReset={resetFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </div>
      </header>

      {/* Map area */}
      <main className="flex-1 relative overflow-hidden">
        <ConflictMap
          conflicts={activeConflicts}
          selectedConflict={selectedConflict}
          onSelectConflict={setSelectedConflict}
          activeYear={activeYear}
          isDeepDive={isDeepDive}
          activeMonth={activeMonth}
          activeBattles={activeBattles}
          selectedBattle={selectedBattle}
          onSelectBattle={setSelectedBattle}
          activeTheaterLabels={activeTheaterLabels}
        />

        {/* Conflict detail panel — shown when no battle is selected */}
        {!selectedBattle && (
          <ConflictDetailPanel
            conflict={selectedConflict}
            onClose={() => setSelectedConflict(null)}
            isDeepDive={isDeepDive}
            activeBattles={activeBattles}
            selectedBattle={selectedBattle}
            onSelectBattle={setSelectedBattle}
            activeYear={activeYear}
            activeMonth={activeMonth}
          />
        )}

        {/* Battle detail panel — shown when a battle is selected */}
        <BattleDetailPanel
          battle={selectedBattle}
          onClose={() => setSelectedBattle(null)}
        />

        {/* Conflict list (bottom-left) */}
        <ConflictList
          conflicts={activeConflicts}
          selectedConflict={selectedConflict}
          onSelect={setSelectedConflict}
          activeYear={activeYear}
        />
      </main>

      {/* Timeline */}
      <footer className="flex-shrink-0 z-30">
        <Timeline
          activeYear={activeYear}
          activeMonth={activeMonth}
          isDeepDive={isDeepDive}
          activeWarId={activeWarId}
          isPlaying={isPlaying}
          playSpeed={playSpeed}
          viewMinYear={viewMinYear}
          viewMaxYear={viewMaxYear}
          onYearChange={setActiveYear}
          onMonthChange={setActiveMonth}
          onTogglePlay={togglePlay}
          onSpeedChange={setPlaySpeed}
          onViewRangeChange={setViewRange}
        />
      </footer>
    </div>
  );
}
