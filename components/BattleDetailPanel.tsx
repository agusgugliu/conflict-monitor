'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Swords, MapPin, Shield, Skull, ChevronLeft } from 'lucide-react';
import type { Battle } from '@/types/battles';
import { VICTOR_COLORS, MONTH_NAMES } from '@/lib/battles';

interface BattleDetailPanelProps {
  battle: Battle | null;
  onClose: () => void;
}

const SIGNIFICANCE_CONFIG = {
  'turning-point': { label: 'Turning Point', className: 'bg-[#f0a500]/15 border-[#f0a500]/40 text-[#f0a500]' },
  pivotal:         { label: 'Pivotal Battle', className: 'bg-[#58a6ff]/15 border-[#58a6ff]/40 text-[#58a6ff]' },
  major:           { label: 'Major Battle',   className: 'bg-[#8b949e]/15 border-[#8b949e]/40 text-[#8b949e]' },
};

const VICTOR_LABEL: Record<string, string> = {
  entente:      'Entente Victory',
  allied:       'Allied Victory',
  soviet:       'Soviet Victory',
  central:      'Central Powers Victory',
  axis:         'Axis Victory',
  japan:        'Japanese Victory',
  inconclusive: 'Inconclusive',
};

const WAR_LABEL: Record<string, string> = {
  ww1: 'World War I',
  ww2: 'World War II',
};

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function BattleDetailPanel({ battle, onClose }: BattleDetailPanelProps) {
  const accentColor = battle ? (VICTOR_COLORS[battle.victorSide] ?? '#8b949e') : '#8b949e';

  return (
    <AnimatePresence>
      {battle && (
        <motion.div
          className="absolute z-40 glass-panel rounded-xl flex flex-col shadow-2xl overflow-hidden inset-x-2 bottom-2 max-h-[55vh] sm:inset-auto sm:top-4 sm:right-4 sm:w-80 sm:max-h-[calc(100vh-120px)]"
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          key={battle.id}
        >
          {/* Faction colour stripe */}
          <div className="h-1 w-full" style={{ background: accentColor }} />

          <div className="overflow-y-auto flex-1 p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 pr-2">
                {/* War badge */}
                <span
                  className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mb-1.5"
                  style={{ background: `${accentColor}25`, color: accentColor, border: `1px solid ${accentColor}50` }}
                >
                  {WAR_LABEL[battle.warId]}
                </span>
                <h2 className="text-base font-bold text-white leading-snug">{battle.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {SIGNIFICANCE_CONFIG[battle.significance] && (
                <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${SIGNIFICANCE_CONFIG[battle.significance].className}`}>
                  {battle.significance === 'turning-point' ? '★' : battle.significance === 'pivotal' ? '◆' : '●'}{' '}
                  {SIGNIFICANCE_CONFIG[battle.significance].label}
                </span>
              )}
              <span
                className="px-2 py-0.5 rounded-full text-xs border font-medium"
                style={{ background: `${accentColor}15`, borderColor: `${accentColor}40`, color: accentColor }}
              >
                {VICTOR_LABEL[battle.victorSide]}
              </span>
            </div>

            {/* Key facts */}
            <div className="space-y-2.5 mb-4">
              <div className="flex items-start gap-2.5">
                <Calendar size={14} className="text-[#8b949e] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#8b949e]">Date</p>
                  <p className="text-sm text-white">
                    {formatFullDate(battle.date)}
                    {battle.endDate && ` – ${formatFullDate(battle.endDate)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin size={14} className="text-[#8b949e] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#8b949e]">Theater</p>
                  <p className="text-sm text-white">{battle.theater}</p>
                </div>
              </div>

              {battle.casualties && (
                <div className="flex items-start gap-2.5">
                  <Skull size={14} className="text-[#8b949e] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#8b949e]">Casualties</p>
                    <p className="text-sm text-white">{battle.casualties}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2.5">
                <Swords size={14} className="text-[#8b949e] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#8b949e]">Attackers</p>
                  <p className="text-sm text-white">{battle.attackers.join(', ')}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Shield size={14} className="text-[#8b949e] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#8b949e]">Defenders</p>
                  <p className="text-sm text-white">{battle.defenders.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-[#30363d] my-3" />

            {/* Summary */}
            <p className="text-xs text-[#c9d1d9] leading-relaxed">{battle.summary}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(BattleDetailPanel);
