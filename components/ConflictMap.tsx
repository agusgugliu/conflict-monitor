'use client';

import { memo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { Conflict } from '@/types/conflict';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface ConflictMapProps {
  conflicts: Conflict[];
  selectedConflict: Conflict | null;
  onSelectConflict: (conflict: Conflict | null) => void;
  activeYear: number;
}

const IMPACT_COLORS: Record<string, string> = {
  high: '#e05252',
  medium: '#f0a500',
  low: '#3fb950',
};

const IMPACT_SIZES: Record<string, number> = {
  high: 14,
  low: 8,
  medium: 10,
};

function ConflictMap({
  conflicts,
  selectedConflict,
  onSelectConflict,
  activeYear,
}: ConflictMapProps) {
  const [tooltip, setTooltip] = useState<{
    conflict: Conflict;
    x: number;
    y: number;
  } | null>(null);

  return (
    <div className="relative w-full h-full bg-[#0d1117]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 130,
          center: [0, 20],
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={8}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1c2333"
                  stroke="#30363d"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#21262d', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          <AnimatePresence>
            {conflicts.map((conflict) => {
              const size = IMPACT_SIZES[conflict.impact] ?? 10;
              const color = IMPACT_COLORS[conflict.impact] ?? '#e05252';
              const isSelected = selectedConflict?.id === conflict.id;
              const startYear = new Date(conflict.start_date).getFullYear();
              const isNewlyStarted = startYear === activeYear;

              return (
                <Marker
                  key={conflict.id}
                  coordinates={[conflict.coordinates.lng, conflict.coordinates.lat]}
                  onClick={() =>
                    onSelectConflict(isSelected ? null : conflict)
                  }
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGElement)
                      .closest('svg')
                      ?.getBoundingClientRect();
                    if (rect) {
                      setTooltip({
                        conflict,
                        x: (e as unknown as MouseEvent).clientX - rect.left,
                        y: (e as unknown as MouseEvent).clientY - rect.top,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer pulse ring */}
                  {(isSelected || isNewlyStarted) && (
                    <motion.circle
                      r={size + 4}
                      fill="transparent"
                      stroke={color}
                      strokeWidth={1.5}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  )}

                  {/* Continuous soft pulse for all markers */}
                  <motion.circle
                    r={size * 1.4}
                    fill={color}
                    fillOpacity={0.15}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: Math.random() * 2,
                    }}
                  />

                  {/* Main dot */}
                  <motion.circle
                    r={size}
                    fill={color}
                    stroke={isSelected ? '#fff' : 'rgba(0,0,0,0.4)'}
                    strokeWidth={isSelected ? 2 : 1}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                      opacity: { duration: 0.3 },
                    }}
                    whileHover={{ scale: 1.3 }}
                    style={{ filter: isSelected ? `drop-shadow(0 0 6px ${color})` : undefined }}
                  />
                </Marker>
              );
            })}
          </AnimatePresence>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            className="absolute pointer-events-none z-50 glass-panel rounded-lg px-3 py-2 max-w-[200px]"
            style={{
              left: tooltip.x + 12,
              top: tooltip.y - 10,
              transform: tooltip.x > window.innerWidth * 0.7 ? 'translateX(-110%)' : undefined,
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <p className="text-xs font-semibold text-white leading-tight">
              {tooltip.conflict.name}
            </p>
            <p className="text-xs text-[#8b949e] mt-0.5">
              {new Date(tooltip.conflict.start_date).getFullYear()} –{' '}
              {tooltip.conflict.end_date
                ? new Date(tooltip.conflict.end_date).getFullYear()
                : 'Ongoing'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 glass-panel rounded-lg p-3 space-y-1.5">
        <p className="text-xs text-[#8b949e] uppercase tracking-wider font-medium mb-2">
          Impact
        </p>
        {[
          { label: 'High', color: '#e05252', size: 7 },
          { label: 'Medium', color: '#f0a500', size: 5 },
          { label: 'Low', color: '#3fb950', size: 4 },
        ].map(({ label, color, size }) => (
          <div key={label} className="flex items-center gap-2">
            <svg width="16" height="16">
              <circle cx="8" cy="8" r={size} fill={color} fillOpacity={0.9} />
            </svg>
            <span className="text-xs text-[#e6edf3]">{label}</span>
          </div>
        ))}
      </div>

      {/* Conflict count badge */}
      <div className="absolute top-4 right-4 glass-panel rounded-full px-3 py-1.5">
        <span className="text-sm font-bold text-[#e05252]">{conflicts.length}</span>
        <span className="text-xs text-[#8b949e] ml-1.5">
          {conflicts.length === 1 ? 'conflict' : 'conflicts'}
        </span>
      </div>
    </div>
  );
}

export default memo(ConflictMap);
