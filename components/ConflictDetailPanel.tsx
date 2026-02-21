'use client';

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  MapPin,
  Swords,
  BarChart2,
  Users,
  Skull,
} from 'lucide-react';
import { Conflict } from '@/types/conflict';

interface ConflictDetailPanelProps {
  conflict: Conflict | null;
  onClose: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  Interstate: 'Interstate War',
  'Civil War': 'Civil War',
  Independence: 'War of Independence',
};

const IMPACT_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  high: { label: 'High Impact', className: 'impact-bg-high', dot: '#e05252' },
  medium: { label: 'Medium Impact', className: 'impact-bg-medium', dot: '#f0a500' },
  low: { label: 'Low Impact', className: 'impact-bg-low', dot: '#3fb950' },
};

function ConflictDetailPanel({ conflict, onClose }: ConflictDetailPanelProps) {
  return (
    <AnimatePresence>
      {conflict && (
        <motion.div
          className="absolute top-4 right-4 z-40 glass-panel rounded-xl w-80 max-h-[calc(100vh-120px)] flex flex-col shadow-2xl overflow-hidden"
          initial={{ opacity: 0, x: 40, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          {/* Impact color stripe at top */}
          <div
            className="h-1 w-full"
            style={{
              background:
                conflict.impact === 'high'
                  ? '#e05252'
                  : conflict.impact === 'medium'
                  ? '#f0a500'
                  : '#3fb950',
            }}
          />

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1 p-5">
            {/* Close button */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-2">
                <h2 className="text-base font-bold text-white leading-snug">
                  {conflict.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 rounded-md text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] text-xs border border-[#30363d]">
                {TYPE_LABELS[conflict.type] ?? conflict.type}
              </span>
              {IMPACT_CONFIG[conflict.impact] && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs border ${IMPACT_CONFIG[conflict.impact].className}`}
                >
                  ● {IMPACT_CONFIG[conflict.impact].label}
                </span>
              )}
              <span className="px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] text-xs border border-[#30363d]">
                <MapPin size={10} className="inline mr-1" />
                {conflict.region}
              </span>
            </div>

            {/* Key facts */}
            <div className="space-y-2.5 mb-4">
              <div className="flex items-start gap-2.5">
                <Calendar size={14} className="text-[#8b949e] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#8b949e]">Duration</p>
                  <p className="text-sm text-white">
                    {new Date(conflict.start_date).getFullYear()} –{' '}
                    {conflict.end_date
                      ? new Date(conflict.end_date).getFullYear()
                      : <span className="text-[#e05252] font-medium">Ongoing</span>}
                  </p>
                </div>
              </div>

              {conflict.casualties && (
                <div className="flex items-start gap-2.5">
                  <Skull size={14} className="text-[#8b949e] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#8b949e]">Estimated Casualties</p>
                    <p className="text-sm text-white">{conflict.casualties}</p>
                  </div>
                </div>
              )}

              {conflict.belligerents && conflict.belligerents.length > 0 && (
                <div className="flex items-start gap-2.5">
                  <Users size={14} className="text-[#8b949e] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[#8b949e]">Belligerents</p>
                    <div className="space-y-1 mt-0.5">
                      {conflict.belligerents.map((side, i) => (
                        <p key={i} className="text-xs text-[#e6edf3] leading-snug">
                          {i === 0 ? '▶' : '▷'} {side}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-[#30363d] my-3" />

            {/* Summary */}
            <div className="flex items-center gap-1.5 mb-2">
              <BarChart2 size={13} className="text-[#8b949e]" />
              <p className="text-xs text-[#8b949e] uppercase tracking-wider font-medium">
                Summary
              </p>
            </div>
            <div className="space-y-2">
              {conflict.summary.split('\n\n').map((para, i) => (
                <p key={i} className="text-xs text-[#c9d1d9] leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(ConflictDetailPanel);
