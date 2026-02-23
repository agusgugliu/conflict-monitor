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
import type { Conflict } from '@/types/conflict';
import type { Battle, TheaterLabel } from '@/types/battles';
import { VICTOR_COLORS, MONTH_NAMES } from '@/lib/battles';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface ConflictMapProps {
  conflicts: Conflict[];
  selectedConflict: Conflict | null;
  onSelectConflict: (conflict: Conflict | null) => void;
  activeYear: number;
  // Deep-dive props
  isDeepDive?: boolean;
  activeMonth?: number;
  activeBattles?: Battle[];
  selectedBattle?: Battle | null;
  onSelectBattle?: (battle: Battle | null) => void;
  activeTheaterLabels?: TheaterLabel[];
}

const IMPACT_COLORS: Record<string, string> = { high: '#e05252', medium: '#f0a500', low: '#3fb950' };
const IMPACT_SIZES: Record<string, number>  = { high: 14, medium: 10, low: 8 };

const SIGNIFICANCE_SIZES: Record<string, number> = {
  'turning-point': 11,
  pivotal: 8,
  major: 6,
};

function ConflictMap({
  conflicts,
  selectedConflict,
  onSelectConflict,
  activeYear,
  isDeepDive = false,
  activeMonth = 1,
  activeBattles = [],
  selectedBattle = null,
  onSelectBattle,
  activeTheaterLabels = [],
}: ConflictMapProps) {
  const [conflictTooltip, setConflictTooltip] = useState<{ item: Conflict; x: number; y: number } | null>(null);
  const [battleTooltip,   setBattleTooltip]   = useState<{ item: Battle;   x: number; y: number } | null>(null);

  const getMousePos = (e: React.MouseEvent<SVGElement>) => {
    const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
    return rect ? { x: e.clientX - rect.left, y: e.clientY - rect.top } : null;
  };

  return (
    <div className="relative w-full h-full bg-[#0d1117]">
      {/* Deep-dive mode banner */}
      <AnimatePresence>
        {isDeepDive && (
          <motion.div
            className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-[#e05252]/40"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <span className="w-2 h-2 rounded-full bg-[#e05252] animate-pulse" />
            <span className="text-xs font-bold text-[#e05252] tracking-widest uppercase">
              Deep Dive
            </span>
            <span className="text-xs text-[#8b949e]">
              {MONTH_NAMES[activeMonth - 1]} {activeYear}
            </span>
            <span className="text-xs text-[#8b949e]">· {activeBattles.length} battles</span>
          </motion.div>
        )}
      </AnimatePresence>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [0, 20] }}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={1} minZoom={0.8} maxZoom={8}>
          {/* ── Base map ── */}
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
                    hover:   { fill: '#21262d', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* ── Theater labels ── */}
          <AnimatePresence>
            {activeTheaterLabels.map((label) => (
              <Marker
                key={`theater-${label.label}`}
                coordinates={[label.coordinates.lng, label.coordinates.lat]}
              >
                <motion.text
                  textAnchor="middle"
                  fill={label.color}
                  fontSize={7}
                  fontWeight="bold"
                  letterSpacing={1.5}
                  fillOpacity={0.7}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {label.label}
                </motion.text>
              </Marker>
            ))}
          </AnimatePresence>

          {/* ── War-level conflict markers (dimmed in deep-dive) ── */}
          <AnimatePresence>
            {conflicts.map((conflict) => {
              const size  = IMPACT_SIZES[conflict.impact] ?? 10;
              const color = IMPACT_COLORS[conflict.impact] ?? '#e05252';
              const isSelected = selectedConflict?.id === conflict.id;
              const startYear = conflict.start_year ?? (conflict.start_date ? new Date(conflict.start_date).getFullYear() : 0);
              const isNewlyStarted = startYear === activeYear;
              const dimmed = isDeepDive && !isSelected;

              return (
                <Marker
                  key={conflict.id}
                  coordinates={[conflict.coordinates.lng, conflict.coordinates.lat]}
                  onClick={() => onSelectConflict(isSelected ? null : conflict)}
                  onMouseEnter={(e) => {
                    const pos = getMousePos(e as unknown as React.MouseEvent<SVGElement>);
                    if (pos) setConflictTooltip({ item: conflict, ...pos });
                  }}
                  onMouseLeave={() => setConflictTooltip(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {(isSelected || isNewlyStarted) && !dimmed && (
                    <motion.circle
                      r={size + 4}
                      fill="transparent"
                      stroke={color}
                      strokeWidth={1.5}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 2.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                  <motion.circle
                    r={size * 1.4}
                    fill={color}
                    fillOpacity={dimmed ? 0.04 : 0.15}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.circle
                    r={size}
                    fill={color}
                    fillOpacity={dimmed ? 0.25 : 1}
                    stroke={isSelected ? '#fff' : 'rgba(0,0,0,0.4)'}
                    strokeWidth={isSelected ? 2 : 1}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: dimmed ? 0.3 : 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    whileHover={{ scale: dimmed ? 1 : 1.3 }}
                    style={{ filter: isSelected ? `drop-shadow(0 0 6px ${color})` : undefined }}
                  />
                </Marker>
              );
            })}
          </AnimatePresence>

          {/* ── Battle markers (deep-dive only) ── */}
          <AnimatePresence>
            {activeBattles.map((battle) => {
              const color = VICTOR_COLORS[battle.victorSide] ?? '#8b949e';
              const r = SIGNIFICANCE_SIZES[battle.significance] ?? 7;
              const isSel = selectedBattle?.id === battle.id;
              // Diamond = rotated square, drawn via polygon points
              const d = r;
              const pts = `0,${-d} ${d},0 0,${d} ${-d},0`;

              return (
                <Marker
                  key={battle.id}
                  coordinates={[battle.coordinates.lng, battle.coordinates.lat]}
                  onClick={() => onSelectBattle?.(isSel ? null : battle)}
                  onMouseEnter={(e) => {
                    const pos = getMousePos(e as unknown as React.MouseEvent<SVGElement>);
                    if (pos) setBattleTooltip({ item: battle, ...pos });
                  }}
                  onMouseLeave={() => setBattleTooltip(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Outer pulse for turning-point battles */}
                  {battle.significance === 'turning-point' && (
                    <motion.circle
                      r={r + 5}
                      fill="transparent"
                      stroke={color}
                      strokeWidth={1}
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                    />
                  )}
                  {/* Selected ring */}
                  {isSel && (
                    <motion.circle
                      r={r + 4}
                      fill="transparent"
                      stroke="#fff"
                      strokeWidth={1.5}
                    />
                  )}
                  {/* Diamond shape */}
                  <motion.polygon
                    points={pts}
                    fill={color}
                    fillOpacity={0.9}
                    stroke={isSel ? '#fff' : 'rgba(0,0,0,0.5)'}
                    strokeWidth={isSel ? 1.5 : 0.8}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    style={{ filter: isSel ? `drop-shadow(0 0 5px ${color})` : undefined }}
                  />
                </Marker>
              );
            })}
          </AnimatePresence>
        </ZoomableGroup>
      </ComposableMap>

      {/* ── Conflict tooltip ── */}
      <AnimatePresence>
        {conflictTooltip && (
          <motion.div
            className="absolute pointer-events-none z-50 glass-panel rounded-lg px-3 py-2 max-w-[200px]"
            style={{
              left: conflictTooltip.x + 12,
              top:  conflictTooltip.y - 10,
              transform: conflictTooltip.x > window.innerWidth * 0.7 ? 'translateX(-110%)' : undefined,
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <p className="text-xs font-semibold text-white leading-tight">{conflictTooltip.item.name}</p>
            <p className="text-xs text-[#8b949e] mt-0.5">
              {conflictTooltip.item.start_year ?? new Date(conflictTooltip.item.start_date!).getFullYear()} –{' '}
              {conflictTooltip.item.end_year != null
                ? conflictTooltip.item.end_year
                : conflictTooltip.item.end_date
                  ? new Date(conflictTooltip.item.end_date).getFullYear()
                  : 'Ongoing'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Battle tooltip ── */}
      <AnimatePresence>
        {battleTooltip && (
          <motion.div
            className="absolute pointer-events-none z-50 glass-panel rounded-lg px-3 py-2 max-w-[220px]"
            style={{
              left: battleTooltip.x + 12,
              top:  battleTooltip.y - 10,
              transform: battleTooltip.x > window.innerWidth * 0.7 ? 'translateX(-110%)' : undefined,
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <p className="text-xs font-semibold text-white leading-tight">{battleTooltip.item.name}</p>
            <p className="text-xs text-[#8b949e] mt-0.5">{battleTooltip.item.theater}</p>
            {battleTooltip.item.significance === 'turning-point' && (
              <p className="text-[10px] text-[#f0a500] mt-0.5">★ Turning Point</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Legend (adapts for deep-dive) ── */}
      <div className="absolute bottom-4 left-4 glass-panel rounded-lg p-3 space-y-1.5">
        {isDeepDive ? (
          <>
            <p className="text-xs text-[#8b949e] uppercase tracking-wider font-medium mb-2">Battles</p>
            {[
              { label: 'Allied / Entente', color: '#58a6ff' },
              { label: 'Axis / Central Powers',  color: '#e05252' },
              { label: 'Inconclusive',  color: '#8b949e' },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <svg width="16" height="16">
                  <polygon points="8,2 14,8 8,14 2,8" fill={color} fillOpacity={0.9} />
                </svg>
                <span className="text-xs text-[#e6edf3]">{label}</span>
              </div>
            ))}
            <div className="border-t border-[#30363d] my-1.5" />
            <p className="text-xs text-[#8b949e] uppercase tracking-wider font-medium mb-1">Significance</p>
            {[
              { label: 'Turning Point', size: 11 },
              { label: 'Pivotal',       size: 8  },
              { label: 'Major',         size: 6  },
            ].map(({ label, size }) => (
              <div key={label} className="flex items-center gap-2">
                <svg width="16" height="16">
                  <polygon
                    points={`8,${8-size} ${8+size},8 8,${8+size} ${8-size},8`}
                    fill="#8b949e"
                    fillOpacity={0.6}
                  />
                </svg>
                <span className="text-xs text-[#e6edf3]">{label}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <p className="text-xs text-[#8b949e] uppercase tracking-wider font-medium mb-2">Impact</p>
            {[
              { label: 'High',   color: '#e05252', size: 7 },
              { label: 'Medium', color: '#f0a500', size: 5 },
              { label: 'Low',    color: '#3fb950', size: 4 },
            ].map(({ label, color, size }) => (
              <div key={label} className="flex items-center gap-2">
                <svg width="16" height="16">
                  <circle cx="8" cy="8" r={size} fill={color} fillOpacity={0.9} />
                </svg>
                <span className="text-xs text-[#e6edf3]">{label}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Conflict / battle count badge ── */}
      <div className="absolute top-4 right-4 glass-panel rounded-full px-3 py-1.5">
        {isDeepDive ? (
          <>
            <span className="text-sm font-bold text-[#58a6ff]">{activeBattles.length}</span>
            <span className="text-xs text-[#8b949e] ml-1.5">battle{activeBattles.length !== 1 ? 's' : ''}</span>
          </>
        ) : (
          <>
            <span className="text-sm font-bold text-[#e05252]">{conflicts.length}</span>
            <span className="text-xs text-[#8b949e] ml-1.5">{conflicts.length === 1 ? 'conflict' : 'conflicts'}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default memo(ConflictMap);
