'use client';

import { memo } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import type {
  MonitorFilterState,
  TensionStatus,
  SeverityLevel,
  Continent,
} from '@/types/geopolitical';

interface MonitorSidebarProps {
  filters: MonitorFilterState;
  stats: {
    total: number;
    critical: number;
    elevated: number;
    watchlist: number;
    resolved: number;
  };
  hasActiveFilters: boolean;
  onToggleStatus: (s: TensionStatus) => void;
  onToggleSeverity: (s: SeverityLevel) => void;
  onToggleContinent: (c: Continent) => void;
  onSearchChange: (q: string) => void;
  onReset: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

const STATUS_OPTIONS: { value: TensionStatus; label: string; color: string; dot: string }[] = [
  { value: 'critical', label: 'Critical', color: 'border-[#e05252]/50 text-[#e05252] bg-[#e05252]/15', dot: 'bg-[#e05252]' },
  { value: 'elevated', label: 'Elevated', color: 'border-[#f0a500]/50 text-[#f0a500] bg-[#f0a500]/15', dot: 'bg-[#f0a500]' },
  { value: 'watchlist', label: 'Watchlist', color: 'border-[#58a6ff]/50 text-[#58a6ff] bg-[#58a6ff]/15', dot: 'bg-[#58a6ff]' },
  { value: 'resolved', label: 'Resolved', color: 'border-[#3fb950]/50 text-[#3fb950] bg-[#3fb950]/15', dot: 'bg-[#3fb950]' },
];

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string }[] = [
  { value: 'high', label: '▲ High' },
  { value: 'medium', label: '◆ Medium' },
  { value: 'low', label: '▼ Low' },
];

const CONTINENT_OPTIONS: { value: Continent; emoji: string }[] = [
  { value: 'Europe', emoji: '🇪🇺' },
  { value: 'Middle East', emoji: '🏜️' },
  { value: 'Asia', emoji: '🌏' },
  { value: 'Africa', emoji: '🌍' },
  { value: 'Americas', emoji: '🌎' },
  { value: 'Oceania', emoji: '🌊' },
];

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-2 font-semibold">
        {title}
      </p>
      {children}
    </div>
  );
}

function MonitorSidebar({
  filters,
  stats,
  hasActiveFilters,
  onToggleStatus,
  onToggleSeverity,
  onToggleContinent,
  onSearchChange,
  onReset,
  onExpandAll,
  onCollapseAll,
}: MonitorSidebarProps) {
  return (
    <aside className="w-60 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
      {/* Summary stats card */}
      <div className="glass-panel rounded-xl p-4">
        <p className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-3 font-semibold">
          Global Status
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[#8b949e]">Total tensions</span>
            <span className="text-sm font-bold text-white">{stats.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-xs text-[#e05252]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e05252] animate-pulse" />
              Critical
            </span>
            <span className="text-sm font-bold text-[#e05252]">{stats.critical}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-xs text-[#f0a500]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f0a500]" />
              Elevated
            </span>
            <span className="text-sm font-bold text-[#f0a500]">{stats.elevated}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-xs text-[#58a6ff]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
              Watchlist
            </span>
            <span className="text-sm font-bold text-[#58a6ff]">{stats.watchlist}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-xs text-[#3fb950]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
              Resolved
            </span>
            <span className="text-sm font-bold text-[#3fb950]">{stats.resolved}</span>
          </div>
        </div>
      </div>

      {/* Filters card */}
      <div className="glass-panel rounded-xl p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tensions..."
            className="w-full bg-[#21262d] border border-[#30363d] rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]/50 transition-colors"
          />
        </div>

        {/* Status filter */}
        <FilterSection title="Status">
          <div className="space-y-1.5">
            {STATUS_OPTIONS.map(({ value, label, color, dot }) => {
              const active = filters.statuses.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => onToggleStatus(value)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    active
                      ? color
                      : 'border-[#30363d] text-[#8b949e] bg-transparent hover:border-[#8b949e]/50 hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${active ? dot : 'bg-[#8b949e]'}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Severity filter */}
        <FilterSection title="Severity">
          <div className="flex gap-1.5">
            {SEVERITY_OPTIONS.map(({ value, label }) => {
              const active = filters.severities.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => onToggleSeverity(value)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                    active
                      ? 'bg-[#21262d] border-[#8b949e] text-white'
                      : 'border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/50'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Continent filter */}
        <FilterSection title="Continent">
          <div className="grid grid-cols-3 gap-1">
            {CONTINENT_OPTIONS.map(({ value, emoji }) => {
              const active = filters.continents.includes(value);
              return (
                <button
                  key={value}
                  onClick={() => onToggleContinent(value)}
                  className={`flex flex-col items-center gap-0.5 py-1.5 rounded-lg border text-[10px] transition-all ${
                    active
                      ? 'bg-[#21262d] border-[#8b949e] text-white'
                      : 'border-[#30363d] text-[#8b949e] hover:border-[#8b949e]/50'
                  }`}
                  title={value}
                >
                  <span className="text-base leading-none">{emoji}</span>
                  <span className="leading-none">{value.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* Reset filters */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[#e05252]/40 text-[#e05252] text-xs hover:bg-[#e05252]/10 transition-colors"
          >
            <RotateCcw size={11} />
            Clear all filters
          </button>
        )}
      </div>

      {/* Accordion controls */}
      <div className="glass-panel rounded-xl p-3">
        <p className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-2 font-semibold">
          Sections
        </p>
        <div className="flex gap-2">
          <button
            onClick={onExpandAll}
            className="flex-1 py-1.5 rounded-lg border border-[#30363d] text-[11px] text-[#8b949e] hover:text-white hover:border-[#8b949e]/50 transition-colors"
          >
            Expand all
          </button>
          <button
            onClick={onCollapseAll}
            className="flex-1 py-1.5 rounded-lg border border-[#30363d] text-[11px] text-[#8b949e] hover:text-white hover:border-[#8b949e]/50 transition-colors"
          >
            Collapse all
          </button>
        </div>
      </div>
    </aside>
  );
}

export default memo(MonitorSidebar);
