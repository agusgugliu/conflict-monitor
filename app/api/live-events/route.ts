/**
 * /api/live-events
 *
 * Fetches today's conflict-related news from the GDELT Project's free
 * Document 2.0 API (no API key required).  Results are cached server-side
 * for 1 hour so we don't hammer the external API.
 *
 * Each call aggregates multiple themed queries so the consumer gets a
 * single, deduplicated feed covering all major ongoing conflicts.
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface LiveEvent {
  id: string;
  title: string;
  url: string;
  domain: string;
  publishedAt: string;   // ISO string
  conflictTag: string;   // 'ukraine' | 'gaza' | 'iran-axis' | 'sudan' | 'myanmar' | 'general'
  conflictLabel: string; // Human-readable label, e.g. "Ukraine War"
}

// ── Query definitions ──────────────────────────────────────────────────────────
const CONFLICT_QUERIES: Array<{ tag: string; label: string; query: string }> = [
  {
    tag: 'ukraine',
    label: 'Ukraine War',
    query: 'ukraine russia war military offensive ceasefire',
  },
  {
    tag: 'gaza',
    label: 'Israel-Gaza',
    query: 'gaza israel hamas ceasefire hostage rafah',
  },
  {
    tag: 'iran-axis',
    label: 'Iran / Houthis',
    query: 'iran houthi red sea missile hezbollah attack',
  },
  {
    tag: 'sudan',
    label: 'Sudan Civil War',
    query: 'sudan rsf rapid support forces khartoum darfur war',
  },
  {
    tag: 'myanmar',
    label: 'Myanmar Conflict',
    query: 'myanmar burma junta military conflict',
  },
  {
    tag: 'taiwan',
    label: 'Taiwan Strait',
    query: 'taiwan strait china military pla exercises',
  },
];

const GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc';
const TIMESPAN   = '24h';   // Look back 24 hours
const MAX_PER_QUERY = 10;   // Articles per conflict query

// ── In-memory cache (1 hour TTL) ───────────────────────────────────────────────
let cache: { events: LiveEvent[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000;

// ── GDELT helpers ──────────────────────────────────────────────────────────────
interface GdeltArticle {
  url?: string;
  title?: string;
  seendate?: string;  // format: "20250225180000"
  domain?: string;
  language?: string;
}

interface GdeltResponse {
  articles?: GdeltArticle[];
}

function parseGdeltDate(seendate: string): string {
  // "20250225180000" → "2025-02-25T18:00:00Z"
  if (seendate.length < 14) return new Date().toISOString();
  const y  = seendate.slice(0, 4);
  const mo = seendate.slice(4, 6);
  const d  = seendate.slice(6, 8);
  const h  = seendate.slice(8, 10);
  const mi = seendate.slice(10, 12);
  const s  = seendate.slice(12, 14);
  return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
}

async function fetchGdelt(
  query: string,
  tag: string,
  label: string,
): Promise<LiveEvent[]> {
  const url = new URL(GDELT_BASE);
  url.searchParams.set('query', query);
  url.searchParams.set('mode', 'artlist');
  url.searchParams.set('format', 'json');
  url.searchParams.set('maxrecords', String(MAX_PER_QUERY));
  url.searchParams.set('sort', 'DateDesc');
  url.searchParams.set('timespan', TIMESPAN);

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': 'ConflictMonitor/1.0' },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return [];

    const data: GdeltResponse = await res.json();
    if (!data.articles) return [];

    return data.articles
      .filter((a) => a.url && a.title && a.language === 'English')
      .map((a) => ({
        id: `gdelt-${tag}-${Buffer.from(a.url!).toString('base64').slice(0, 16)}`,
        title: a.title!,
        url: a.url!,
        domain: a.domain ?? new URL(a.url!).hostname,
        publishedAt: a.seendate ? parseGdeltDate(a.seendate) : new Date().toISOString(),
        conflictTag: tag,
        conflictLabel: label,
      }));
  } catch {
    return [];
  }
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function GET() {
  // Serve from cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({
      events: cache.events,
      fetchedAt: cache.fetchedAt,
      cached: true,
      count: cache.events.length,
    });
  }

  // Fetch all conflict queries in parallel
  const results = await Promise.allSettled(
    CONFLICT_QUERIES.map(({ query, tag, label }) => fetchGdelt(query, tag, label)),
  );

  const allEvents: LiveEvent[] = results.flatMap((r) =>
    r.status === 'fulfilled' ? r.value : [],
  );

  // Deduplicate by URL + sort newest first
  const seenUrls = new Set<string>();
  const deduped = allEvents
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter((e) => {
      if (seenUrls.has(e.url)) return false;
      seenUrls.add(e.url);
      return true;
    });

  cache = { events: deduped, fetchedAt: Date.now() };

  return NextResponse.json({
    events: deduped,
    fetchedAt: cache.fetchedAt,
    cached: false,
    count: deduped.length,
  });
}
