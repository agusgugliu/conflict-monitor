'use client';

import { memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
} from 'lucide-react';
import { MIN_YEAR, MAX_YEAR } from '@/lib/conflicts';
import { MONTH_NAMES } from '@/lib/battles';

interface TimelineProps {
  activeYear: number;
  activeMonth: number;
  isDeepDive: boolean;
  activeWarId: 'ww1' | 'ww2' | null;
  isPlaying: boolean;
  playSpeed: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 5];
const DECADE_MARKERS = Array.from(
  { length: Math.floor((MAX_YEAR - MIN_YEAR) / 10) + 1 },
  (_, i) => MIN_YEAR + i * 10
);

const WAR_BANDS = [
  { id: 'ww1', from: 1914, to: 1918, color: '#58a6ff', label: 'WWI' },
  { id: 'ww2', from: 1939, to: 1945, color: '#e05252', label: 'WWII' },
];

const WAR_COLORS: Record<string, string> = { ww1: '#58a6ff', ww2: '#e05252' };

function formatYear(year: number): string {
  return year < 0 ? `${Math.abs(year)} BC` : String(year);
}

function Timeline({
  activeYear,
  activeMonth,
  isDeepDive,
  activeWarId,
  isPlaying,
  playSpeed,
  onYearChange,
  onMonthChange,
  onTogglePlay,
  onSpeedChange,
}: TimelineProps) {
  const progress = ((activeYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
  const warColor = activeWarId ? WAR_COLORS[activeWarId] : '#e05252';

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onYearChange(Number(e.target.value));
    },
    [onYearChange]
  );

  const stepYear = useCallback(
    (delta: number) => {
      const next = Math.max(MIN_YEAR, Math.min(MAX_YEAR, activeYear + delta));
      onYearChange(next);
    },
    [activeYear, onYearChange]
  );

  const stepMonth = useCallback(
    (delta: number) => {
      const newMonth = activeMonth + delta;
      if (newMonth < 1) {
        const prevYear = Math.max(MIN_YEAR, activeYear - 1);
        onYearChange(prevYear);
        onMonthChange(12);
      } else if (newMonth > 12) {
        const nextYear = Math.min(MAX_YEAR, activeYear + 1);
        onYearChange(nextYear);
        onMonthChange(1);
      } else {
        onMonthChange(newMonth);
      }
    },
    [activeMonth, activeYear, onYearChange, onMonthChange]
  );

  return (
    <div className="glass-panel border-t border-[#30363d] px-6 py-4 space-y-3">
      {/* Year display + controls row */}
      <div className="flex items-center gap-4">
        {/* Step back */}
        <button
          onClick={() => (isDeepDive ? stepMonth(-1) : stepYear(-10))}
          className="p-1.5 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
          title={isDeepDive ? 'Previous month' : 'Back 10 years'}
        >
          <SkipBack size={16} />
        </button>

        {/* Play/pause */}
        <motion.button
          onClick={onTogglePlay}
          className="flex items-center justify-center w-10 h-10 rounded-full text-white shadow-lg transition-colors"
          style={{ backgroundColor: warColor }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </motion.button>

        {/* Step forward */}
        <button
          onClick={() => (isDeepDive ? stepMonth(1) : stepYear(10))}
          className="p-1.5 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
          title={isDeepDive ? 'Next month' : 'Forward 10 years'}
        >
          <SkipForward size={16} />
        </button>

        {/* Year / Month display */}
        <div className="flex-1 flex justify-center">
          <AnimatePresence mode="wait">
            {isDeepDive ? (
              <motion.div
                key={`deep-${activeYear}-${activeMonth}`}
                className="text-center"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
              >
                <span
                  className="text-3xl font-bold tracking-tight tabular-nums"
                  style={{ color: warColor }}
                >
                  {MONTH_NAMES[activeMonth - 1]} {activeYear}
                </span>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
                  style={{ color: warColor, opacity: 0.7 }}
                >
                  {activeWarId === 'ww1' ? 'World War I' : 'World War II'} · Deep Dive
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
                <span className="text-4xl font-bold tracking-tight text-white tabular-nums">
                  {formatYear(activeYear)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <Gauge size={14} className="text-[#8b949e]" />
          <div className="flex gap-1">
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
        </div>
      </div>

      {/* Month scrubber (deep-dive only) */}
      <AnimatePresence>
        {isDeepDive && (
          <motion.div
            className="flex items-center gap-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {MONTH_NAMES.map((name, i) => {
              const month = i + 1;
              const isActive = month === activeMonth;
              return (
                <button
                  key={name}
                  onClick={() => onMonthChange(month)}
                  className={`flex-1 py-1 rounded text-[10px] font-medium transition-all ${
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slider + decade markers */}
      <div className="relative">
        {/* Decade labels + war labels */}
        <div className="relative h-4 mb-1">
          {DECADE_MARKERS.filter((y) => y % 500 === 0 || y === MIN_YEAR || y === MAX_YEAR).map(
            (year) => {
              const pct = ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
              return (
                <span
                  key={year}
                  className="absolute text-[10px] text-[#8b949e] transform -translate-x-1/2 whitespace-nowrap"
                  style={{ left: `${pct}%` }}
                >
                  {formatYear(year)}
                </span>
              );
            }
          )}
          {WAR_BANDS.map(({ id, from, label, color }) => {
            const midPct = (((from + (id === 'ww1' ? 2 : 3)) - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
            return (
              <span
                key={id}
                className="absolute text-[9px] font-bold transform -translate-x-1/2 top-0"
                style={{ left: `${midPct}%`, color }}
              >
                {label}
              </span>
            );
          })}
        </div>

        {/* Track with war highlight bands + progress fill */}
        <div className="relative h-2 mb-1 rounded-full overflow-hidden bg-[#30363d]">
          {WAR_BANDS.map(({ id, from, to, color }) => {
            const left = ((from - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
            const width = ((to - from) / (MAX_YEAR - MIN_YEAR)) * 100;
            return (
              <div
                key={id}
                className="absolute top-0 h-full"
                style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color, opacity: 0.3 }}
              />
            );
          })}
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
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={activeYear}
          onChange={handleSliderChange}
          className="timeline-slider"
          style={{
            background: `linear-gradient(to right, ${warColor} ${progress}%, #30363d ${progress}%)`,
          }}
        />

        {/* Decade tick marks */}
        <div className="relative h-3 mt-1">
          {DECADE_MARKERS.map((year) => {
            if (year % 50 !== 0) return null;
            const pct = ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
            const isMajor = year % 100 === 0;
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
