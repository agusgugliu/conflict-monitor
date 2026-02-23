'use client';

import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
} from 'lucide-react';
import { MIN_YEAR, MAX_YEAR } from '@/lib/conflicts';

interface TimelineProps {
  activeYear: number;
  isPlaying: boolean;
  playSpeed: number;
  onYearChange: (year: number) => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
}

const SPEED_OPTIONS = [0.5, 1, 2, 5];
const DECADE_MARKERS = Array.from(
  { length: Math.floor((MAX_YEAR - MIN_YEAR) / 10) + 1 },
  (_, i) => MIN_YEAR + i * 10
);

function Timeline({
  activeYear,
  isPlaying,
  playSpeed,
  onYearChange,
  onTogglePlay,
  onSpeedChange,
}: TimelineProps) {
  const progress = ((activeYear - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;

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

  return (
    <div className="glass-panel border-t border-[#30363d] px-6 py-4 space-y-3">
      {/* Year display + controls row */}
      <div className="flex items-center gap-4">
        {/* Step back */}
        <button
          onClick={() => stepYear(-10)}
          className="p-1.5 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
          title="Back 10 years"
        >
          <SkipBack size={16} />
        </button>

        {/* Play/pause */}
        <motion.button
          onClick={onTogglePlay}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#e05252] hover:bg-[#c94242] text-white shadow-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </motion.button>

        {/* Step forward */}
        <button
          onClick={() => stepYear(10)}
          className="p-1.5 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
          title="Forward 10 years"
        >
          <SkipForward size={16} />
        </button>

        {/* Year display */}
        <div className="flex-1 flex justify-center">
          <motion.div
            key={activeYear}
            className="text-center"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <span className="text-4xl font-bold tracking-tight text-white tabular-nums">
              {activeYear < 0 ? `${Math.abs(activeYear)} BC` : activeYear}
            </span>
          </motion.div>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <Gauge size={14} className="text-[#8b949e]" />
          <div className="flex gap-1">
            {SPEED_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${playSpeed === s
                    ? 'bg-[#e05252] text-white'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
                  }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Slider + decade markers */}
      <div className="relative">
        {/* Decade markers */}
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
                  {year < 0 ? `${Math.abs(year)} BC` : year}
                </span>
              );
            }
          )}
        </div>

        {/* Progress fill overlay */}
        <div className="relative h-1 mb-1">
          <div className="absolute inset-0 rounded-full bg-[#30363d]" />
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-[#e05252] to-[#f0a500]"
            style={{ width: `${progress}%` }}
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
            background: `linear-gradient(to right, #e05252 ${progress}%, #30363d ${progress}%)`,
          }}
        />

        {/* Decade tick marks */}
        <div className="relative h-3 mt-1">
          {DECADE_MARKERS.map((year) => {
            if (year % 50 !== 0) return null; // Don't render every decade, it's too thick
            const pct = ((year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR)) * 100;
            const isMajor = year % 100 === 0;
            return (
              <div
                key={year}
                className={`absolute transform -translate-x-1/2 ${isMajor ? 'h-2 bg-[#8b949e]' : 'h-1 bg-[#30363d]'
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
