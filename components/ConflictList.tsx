'use client';

import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List, ChevronRight } from 'lucide-react';
import { Conflict } from '@/types/conflict';

interface ConflictListProps {
  conflicts: Conflict[];
  selectedConflict: Conflict | null;
  onSelect: (conflict: Conflict) => void;
  activeYear: number;
}

const IMPACT_DOT: Record<string, string> = {
  high: 'bg-[#e05252]',
  medium: 'bg-[#f0a500]',
  low: 'bg-[#3fb950]',
};

function ConflictList({ conflicts, selectedConflict, onSelect, activeYear }: ConflictListProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-28 left-4 z-40">
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all glass-panel ${
          isOpen
            ? 'border-[#e05252]/50 text-white'
            : 'border-[#30363d] text-[#8b949e] hover:text-white'
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <List size={16} />
        <span className="hidden sm:inline">Active Conflicts</span>
        <span className="text-xs bg-[#e05252] text-white px-1.5 py-0.5 rounded-full font-bold">
          {conflicts.length}
        </span>
      </motion.button>

      {/* List panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-12 left-0 glass-panel rounded-xl w-[calc(100vw-2rem)] max-w-xs sm:w-72 max-h-64 sm:max-h-80 overflow-hidden flex flex-col shadow-2xl"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 border-b border-[#30363d]">
              <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                Active in {activeYear}
              </h3>
            </div>
            <div className="overflow-y-auto flex-1">
              {conflicts.length === 0 ? (
                <p className="text-xs text-[#8b949e] px-4 py-6 text-center">
                  No conflicts active in {activeYear}
                </p>
              ) : (
                conflicts.map((conflict) => {
                  const isSelected = selectedConflict?.id === conflict.id;
                  return (
                    <motion.button
                      key={conflict.id}
                      onClick={() => {
                        onSelect(conflict);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors border-b border-[#30363d]/50 last:border-0 ${
                        isSelected
                          ? 'bg-[#e05252]/10'
                          : 'hover:bg-[#21262d]'
                      }`}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${IMPACT_DOT[conflict.impact]}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isSelected ? 'text-[#e05252]' : 'text-[#e6edf3]'}`}>
                          {conflict.name}
                        </p>
                        <p className="text-[10px] text-[#8b949e]">
                          {conflict.start_year ?? (conflict.start_date ? new Date(conflict.start_date).getFullYear() : '?')} –{' '}
                          {conflict.end_year != null
                            ? conflict.end_year
                            : conflict.end_date
                              ? new Date(conflict.end_date).getFullYear()
                              : 'Ongoing'}
                        </p>
                      </div>
                      <ChevronRight size={12} className="text-[#8b949e] flex-shrink-0" />
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(ConflictList);
