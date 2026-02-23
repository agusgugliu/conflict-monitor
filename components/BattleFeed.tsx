'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords } from 'lucide-react';
import type { Battle } from '@/types/battles';
import { VICTOR_COLORS, MONTH_NAMES } from '@/lib/battles';

interface BattleFeedProps {
  battles: Battle[];
  selectedBattle: Battle | null;
  onSelectBattle: (battle: Battle) => void;
  activeYear: number;
  activeMonth: number;
}

const SIGNIFICANCE_LABEL: Record<string, string> = {
  'turning-point': '★ Turning Point',
  pivotal: '◆ Pivotal',
  major: '● Major',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function BattleFeed({ battles, selectedBattle, onSelectBattle, activeYear, activeMonth }: BattleFeedProps) {
  if (battles.length === 0) {
    return (
      <p className="text-xs text-[#8b949e] py-2 text-center italic">
        No battles recorded for {MONTH_NAMES[activeMonth - 1]} {activeYear}
      </p>
    );
  }

  // Sort by date ascending
  const sorted = [...battles].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-1.5">
      <AnimatePresence initial={false}>
        {sorted.map((battle) => {
          const color = VICTOR_COLORS[battle.victorSide] ?? '#8b949e';
          const isSelected = selectedBattle?.id === battle.id;

          return (
            <motion.button
              key={battle.id}
              layout
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
              onClick={() => onSelectBattle(battle)}
              className={`w-full text-left rounded-lg px-3 py-2 border transition-all ${
                isSelected
                  ? 'bg-[#21262d] border-[#58a6ff]/40'
                  : 'border-transparent hover:bg-[#161b22] hover:border-[#30363d]'
              }`}
            >
              <div className="flex items-start gap-2">
                {/* Faction colour dot */}
                <div
                  className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs font-semibold leading-snug truncate ${isSelected ? 'text-[#58a6ff]' : 'text-[#e6edf3]'}`}>
                      {battle.name}
                    </p>
                    {battle.significance === 'turning-point' && (
                      <span className="text-[9px] text-[#f0a500] flex-shrink-0 font-bold">★</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-[#8b949e]">{formatDate(battle.date)}</span>
                    <span className="text-[10px] text-[#8b949e]">· {battle.theater}</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </AnimatePresence>

      <div className="pt-1 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#58a6ff]" />
          <span className="text-[10px] text-[#8b949e]">Allied / Entente victory</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#e05252]" />
          <span className="text-[10px] text-[#8b949e]">Axis / Central Powers victory</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#8b949e]" />
          <span className="text-[10px] text-[#8b949e]">Inconclusive</span>
        </div>
      </div>
    </div>
  );
}

export default memo(BattleFeed);
