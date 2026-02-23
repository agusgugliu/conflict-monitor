'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, RotateCcw } from 'lucide-react';
import { FilterState, ConflictType, ImpactLevel, Region } from '@/types/conflict';

interface FilterPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: FilterState;
  onToggleType: (type: ConflictType) => void;
  onToggleImpact: (impact: ImpactLevel) => void;
  onToggleRegion: (region: Region) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const CONFLICT_TYPES: { value: ConflictType; label: string; emoji: string }[] = [
  { value: 'Interstate', label: 'Interstate', emoji: '⚔️' },
  { value: 'Civil War', label: 'Civil War', emoji: '🏴' },
  { value: 'Independence', label: 'Independence', emoji: '🗽' },
  { value: 'Coup', label: "Coup d'état", emoji: '🎖️' },
  { value: 'Event', label: 'Key Event', emoji: '⚡' },
];

const IMPACT_LEVELS: { value: ImpactLevel; label: string; color: string }[] = [
  { value: 'high', label: 'High', color: '#e05252' },
  { value: 'medium', label: 'Medium', color: '#f0a500' },
  { value: 'low', label: 'Low', color: '#3fb950' },
];

const REGIONS: { value: Region; label: string; emoji: string }[] = [
  { value: 'Europe', label: 'Europe', emoji: '🇪🇺' },
  { value: 'Americas', label: 'Americas', emoji: '🌎' },
  { value: 'Asia', label: 'Asia', emoji: '🌏' },
  { value: 'Africa', label: 'Africa', emoji: '🌍' },
  { value: 'Middle East', label: 'Middle East', emoji: '🏜️' },
  { value: 'Oceania', label: 'Oceania', emoji: '🌊' },
];

function Chip({
  active,
  onClick,
  children,
  activeClass,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeClass?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`filter-chip px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? activeClass ?? 'bg-[#e05252]/20 border-[#e05252]/50 text-[#e05252]'
          : 'bg-transparent border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function FilterPanel({
  isOpen,
  onToggle,
  filters,
  onToggleType,
  onToggleImpact,
  onToggleRegion,
  onReset,
  hasActiveFilters,
}: FilterPanelProps) {
  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={onToggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
          hasActiveFilters
            ? 'bg-[#e05252]/20 border-[#e05252]/50 text-[#e05252]'
            : 'glass-panel text-[#8b949e] hover:text-white border-[#30363d]'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title="Toggle filters"
      >
        <SlidersHorizontal size={16} />
        <span className="hidden sm:inline">Filters</span>
        {hasActiveFilters && (
          <span className="w-5 h-5 rounded-full bg-[#e05252] text-white text-[10px] flex items-center justify-center font-bold">
            {filters.types.length + filters.impacts.length + filters.regions.length}
          </span>
        )}
      </motion.button>

      {/* Filter panel dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-14 right-0 sm:left-0 sm:right-auto z-50 glass-panel rounded-xl p-4 w-72 max-w-[calc(100vw-2rem)] shadow-2xl"
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Filters</h3>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={onReset}
                    className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-white transition-colors"
                  >
                    <RotateCcw size={12} />
                    Reset
                  </button>
                )}
                <button
                  onClick={onToggle}
                  className="text-[#8b949e] hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Type filter */}
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-2 font-medium">
                Conflict Type
              </p>
              <div className="flex flex-wrap gap-2">
                {CONFLICT_TYPES.map(({ value, label, emoji }) => (
                  <Chip
                    key={value}
                    active={filters.types.includes(value)}
                    onClick={() => onToggleType(value)}
                  >
                    {emoji} {label}
                  </Chip>
                ))}
              </div>
            </div>

            {/* Impact filter */}
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-2 font-medium">
                Magnitude
              </p>
              <div className="flex flex-wrap gap-2">
                {IMPACT_LEVELS.map(({ value, label, color }) => (
                  <Chip
                    key={value}
                    active={filters.impacts.includes(value)}
                    onClick={() => onToggleImpact(value)}
                    activeClass={`border-[${color}]/50 text-[${color}]`}
                  >
                    <span style={{ color: filters.impacts.includes(value) ? color : undefined }}>
                      ● {label}
                    </span>
                  </Chip>
                ))}
              </div>
            </div>

            {/* Region filter */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#8b949e] mb-2 font-medium">
                Region
              </p>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(({ value, label, emoji }) => (
                  <Chip
                    key={value}
                    active={filters.regions.includes(value)}
                    onClick={() => onToggleRegion(value)}
                  >
                    {emoji} {label}
                  </Chip>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(FilterPanel);
