'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rss, ExternalLink, RefreshCw, ChevronDown, AlertCircle, Loader2, Zap } from 'lucide-react';
import type { NewsItem } from '@/app/api/news/route';
import type { LiveEvent } from '@/app/api/live-events/route';

const RSS_REFRESH_MS  = 15 * 60 * 1000; // 15 minutes
const GDELT_REFRESH_MS = 60 * 60 * 1000; // 1 hour

// Conflict tag → display label + colour
const CONFLICT_TAG_META: Record<string, { label: string; color: string }> = {
  ukraine:    { label: 'Ukraine',     color: '#58a6ff' },
  gaza:       { label: 'Gaza',        color: '#e05252' },
  'iran-axis':{ label: 'Iran/Houthi', color: '#f0a500' },
  russia:     { label: 'Russia',      color: '#e05252' },
  taiwan:     { label: 'Taiwan',      color: '#3fb950' },
  sudan:      { label: 'Sudan',       color: '#c7772a' },
  myanmar:    { label: 'Myanmar',     color: '#9e6ac7' },
  general:    { label: 'Conflict',    color: '#8b949e' },
};

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

function ConflictTagBadge({ tag }: { tag: string }) {
  const meta = CONFLICT_TAG_META[tag] ?? CONFLICT_TAG_META.general;
  return (
    <span
      className="text-[10px] font-bold px-1.5 py-0.5 rounded"
      style={{
        background: `${meta.color}20`,
        color: meta.color,
        border: `1px solid ${meta.color}40`,
      }}
    >
      {meta.label}
    </span>
  );
}

// ── RSS News Tab ───────────────────────────────────────────────────────────────
function RssTab({ conflictOnly }: { conflictOnly: boolean }) {
  const [items, setItems]       = useState<NewsItem[]>([]);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setError(null);
    try {
      const url = conflictOnly ? '/api/news?conflict=1' : '/api/news';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.items ?? []);
      setFetchedAt(data.fetchedAt ?? Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, [conflictOnly]);

  useEffect(() => {
    setLoading(true);
    fetchNews();
    const id = setInterval(fetchNews, RSS_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchNews]);

  const lastUpdated = fetchedAt ? timeAgo(new Date(fetchedAt).toISOString()) : null;

  return (
    <div>
      {/* Sub-header */}
      <div className="px-4 py-2 border-b border-[#30363d]/60 flex items-center justify-between">
        <span className="text-[10px] text-[#8b949e]">
          {conflictOnly ? 'Filtered to conflict-related headlines' : 'All world news from 5 sources'}
        </span>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-[#8b949e]">Updated {lastUpdated}</span>
          )}
          <button
            onClick={() => { setLoading(true); fetchNews(); }}
            className="p-1 rounded text-[#8b949e] hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>

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
        <div className="max-h-72 overflow-y-auto">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <p className="px-4 py-6 text-xs text-[#8b949e] text-center">
          No news articles available at this time.
        </p>
      ) : (
        <div className="max-h-72 overflow-y-auto divide-y divide-[#30363d]/60">
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
                  {item.conflictTag && <ConflictTagBadge tag={item.conflictTag} />}
                  <span className="text-[10px] text-[#8b949e]">{timeAgo(item.publishedAt)}</span>
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

      {!loading && !error && items.length > 0 && (
        <div className="px-4 py-2 border-t border-[#30363d] flex items-center gap-3 flex-wrap">
          <span className="text-[10px] text-[#8b949e]">Sources: BBC · Al Jazeera · The Guardian · Reuters · RFE/RL</span>
          <span className="text-[10px] text-[#8b949e] ml-auto">Auto-refreshes every 15 min</span>
        </div>
      )}
    </div>
  );
}

// ── GDELT Live Events Tab ──────────────────────────────────────────────────────
function GdeltTab() {
  const [events, setEvents]     = useState<LiveEvent[]>([]);
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/live-events');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(data.events ?? []);
      setFetchedAt(data.fetchedAt ?? Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load live events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const id = setInterval(fetchEvents, GDELT_REFRESH_MS);
    return () => clearInterval(id);
  }, [fetchEvents]);

  const lastUpdated = fetchedAt ? timeAgo(new Date(fetchedAt).toISOString()) : null;

  // Collect unique conflict tags present in results
  const presentTags = Array.from(new Set(events.map((e) => e.conflictTag)));
  const filtered = activeFilter ? events.filter((e) => e.conflictTag === activeFilter) : events;

  return (
    <div>
      {/* Sub-header */}
      <div className="px-4 py-2 border-b border-[#30363d]/60 flex items-center justify-between">
        <span className="text-[10px] text-[#8b949e]">
          Real-time conflict events from GDELT — last 24 h
        </span>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[10px] text-[#8b949e]">Updated {lastUpdated}</span>
          )}
          <button
            onClick={() => { setLoading(true); fetchEvents(); }}
            className="p-1 rounded text-[#8b949e] hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={11} />
          </button>
        </div>
      </div>

      {/* Conflict tag filters */}
      {!loading && !error && presentTags.length > 0 && (
        <div className="px-4 py-2 border-b border-[#30363d]/40 flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveFilter(null)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
              activeFilter === null
                ? 'bg-[#30363d] border-[#58a6ff] text-white'
                : 'border-[#30363d] text-[#8b949e] hover:border-[#8b949e]'
            }`}
          >
            All ({events.length})
          </button>
          {presentTags.map((tag) => {
            const meta = CONFLICT_TAG_META[tag] ?? CONFLICT_TAG_META.general;
            const count = events.filter((e) => e.conflictTag === tag).length;
            return (
              <button
                key={tag}
                onClick={() => setActiveFilter(activeFilter === tag ? null : tag)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors`}
                style={{
                  background: activeFilter === tag ? `${meta.color}25` : 'transparent',
                  borderColor: activeFilter === tag ? meta.color : '#30363d',
                  color: activeFilter === tag ? meta.color : '#8b949e',
                }}
              >
                {meta.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {error ? (
        <div className="flex items-center gap-2.5 px-4 py-5 text-[#8b949e]">
          <AlertCircle size={14} className="text-[#e05252] flex-shrink-0" />
          <div>
            <p className="text-xs text-[#e05252] font-medium">Failed to load live events</p>
            <p className="text-[10px] mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => { setLoading(true); fetchEvents(); }}
            className="ml-auto text-[10px] text-[#58a6ff] hover:underline flex-shrink-0"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="max-h-72 overflow-y-auto">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="px-4 py-6 text-xs text-[#8b949e] text-center">
          No live events available — GDELT may be temporarily unavailable.
        </p>
      ) : (
        <div className="max-h-72 overflow-y-auto divide-y divide-[#30363d]/60">
          {filtered.map((event) => (
            <motion.a
              key={event.id}
              href={event.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 px-4 py-3 hover:bg-[#21262d]/60 transition-colors group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <ConflictTagBadge tag={event.conflictTag} />
                  <span className="text-[10px] text-[#8b949e]">{event.domain}</span>
                  <span className="text-[10px] text-[#8b949e]">{timeAgo(event.publishedAt)}</span>
                </div>
                <p className="text-xs font-medium text-[#e6edf3] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                  {event.title}
                </p>
              </div>
              <ExternalLink
                size={11}
                className="text-[#8b949e] flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.a>
          ))}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="px-4 py-2 border-t border-[#30363d] flex items-center gap-3">
          <span className="text-[10px] text-[#8b949e]">
            Source: GDELT Project (gdeltproject.org) — free, no API key
          </span>
          <span className="text-[10px] text-[#8b949e] ml-auto">Auto-refreshes every hour</span>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
type Tab = 'conflict' | 'all' | 'live';

export default function LiveNewsFeed() {
  const [activeTab, setActiveTab] = useState<Tab>('conflict');
  const [collapsed, setCollapsed] = useState(false);

  const tabs: Array<{ id: Tab; label: string; icon?: React.ReactNode }> = [
    { id: 'conflict', label: 'Conflict News' },
    { id: 'live',     label: 'Live Events', icon: <Zap size={10} className="text-[#f0a500]" /> },
    { id: 'all',      label: 'All News' },
  ];

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
            Live News Feed
          </span>
          <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulse" />
        </div>
        <ChevronDown
          size={14}
          className={`text-[#8b949e] transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {/* Tab bar */}
            <div className="flex border-b border-[#30363d]">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium transition-colors border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-[#58a6ff] text-[#58a6ff]'
                      : 'border-transparent text-[#8b949e] hover:text-[#e6edf3]'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'conflict' && <RssTab conflictOnly={true} />}
            {activeTab === 'all'      && <RssTab conflictOnly={false} />}
            {activeTab === 'live'     && <GdeltTab />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
