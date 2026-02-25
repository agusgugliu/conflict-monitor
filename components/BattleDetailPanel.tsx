'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Swords, MapPin, Shield, Skull, ChevronLeft, Zap, Radio } from 'lucide-react';
import type { Battle } from '@/types/battles';
import { VICTOR_COLORS, MONTH_NAMES } from '@/lib/battles';

interface BattleDetailPanelProps {
  battle: Battle | null;
  onClose: () => void;
}

const SIGNIFICANCE_CONFIG = {
  'turning-point': { label: 'Turning Point', className: 'bg-[#f0a500]/15 border-[#f0a500]/40 text-[#f0a500]' },
  pivotal:         { label: 'Pivotal Event', className: 'bg-[#58a6ff]/15 border-[#58a6ff]/40 text-[#58a6ff]' },
  major:           { label: 'Major Event',   className: 'bg-[#8b949e]/15 border-[#8b949e]/40 text-[#8b949e]' },
};

const VICTOR_LABEL: Record<string, string> = {
  // Historical
  entente:      'Entente Victory',
  allied:       'Allied Victory',
  soviet:       'Soviet Victory',
  central:      'Central Powers Victory',
  axis:         'Axis Victory',
  japan:        'Japanese Victory',
  // Modern — Ukraine
  russia:       'Russian Advance',
  ukraine:      'Ukrainian Advance',
  // Modern — Middle East
  israel:       'Israeli Operation',
  usa:          'US-led Action',
  iran:         'Iranian Strike',
  hamas:        'Hamas Attack',
  houthi:       'Houthi Strike',
  // Modern — South Asia / Venezuela
  pakistan:     'Pakistani Operation',
  ttp:          'TTP Attack',
  // Generic
  inconclusive: 'Inconclusive',
  contested:    'Contested / Disputed',
  ongoing:      'Ongoing',
};

const WAR_LABEL: Record<string, string> = {
  ww1:         'World War I',
  ww2:         'World War II',
  ukraine:     'Russia–Ukraine War',
  'iran-axis': 'Middle East Conflict',
  'afgh-pak':  'Afghan-Pakistani Crisis',
  venezuela:   'Venezuela Crisis',
};

const EVENT_TYPE_LABEL: Record<string, string> = {
  battle:        'Ground Battle',
  advance:       'Territorial Advance',
  retreat:       'Tactical Withdrawal',
  airstrike:     'Airstrike',
  missile:       'Missile / Drone Strike',
  ceasefire:     'Ceasefire / Agreement',
  diplomatic:    'Diplomatic Development',
  assassination: 'Assassination',
  arrest:        'Arrest / Legal Action',
  protest:       'Civil Unrest / Protest',
};

const EVENT_TYPE_COLOR: Record<string, string> = {
  battle:        '#e05252',
  advance:       '#58a6ff',
  retreat:       '#f0a500',
  airstrike:     '#e05252',
  missile:       '#e05252',
  ceasefire:     '#3fb950',
  diplomatic:    '#a371f7',
  assassination: '#e05252',
  arrest:        '#f0a500',
  protest:       '#f0a500',
};

const MODERN_WARS = new Set(['ukraine', 'iran-axis', 'afgh-pak', 'venezuela']);

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function BattleDetailPanel({ battle, onClose }: BattleDetailPanelProps) {
  const accentColor = battle ? (VICTOR_COLORS[battle.victorSide] ?? '#8b949e') : '#8b949e';
  const isModern = battle ? MODERN_WARS.has(battle.warId) : false;
  const eventColor = battle?.eventType ? (EVENT_TYPE_COLOR[battle.eventType] ?? accentColor) : accentColor;

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
          {/* Accent colour stripe */}
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
                  {WAR_LABEL[battle.warId] ?? battle.warId.toUpperCase()}
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
              {/* Event type badge (modern conflicts) */}
              {isModern && battle.eventType && (
                <span
                  className="px-2 py-0.5 rounded-full text-xs border font-medium"
                  style={{
                    background: `${eventColor}15`,
                    borderColor: `${eventColor}40`,
                    color: eventColor,
                  }}
                >
                  {battle.eventType === 'advance' ? '▲' :
                   battle.eventType === 'retreat' ? '▼' :
                   battle.eventType === 'airstrike' ? '✈' :
                   battle.eventType === 'missile' ? '⚡' :
                   battle.eventType === 'ceasefire' ? '☮' :
                   battle.eventType === 'diplomatic' ? '🤝' :
                   battle.eventType === 'assassination' ? '◆' :
                   battle.eventType === 'protest' ? '✊' : '●'}{' '}
                  {EVENT_TYPE_LABEL[battle.eventType]}
                </span>
              )}
              {/* Significance badge */}
              {!isModern && SIGNIFICANCE_CONFIG[battle.significance] && (
                <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${SIGNIFICANCE_CONFIG[battle.significance].className}`}>
                  {battle.significance === 'turning-point' ? '★' : battle.significance === 'pivotal' ? '◆' : '●'}{' '}
                  {SIGNIFICANCE_CONFIG[battle.significance].label}
                </span>
              )}
              {isModern && SIGNIFICANCE_CONFIG[battle.significance] && (
                <span className={`px-2 py-0.5 rounded-full text-xs border font-medium ${SIGNIFICANCE_CONFIG[battle.significance].className}`}>
                  {battle.significance === 'turning-point' ? '★' : battle.significance === 'pivotal' ? '◆' : '●'}{' '}
                  {SIGNIFICANCE_CONFIG[battle.significance].label}
                </span>
              )}
              <span
                className="px-2 py-0.5 rounded-full text-xs border font-medium"
                style={{ background: `${accentColor}15`, borderColor: `${accentColor}40`, color: accentColor }}
              >
                {VICTOR_LABEL[battle.victorSide] ?? battle.victorSide}
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
                  <p className="text-xs text-[#8b949e]">Location / Theater</p>
                  <p className="text-sm text-white">{battle.theater}</p>
                </div>
              </div>

              {battle.casualties && (
                <div className="flex items-start gap-2.5">
                  <Skull size={14} className="text-[#8b949e] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#8b949e]">Casualties / Impact</p>
                    <p className="text-sm text-white">{battle.casualties}</p>
                  </div>
                </div>
              )}

              {battle.attackers.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <Swords size={14} className="text-[#8b949e] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#8b949e]">{isModern ? 'Initiating Force' : 'Attackers'}</p>
                    <p className="text-sm text-white">{battle.attackers.join(', ')}</p>
                  </div>
                </div>
              )}

              {battle.defenders.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <Shield size={14} className="text-[#8b949e] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#8b949e]">{isModern ? 'Responding Force' : 'Defenders'}</p>
                    <p className="text-sm text-white">{battle.defenders.join(', ')}</p>
                  </div>
                </div>
              )}
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
