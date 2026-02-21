'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { ContinentSection, ConflictTension, Continent } from '@/types/geopolitical';
import TensionCard from './TensionCard';

interface ContinentAccordionProps {
  section: ContinentSection;
  isExpanded: boolean;
  onToggle: (continent: Continent) => void;
  selectedTension: ConflictTension | null;
  onSelectTension: (t: ConflictTension | null) => void;
}

const CONTINENT_META: Record<
  Continent,
  { emoji: string; color: string; criticalColor: string }
> = {
  Europe: { emoji: '🇪🇺', color: '#58a6ff', criticalColor: '#e05252' },
  'Middle East': { emoji: '🏜️', color: '#f0a500', criticalColor: '#e05252' },
  Asia: { emoji: '🌏', color: '#bc8cff', criticalColor: '#e05252' },
  Africa: { emoji: '🌍', color: '#3fb950', criticalColor: '#e05252' },
  Americas: { emoji: '🌎', color: '#39d353', criticalColor: '#e05252' },
  Oceania: { emoji: '🌊', color: '#58a6ff', criticalColor: '#e05252' },
};

function ContinentAccordion({
  section,
  isExpanded,
  onToggle,
  selectedTension,
  onSelectTension,
}: ContinentAccordionProps) {
  const meta = CONTINENT_META[section.continent];
  const criticalCount = section.tensions.filter((t) => t.status === 'critical').length;
  const elevatedCount = section.tensions.filter((t) => t.status === 'elevated').length;

  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d] bg-[#0d1117]">
      {/* Accordion header */}
      <button
        onClick={() => onToggle(section.continent)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#161b22] transition-colors text-left"
      >
        {/* Expand/collapse chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronRight size={16} className="text-[#8b949e]" />
        </motion.div>

        {/* Continent emoji + name */}
        <span className="text-xl">{meta.emoji}</span>
        <h2 className="text-base font-bold text-white flex-1">{section.continent}</h2>

        {/* Status pills summary */}
        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e05252]/15 border border-[#e05252]/40 text-[#e05252] text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e05252] animate-pulse" />
              {criticalCount} Critical
            </span>
          )}
          {elevatedCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f0a500]/15 border border-[#f0a500]/40 text-[#f0a500] text-xs font-medium">
              {elevatedCount} Elevated
            </span>
          )}
          <span className="text-xs text-[#8b949e] font-medium">
            {section.tensions.length} tension{section.tensions.length !== 1 ? 's' : ''}
          </span>
        </div>
      </button>

      {/* Accordion body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">
              {/* Color separator */}
              <div
                className="h-px mb-4 rounded-full opacity-30"
                style={{ background: meta.color }}
              />

              {/* Tension cards grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {section.tensions.map((tension) => (
                  <TensionCard
                    key={tension.id}
                    tension={tension}
                    isSelected={selectedTension?.id === tension.id}
                    onSelect={onSelectTension}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(ContinentAccordion);
