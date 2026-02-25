#!/usr/bin/env node
/**
 * scripts/refresh-events.mjs
 *
 * Daily conflict event refresher — pulls today's conflict news from the free
 * GDELT Project API and writes the results to data/live-events.json.
 *
 * This file is designed to be run once per day (e.g. via cron or GitHub
 * Actions) so the conflict map always has fresh events without requiring the
 * server to call GDELT on every request.
 *
 * Usage:
 *   node scripts/refresh-events.mjs
 *
 * Cron example (runs at 06:00 UTC daily):
 *   0 6 * * * cd /path/to/conflict-monitor && node scripts/refresh-events.mjs
 *
 * GitHub Actions example:
 *   - name: Refresh daily conflict events
 *     run: node scripts/refresh-events.mjs
 *
 * Output: data/live-events.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'data', 'live-events.json');

// ── Conflict query definitions ─────────────────────────────────────────────────
const CONFLICT_QUERIES = [
  {
    tag: 'ukraine',
    label: 'Ukraine War',
    color: '#58a6ff',
    query: 'ukraine russia war military offensive ceasefire',
  },
  {
    tag: 'gaza',
    label: 'Israel-Gaza',
    color: '#e05252',
    query: 'gaza israel hamas ceasefire hostage rafah',
  },
  {
    tag: 'iran-axis',
    label: 'Iran / Houthis',
    color: '#f0a500',
    query: 'iran houthi red sea missile hezbollah attack',
  },
  {
    tag: 'sudan',
    label: 'Sudan Civil War',
    color: '#c7772a',
    query: 'sudan rsf rapid support forces khartoum darfur war',
  },
  {
    tag: 'myanmar',
    label: 'Myanmar Conflict',
    color: '#9e6ac7',
    query: 'myanmar burma junta military conflict offensive',
  },
  {
    tag: 'taiwan',
    label: 'Taiwan Strait',
    color: '#3fb950',
    query: 'taiwan strait china military pla exercises incursion',
  },
  {
    tag: 'general',
    label: 'Global Conflicts',
    color: '#8b949e',
    query: 'war military conflict offensive battle casualties killed',
  },
];

const GDELT_BASE    = 'https://api.gdeltproject.org/api/v2/doc/doc';
const TIMESPAN      = '24h';
const MAX_PER_QUERY = 15;

// ── Helpers ────────────────────────────────────────────────────────────────────
function parseGdeltDate(seendate) {
  if (!seendate || seendate.length < 14) return new Date().toISOString();
  const y  = seendate.slice(0, 4);
  const mo = seendate.slice(4, 6);
  const d  = seendate.slice(6, 8);
  const h  = seendate.slice(8, 10);
  const mi = seendate.slice(10, 12);
  const s  = seendate.slice(12, 14);
  return `${y}-${mo}-${d}T${h}:${mi}:${s}Z`;
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'ConflictMonitor-DailyRefresh/1.0' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`  Attempt ${attempt + 1} failed: ${err.message}. Retrying in ${delay}ms…`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

async function fetchGdeltQuery({ tag, label, color, query }) {
  const url = new URL(GDELT_BASE);
  url.searchParams.set('query', query);
  url.searchParams.set('mode', 'artlist');
  url.searchParams.set('format', 'json');
  url.searchParams.set('maxrecords', String(MAX_PER_QUERY));
  url.searchParams.set('sort', 'DateDesc');
  url.searchParams.set('timespan', TIMESPAN);

  try {
    console.log(`  Fetching [${tag}]: ${query.slice(0, 50)}…`);
    const data = await fetchWithRetry(url.toString());
    const articles = (data.articles ?? []).filter(
      (a) => a.url && a.title && a.language === 'English',
    );
    console.log(`  ✓ [${tag}] — ${articles.length} articles`);
    return articles.map((a) => ({
      id: `gdelt-${tag}-${Buffer.from(a.url).toString('base64').slice(0, 16)}`,
      title: a.title,
      url: a.url,
      domain: a.domain ?? new URL(a.url).hostname,
      publishedAt: parseGdeltDate(a.seendate),
      conflictTag: tag,
      conflictLabel: label,
      color,
    }));
  } catch (err) {
    console.error(`  ✗ [${tag}] failed: ${err.message}`);
    return [];
  }
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🔄  Conflict Monitor — Daily Event Refresh`);
  console.log(`    ${new Date().toISOString()}\n`);

  // Fetch all queries sequentially to avoid rate-limiting GDELT
  const allEvents = [];
  for (const q of CONFLICT_QUERIES) {
    const events = await fetchGdeltQuery(q);
    allEvents.push(...events);
    // Small delay between queries to be polite to GDELT
    await new Promise((r) => setTimeout(r, 500));
  }

  // Deduplicate by URL + sort newest first
  const seenUrls = new Set();
  const deduped = allEvents
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .filter((e) => {
      if (seenUrls.has(e.url)) return false;
      seenUrls.add(e.url);
      return true;
    });

  // Group by conflict tag for stats
  const stats = {};
  deduped.forEach((e) => {
    stats[e.conflictTag] = (stats[e.conflictTag] ?? 0) + 1;
  });

  const output = {
    generatedAt: new Date().toISOString(),
    eventCount: deduped.length,
    stats,
    events: deduped,
  };

  mkdirSync(join(__dirname, '..', 'data'), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\n✅  Done — ${deduped.length} events written to data/live-events.json`);
  console.log(`    Breakdown:`, stats);
  console.log();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
