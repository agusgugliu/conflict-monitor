'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rss, ExternalLink, RefreshCw, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import type { NewsItem } from '@/app/api/news/route';

const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function SkeletonRow() {
  return (
    <div className="px-4 py-3 border-b border-[#30363d]/60 animate-pulse">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="h-4 w-16 rounded bg-[#21262d]" />
        <div className="h-3 w-12 rounded bg-[#21262d]" />
      </div>
      <div className="h-3.5 w-full rounded bg-[#21262d] mb-1" />
      <div className="h-3.5 w-4/5 rounded bg-[#21262d]" />
    </div>
  );
}

export default function LiveNewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Update "X ago" every minute
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const fetchNews = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setFetchedAt(data.fetchedAt ?? Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchNews();
    const id = setInterval(fetchNews, REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchNews]);

  const lastUpdated = fetchedAt ? timeAgo(new Date(fetchedAt).toISOString()) : null;

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-[#30363d] hover:bg-[#21262d]/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Rss size={14} className="text-[#e05252]" />
          <span className="text-xs font-semibold text-white uppercase tracking-wider">
            Live World News
          </span>
          {loading && <Loader2 size={12} className="text-[#8b949e] animate-spin" />}
          {!loading && !error && (
            <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[10px] text-[#8b949e] hidden sm:block">
              Updated {lastUpdated}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); fetchNews(); setLoading(true); }}
            className="p-1 rounded text-[#8b949e] hover:text-white transition-colors"
            title="Refresh news"
          >
            <RefreshCw size={12} />
          </button>
          <ChevronDown
            size={14}
            className={`text-[#8b949e] transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
          />
        </div>
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {error ? (
              <div className="flex items-center gap-2.5 px-4 py-5 text-[#8b949e]">
                <AlertCircle size={14} className="text-[#e05252] flex-shrink-0" />
                <div>
                  <p className="text-xs text-[#e05252] font-medium">Failed to load news</p>
                  <p className="text-[10px] mt-0.5">{error}</p>
                </div>
                <button
                  onClick={() => { setLoading(true); fetchNews(); }}
                  className="ml-auto text-[10px] text-[#58a6ff] hover:underline flex-shrink-0"
                >
                  Retry
                </button>
              </div>
            ) : loading ? (
              <div className="max-h-80 overflow-y-auto">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-xs text-[#8b949e] text-center">
                No news articles available at this time.
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto divide-y divide-[#30363d]/60">
                {items.map((item) => (
                  <motion.a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 px-4 py-3 hover:bg-[#21262d]/60 transition-colors group"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{
                            background: `${item.sourceColor}20`,
                            color: item.sourceColor,
                            border: `1px solid ${item.sourceColor}40`,
                          }}
                        >
                          {item.source}
                        </span>
                        <span className="text-[10px] text-[#8b949e]">
                          {timeAgo(item.publishedAt)}
                        </span>
                        {item.category && (
                          <span className="text-[10px] text-[#8b949e] hidden sm:block truncate max-w-[120px]">
                            · {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-[#e6edf3] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-[#8b949e] mt-0.5 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <ExternalLink
                      size={11}
                      className="text-[#8b949e] flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </motion.a>
                ))}
              </div>
            )}

            {/* Source credits */}
            {!loading && !error && items.length > 0 && (
              <div className="px-4 py-2 border-t border-[#30363d] flex items-center gap-3 flex-wrap">
                <span className="text-[10px] text-[#8b949e]">Sources:</span>
                {['BBC News', 'Al Jazeera', 'The Guardian'].map((src) => {
                  const count = items.filter((i) => i.source === src).length;
                  return count > 0 ? (
                    <span key={src} className="text-[10px] text-[#8b949e]">
                      {src} ({count})
                    </span>
                  ) : null;
                })}
                <span className="text-[10px] text-[#8b949e] ml-auto">
                  Auto-refreshes every 5 min
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
