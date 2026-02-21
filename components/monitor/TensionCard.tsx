'use client';

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Clock, Tag } from 'lucide-react';
import type { ConflictTension } from '@/types/geopolitical';
import StatusBadge from './StatusBadge';
import EventFeed from './EventFeed';

interface TensionCardProps {
  tension: ConflictTension;
  isSelected: boolean;
  onSelect: (t: ConflictTension | null) => void;
}

const SEVERITY_BAR: Record<string, { width: string; color: string }> = {
  high: { width: 'w-full', color: 'bg-[#e05252]' },
  medium: { width: 'w-2/3', color: 'bg-[#f0a500]' },
  low: { width: 'w-1/3', color: 'bg-[#3fb950]' },
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function TensionCard({ tension, isSelected, onSelect }: TensionCardProps) {
  const [eventsOpen, setEventsOpen] = useState(false);
  const bar = SEVERITY_BAR[tension.severity];

  const handleCardClick = () => {
    onSelect(isSelected ? null : tension);
  };

  return (
    <motion.div
      layout
      className={`glass-panel rounded-xl overflow-hidden transition-all cursor-pointer ${
        isSelected ? 'ring-1 ring-[#58a6ff]/50' : 'hover:border-[#8b949e]/30'
      }`}
      onClick={handleCardClick}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      {/* Severity bar at top */}
      <div className="h-0.5 w-full bg-[#21262d]">
        <div className={`h-full ${bar.width} ${bar.color} transition-all`} />
      </div>

      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <StatusBadge status={tension.status} size="sm" pulse />
              <span className="text-[10px] text-[#8b949e] border border-[#30363d] rounded px-1.5 py-0.5">
                {tension.severity === 'high' ? '▲ High' : tension.severity === 'medium' ? '◆ Med' : '▼ Low'} severity
              </span>
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">{tension.name}</h3>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-[#8b949e] flex-shrink-0 mt-0.5">
            <Clock size={10} />
            {formatRelative(tension.lastUpdated)}
          </div>
        </div>

        {/* Description */}
        <p className="text-[11px] text-[#8b949e] leading-relaxed mb-3 line-clamp-3">
          {tension.description}
        </p>

        {/* Countries — grouped by continent — required display */}
        <div className="mb-3">
          <p className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1.5 font-medium">
            Involved parties
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tension.countries.map((country) => (
              <span
                key={country.name}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#21262d] border border-[#30363d] text-[11px] text-[#c9d1d9]"
                title={country.role}
              >
                <span>{country.flag}</span>
                <span>{country.name}</span>
                <span className="text-[#8b949e]">· {country.role}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Tags */}
        {tension.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tension.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-[#8b949e] bg-[#161b22]"
              >
                <Tag size={8} />
                {tag}
              </span>
            ))}
            {tension.tags.length > 4 && (
              <span className="text-[10px] text-[#8b949e]">+{tension.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Events toggle */}
        {tension.events.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEventsOpen((o) => !o);
            }}
            className="flex items-center gap-1.5 text-[11px] text-[#58a6ff] hover:text-white transition-colors w-full"
          >
            <motion.div
              animate={{ rotate: eventsOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={13} />
            </motion.div>
            {eventsOpen ? 'Hide' : 'Show'} {tension.events.length} update
            {tension.events.length !== 1 ? 's' : ''}
          </button>
        )}

        {/* Events feed */}
        <AnimatePresence>
          {eventsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pt-1">
                <div className="border-t border-[#30363d] mt-3" />
                <EventFeed events={tension.events} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default memo(TensionCard);
