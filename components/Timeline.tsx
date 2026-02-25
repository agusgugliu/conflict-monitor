'use client';

import { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
  ChevronsLeft,
  ChevronsRight,
  CalendarRange,
  X,
} from 'lucide-react';
import { MIN_YEAR, MAX_YEAR } from '@/lib/conflicts';
import { MONTH_NAMES } from '@/lib/battles';
import type { WarId } from '@/types/battles';

interface TimelineProps {
  activeYear: number;
  activeMonth: number;
  activeWeek: number;
  isDeepDive: boolean;
  isWeeklyDeepDive: boolean;
  activeWarId: WarId | null;
  isPlaying: boolean;
  playSpeed: number;
  viewMinYear: number;
  viewMaxYear: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onWeekChange: (week: number) => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  onViewRangeChange: (min: number, max: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 5];
const WEEK_LABELS = ['W1', 'W2', 'W3', 'W4', 'W5'];

const WAR_BANDS = [
  { id: 'ww1', from: 1914, to: 1918, color: '#58a6ff', label: 'WWI' },
  { id: 'ww2', from: 1939, to: 1945, color: '#e05252', label: 'WWII' },
  { id: 'modern', from: 2022, to: 2026, color: '#3fb950', label: 'Modern' },
];

const WAR_COLORS: Record<string, string> = {
  ww1: '#58a6ff',
  ww2: '#e05252',
  ukraine: '#3fb950',
  'iran-axis': '#3fb950',
  'afgh-pak': '#3fb950',
  venezuela: '#3fb950',
};

const WAR_LABELS: Record<string, string> = {
  ww1: 'World War I',
  ww2: 'World War II',
  ukraine: 'Modern Conflicts',
};

const PRESET_RANGES = [
  { label: 'All Time', min: MIN_YEAR, max: MAX_YEAR },
  { label: '1800+', min: 1800, max: MAX_YEAR },
  { label: '1900+', min: 1900, max: MAX_YEAR },
  { label: '20th C', min: 1900, max: 1999 },
  { label: 'WWI Era', min: 1910, max: 1925 },
  { label: 'WWII Era', min: 1935, max: 1950 },
  { label: 'Modern', min: 2020, max: MAX_YEAR },
];

function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : String(year);
}

function Timeline({
  activeYear,
  activeMonth,
  activeWeek,
  isDeepDive,
  isWeeklyDeepDive,
  activeWarId,
  isPlaying,
  playSpeed,
  viewMinYear,
  viewMaxYear,
  onYearChange,
  onMonthChange,
  onWeekChange,
  onTogglePlay,
  onSpeedChange,
  onViewRangeChange,
}: TimelineProps) {
  const [rangeOpen, setRangeOpen] = useState(false);
  const [fromInput, setFromInput] = useState(String(viewMinYear));
  const [toInput, setToInput] = useState(String(viewMaxYear));

  useEffect(() => { setFromInput(String(viewMinYear)); }, [viewMinYear]);
  useEffect(() => { setToInput(String(viewMaxYear)); }, [viewMaxYear]);

  const yearRange = viewMaxYear - viewMinYear;
  const progress = yearRange > 0 ? Math.max(0, Math.min(100, ((activeYear - viewMinYear) / yearRange) * 100)) : 0;
  const warColor = activeWarId ? (WAR_COLORS[activeWarId] ?? '#e05252') : '#e05252';
  const hasCustomRange = viewMinYear !== MIN_YEAR || viewMaxYear !== MAX_YEAR;

  const decadeMarkers = useMemo(() => {
    const markers: number[] = [];
    const first = Math.ceil(viewMinYear / 10) * 10;
    for (let y = first; y <= viewMaxYear; y += 10) {
      markers.push(y);
    }
    return markers;
  }, [viewMinYear, viewMaxYear]);

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => { onYearChange(Number(e.target.value)); },
    [onYearChange]
  );

  const stepYear = useCallback(
    (delta: number) => {
      const next = Math.max(viewMinYear, Math.min(viewMaxYear, activeYear + delta));
      onYearChange(next);
    },
    [activeYear, viewMinYear, viewMaxYear, onYearChange]
  );

  const stepCentury = useCallback(
    (delta: number) => stepYear(delta * 100),
    [stepYear]
  );

  const stepMonth = useCallback(
    (delta: number) => {
      const newMonth = activeMonth + delta;
      if (newMonth < 1) {
        onYearChange(Math.max(viewMinYear, activeYear - 1));
        onMonthChange(12);
      } else if (newMonth > 12) {
        onYearChange(Math.min(viewMaxYear, activeYear + 1));
        onMonthChange(1);
      } else {
        onMonthChange(newMonth);
      }
    },
    [activeMonth, activeYear, viewMinYear, viewMaxYear, onYearChange, onMonthChange]
  );

  const stepWeek = useCallback(
    (delta: number) => {
      const newWeek = activeWeek + delta;
      if (newWeek < 1) {
        // Go back a month, land on week 5
        const newMonth = activeMonth - 1;
        if (newMonth < 1) {
          onYearChange(Math.max(viewMinYear, activeYear - 1));
          onMonthChange(12);
        } else {
          onMonthChange(newMonth);
        }
        onWeekChange(5);
      } else if (newWeek > 5) {
        // Go forward a month, land on week 1
        const newMonth = activeMonth + 1;
        if (newMonth > 12) {
          onYearChange(Math.min(viewMaxYear, activeYear + 1));
          onMonthChange(1);
        } else {
          onMonthChange(newMonth);
        }
        onWeekChange(1);
      } else {
        onWeekChange(newWeek);
      }
    },
    [activeWeek, activeMonth, activeYear, viewMinYear, viewMaxYear, onYearChange, onMonthChange, onWeekChange]
  );

  const cycleSpeed = useCallback(() => {
    const idx = SPEED_OPTIONS.indexOf(playSpeed);
    onSpeedChange(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length]);
  }, [playSpeed, onSpeedChange]);

  const commitRange = useCallback(() => {
    const from = parseInt(fromInput, 10);
    const to = parseInt(toInput, 10);
    if (!isNaN(from) && !isNaN(to) && from < to) {
      const clampedFrom = Math.max(MIN_YEAR, Math.min(from, MAX_YEAR - 1));
      const clampedTo = Math.min(MAX_YEAR, Math.max(to, MIN_YEAR + 1));
      if (clampedFrom < clampedTo) onViewRangeChange(clampedFrom, clampedTo);
    }
  }, [fromInput, toInput, onViewRangeChange]);

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => { if (e.key === 'Enter') commitRange(); },
    [commitRange]
  );

  // In weekly mode, SkipBack/Forward navigate by week; otherwise by month (deep-dive) or year
  const handleBack = useCallback(() => {
    if (isWeeklyDeepDive) stepWeek(-1);
    else if (isDeepDive) stepMonth(-1);
    else stepYear(-10);
  }, [isWeeklyDeepDive, isDeepDive, stepWeek, stepMonth, stepYear]);

  const handleForward = useCallback(() => {
    if (isWeeklyDeepDive) stepWeek(1);
    else if (isDeepDive) stepMonth(1);
    else stepYear(10);
  }, [isWeeklyDeepDive, isDeepDive, stepWeek, stepMonth, stepYear]);

  const backTitle = isWeeklyDeepDive ? 'Previous week' : isDeepDive ? 'Previous month' : 'Back 10 years';
  const forwardTitle = isWeeklyDeepDive ? 'Next week' : isDeepDive ? 'Next month' : 'Forward 10 years';

  return (
    <div className="glass-panel border-t border-[#30363d] px-3 sm:px-6 py-2 sm:py-4 space-y-2 sm:space-y-3 relative">

      {/* Year Range Panel */}
      <AnimatePresence>
        {rangeOpen && (
          <motion.div
            className="absolute bottom-full mb-2 right-2 sm:right-4 glass-panel rounded-xl p-4 w-72 max-w-[calc(100vw-1rem)] shadow-2xl z-50"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Year Range</h3>
              <button onClick={() => setRangeOpen(false)} className="text-[#8b949e] hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1">
                <p className="text-[10px] text-[#8b949e] mb-1 uppercase tracking-wider">From</p>
                <input
                  type="number"
                  value={fromInput}
                  onChange={(e) => setFromInput(e.target.value)}
                  onBlur={commitRange}
                  onKeyDown={handleInputKeyDown}
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  className="w-full bg-[#21262d] border border-[#30363d] rounded px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-[#58a6ff] transition-colors"
                />
              </div>
              <span className="text-[#8b949e] mt-5 flex-shrink-0">→</span>
              <div className="flex-1">
                <p className="text-[10px] text-[#8b949e] mb-1 uppercase tracking-wider">To</p>
                <input
                  type="number"
                  value={toInput}
                  onChange={(e) => setToInput(e.target.value)}
                  onBlur={commitRange}
                  onKeyDown={handleInputKeyDown}
                  min={MIN_YEAR}
                  max={MAX_YEAR}
                  className="w-full bg-[#21262d] border border-[#30363d] rounded px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-[#58a6ff] transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_RANGES.map((preset) => {
                const isActive = preset.min === viewMinYear && preset.max === viewMaxYear;
                return (
                  <button
                    key={preset.label}
                    onClick={() => onViewRangeChange(preset.min, preset.max)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all ${
                      isActive
                        ? 'bg-[#58a6ff]/20 border-[#58a6ff]/50 text-[#58a6ff]'
                        : 'bg-transparent border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls row */}
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-0.5 sm:gap-1">
          <button
            onClick={() => stepCentury(-1)}
            className="p-1 sm:p-1.5 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            title="Back 100 years"
          >
            <ChevronsLeft size={15} />
          </button>

          <button
            onClick={handleBack}
            className="p-1 sm:p-1.5 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            title={backTitle}
          >
            <SkipBack size={15} />
          </button>

          <motion.button
            onClick={onTogglePlay}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white shadow-lg transition-colors mx-0.5"
            style={{ backgroundColor: warColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </motion.button>

          <button
            onClick={handleForward}
            className="p-1 sm:p-1.5 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            title={forwardTitle}
          >
            <SkipForward size={15} />
          </button>

          <button
            onClick={() => stepCentury(1)}
            className="p-1 sm:p-1.5 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
            title="Forward 100 years"
          >
            <ChevronsRight size={15} />
          </button>
        </div>

        {/* Year / Month / Week display */}
        <div className="flex-1 flex justify-center">
          <AnimatePresence mode="wait">
            {isDeepDive ? (
              <motion.div
                key={`deep-${activeYear}-${activeMonth}-${activeWeek}`}
                className="text-center"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <span
                  className="text-xl sm:text-3xl font-bold tracking-tight tabular-nums"
                  style={{ color: warColor }}
                >
                  {isWeeklyDeepDive ? `Wk ${activeWeek} · ` : ''}{MONTH_NAMES[activeMonth - 1]} {activeYear}
                </span>
                <p
                  className="hidden sm:block text-[10px] font-bold uppercase tracking-widest mt-0.5"
                  style={{ color: warColor, opacity: 0.7 }}
                >
                  {WAR_LABELS[activeWarId ?? ''] ?? 'Deep Dive'} · Deep Dive
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={`year-${activeYear}`}
                className="text-center"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <span className="text-2xl sm:text-4xl font-bold tracking-tight text-white tabular-nums">
                  {formatYear(activeYear)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Speed + Range */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile: single cycling speed button */}
          <button
            onClick={cycleSpeed}
            className="sm:hidden px-2 py-0.5 rounded text-xs font-medium text-white"
            style={{ backgroundColor: warColor }}
            title="Change playback speed"
          >
            {playSpeed}x
          </button>

          {/* Desktop: full speed selector */}
          <div className="hidden sm:flex items-center gap-1">
            <Gauge size={14} className="text-[#8b949e]" />
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                  playSpeed === s
                    ? 'text-white'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
                }`}
                style={playSpeed === s ? { backgroundColor: warColor } : undefined}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Year range toggle */}
          <button
            onClick={() => setRangeOpen((o) => !o)}
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 rounded text-xs font-medium border transition-all ${
              rangeOpen || hasCustomRange
                ? 'bg-[#58a6ff]/20 border-[#58a6ff]/50 text-[#58a6ff]'
                : 'bg-transparent border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#8b949e]'
            }`}
            title="Set year range"
          >
            <CalendarRange size={13} />
            <span className="hidden sm:inline text-[11px]">Range</span>
          </button>
        </div>
      </div>

      {/* Month scrubber (all deep-dive modes) */}
      <AnimatePresence>
        {isDeepDive && (
          <motion.div
            className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-0.5 sm:gap-1 min-w-max sm:min-w-0">
              {MONTH_NAMES.map((name, i) => {
                const month = i + 1;
                const isActive = month === activeMonth;
                return (
                  <button
                    key={name}
                    onClick={() => onMonthChange(month)}
                    className={`min-w-[2.5rem] sm:flex-1 sm:min-w-0 py-1 rounded text-[10px] font-medium transition-all ${
                      isActive
                        ? 'text-white'
                        : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
                    }`}
                    style={isActive ? { backgroundColor: warColor } : undefined}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Week scrubber (modern deep-dive only) */}
      <AnimatePresence>
        {isWeeklyDeepDive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-[#8b949e] uppercase tracking-wider flex-shrink-0">Week</span>
              <div className="flex gap-1 flex-1">
                {WEEK_LABELS.map((label, i) => {
                  const week = i + 1;
                  const isActive = week === activeWeek;
                  return (
                    <button
                      key={label}
                      onClick={() => onWeekChange(week)}
                      className={`flex-1 py-0.5 rounded text-[11px] font-medium border transition-all ${
                        isActive
                          ? 'text-white border-transparent'
                          : 'text-[#8b949e] border-[#30363d] hover:text-white hover:border-[#8b949e]'
                      }`}
                      style={isActive ? { backgroundColor: warColor, borderColor: warColor } : undefined}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slider + markers */}
      <div className="relative">
        <div className="relative h-4 mb-1">
          {decadeMarkers
            .filter((y) => {
              const span = yearRange;
              if (span <= 100) return y % 10 === 0;
              if (span <= 300) return y % 50 === 0;
              if (span <= 1000) return y % 100 === 0;
              return y % 500 === 0 || y === viewMinYear || y === viewMaxYear;
            })
            .map((year) => {
              const pct = yearRange > 0 ? ((year - viewMinYear) / yearRange) * 100 : 0;
              if (pct < 0 || pct > 100) return null;
              return (
                <span
                  key={year}
                  className="absolute text-[10px] text-[#8b949e] transform -translate-x-1/2 whitespace-nowrap"
                  style={{ left: `${pct}%` }}
                >
                  {formatYear(year)}
                </span>
              );
            })}

          {WAR_BANDS.filter((b) => b.to >= viewMinYear && b.from <= viewMaxYear).map(
            ({ id, from, to, label, color }) => {
              const midYear = (Math.max(from, viewMinYear) + Math.min(to, viewMaxYear)) / 2;
              const midPct = yearRange > 0 ? ((midYear - viewMinYear) / yearRange) * 100 : 0;
              if (midPct < 2 || midPct > 98) return null;
              return (
                <span
                  key={id}
                  className="absolute text-[9px] font-bold transform -translate-x-1/2 top-0"
                  style={{ left: `${midPct}%`, color }}
                >
                  {label}
                </span>
              );
            }
          )}
        </div>

        <div className="relative h-2 mb-1 rounded-full overflow-hidden bg-[#30363d]">
          {WAR_BANDS.filter((b) => b.to >= viewMinYear && b.from <= viewMaxYear).map(
            ({ id, from, to, color }) => {
              const clampedFrom = Math.max(from, viewMinYear);
              const clampedTo = Math.min(to, viewMaxYear);
              const left = yearRange > 0 ? ((clampedFrom - viewMinYear) / yearRange) * 100 : 0;
              const width = yearRange > 0 ? ((clampedTo - clampedFrom) / yearRange) * 100 : 0;
              return (
                <div
                  key={id}
                  className="absolute top-0 h-full"
                  style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color, opacity: 0.3 }}
                />
              );
            }
          )}
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(to right, ${warColor}, ${warColor}99)`,
            }}
            transition={{ duration: 0.05 }}
          />
        </div>

        <input
          type="range"
          min={viewMinYear}
          max={viewMaxYear}
          value={activeYear}
          onChange={handleSliderChange}
          className="timeline-slider"
          style={{
            background: `linear-gradient(to right, ${warColor} ${progress}%, #30363d ${progress}%)`,
          }}
        />

        <div className="relative h-3 mt-1">
          {decadeMarkers.map((year) => {
            const span = yearRange;
            const tickInterval = span <= 100 ? 10 : span <= 500 ? 50 : span <= 2000 ? 100 : 500;
            if (year % tickInterval !== 0) return null;
            const pct = yearRange > 0 ? ((year - viewMinYear) / yearRange) * 100 : 0;
            if (pct < 0 || pct > 100) return null;
            const isMajor = year % (tickInterval * 5) === 0 || (tickInterval >= 100 && year % 500 === 0);
            return (
              <div
                key={year}
                className={`absolute transform -translate-x-1/2 ${
                  isMajor ? 'h-2 bg-[#8b949e]' : 'h-1 bg-[#30363d]'
                } w-px`}
                style={{ left: `${pct}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default memo(Timeline);
