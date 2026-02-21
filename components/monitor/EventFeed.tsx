'use client';

import { ExternalLink, Calendar, Newspaper } from 'lucide-react';
import type { GeopoliticalEvent } from '@/types/geopolitical';

interface EventFeedProps {
  events: GeopoliticalEvent[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function EventFeed({ events }: EventFeedProps) {
  if (events.length === 0) return null;

  // Sort newest first
  const sorted = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-1.5 text-[10px] text-[#8b949e] uppercase tracking-wider font-medium">
        <Newspaper size={11} />
        Recent Updates
      </div>

      <div className="space-y-2.5">
        {sorted.map((event) => (
          <div
            key={event.id}
            className="pl-3 border-l-2 border-[#30363d] hover:border-[#58a6ff]/60 transition-colors"
          >
            {/* Date */}
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar size={10} className="text-[#8b949e]" />
              <span className="text-[10px] text-[#8b949e]">{formatDate(event.date)}</span>
            </div>

            {/* Headline */}
            <p className="text-xs font-semibold text-[#e6edf3] leading-snug mb-1">
              {event.headline}
            </p>

            {/* Summary */}
            <p className="text-[11px] text-[#8b949e] leading-relaxed mb-2">
              {event.summary}
            </p>

            {/* Sources — REQUIRED by design spec */}
            <div className="flex flex-wrap gap-1.5">
              {event.sources.map((source, idx) => (
                <a
                  key={idx}
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#21262d] border border-[#30363d] text-[10px] text-[#8b949e] hover:text-[#58a6ff] hover:border-[#58a6ff]/40 transition-colors"
                >
                  <ExternalLink size={9} />
                  {source.publisher}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
