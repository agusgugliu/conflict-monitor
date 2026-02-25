import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  sourceColor: string;
  publishedAt: string; // ISO string
  category?: string;
  conflictTag?: string; // e.g. 'ukraine', 'gaza', 'houthi', 'general'
}

// ── Sources ────────────────────────────────────────────────────────────────────
const SOURCES = [
  {
    name: 'BBC News',
    color: '#bb1919',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
  },
  {
    name: 'Al Jazeera',
    color: '#f0a500',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
  },
  {
    name: 'The Guardian',
    color: '#005689',
    url: 'https://www.theguardian.com/world/rss',
  },
  {
    name: 'Reuters',
    color: '#ff8000',
    url: 'https://feeds.reuters.com/reuters/worldNews',
  },
  {
    name: 'Radio Free Europe',
    color: '#1a73e8',
    url: 'https://www.rferl.org/api/zbkqkpeqepxt',
  },
];

// ── Conflict keyword matching ──────────────────────────────────────────────────
const CONFLICT_KEYWORDS = [
  'war', 'conflict', 'military', 'attack', 'offensive', 'troops',
  'ceasefire', 'missile', 'airstrike', 'drone', 'bomb', 'explosion',
  'battle', 'fighting', 'forces', 'soldiers', 'army', 'navy', 'airforce',
  'invasion', 'occupation', 'territory', 'front line', 'frontline',
  'casualties', 'killed', 'wounded', 'siege', 'shelling', 'artillery',
  'sanctions', 'nato', 'nuclear', 'weapons', 'arms', 'defense',
  'ukraine', 'russia', 'gaza', 'israel', 'hamas', 'hezbollah', 'houthi',
  'iran', 'syria', 'sudan', 'myanmar', 'taiwan', 'north korea',
  'coup', 'uprising', 'rebellion', 'insurgency', 'terror', 'hostage',
  'peace talks', 'negotiation', 'diplomat', 'geopolit',
];

// Conflict tag patterns — ordered most-specific first
const CONFLICT_TAG_PATTERNS: Array<{ tag: string; keywords: string[] }> = [
  {
    tag: 'ukraine',
    keywords: ['ukraine', 'ukrainian', 'zelensky', 'kyiv', 'donbas', 'kharkiv', 'kursk', 'russo-ukrainian', 'mariupol'],
  },
  {
    tag: 'gaza',
    keywords: ['gaza', 'hamas', 'rafah', 'west bank', 'palestinian', 'idf', 'hostage', 'ceasefire'],
  },
  {
    tag: 'iran-axis',
    keywords: ['hezbollah', 'houthi', 'red sea', 'iran', 'tehran', 'nasrallah', 'lebanese', 'beirut'],
  },
  {
    tag: 'russia',
    keywords: ['kremlin', 'putin', 'moscow', 'russian army', 'wagner'],
  },
  {
    tag: 'taiwan',
    keywords: ['taiwan', 'strait', 'pla', 'taipei', 'china military'],
  },
  {
    tag: 'sudan',
    keywords: ['sudan', 'rsf', 'rapid support forces', 'khartoum', 'darfur'],
  },
  {
    tag: 'myanmar',
    keywords: ['myanmar', 'burma', 'junta', 'shan', 'arakan'],
  },
];

function detectConflictTag(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const { tag, keywords } of CONFLICT_TAG_PATTERNS) {
    if (keywords.some((kw) => lower.includes(kw))) return tag;
  }
  return undefined;
}

function isConflictRelated(title: string, description: string): boolean {
  const combined = (title + ' ' + description).toLowerCase();
  return CONFLICT_KEYWORDS.some((kw) => combined.includes(kw));
}

// ── In-memory cache (15 min TTL) ───────────────────────────────────────────────
let cache: { all: NewsItem[]; conflict: NewsItem[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000;

// ── Helpers ────────────────────────────────────────────────────────────────────
function extractTag(xml: string, tag: string): string {
  // Handle CDATA sections
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i');
  const plainRe  = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const cdata = cdataRe.exec(xml);
  if (cdata) return cdata[1].trim();
  const plain = plainRe.exec(xml);
  if (plain) return plain[1].replace(/<[^>]+>/g, '').trim();
  return '';
}

function extractAttr(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i');
  const m = re.exec(xml);
  return m ? m[1].trim() : '';
}

function parseItems(xml: string, sourceName: string, sourceColor: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRe = /<item>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;

  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title = extractTag(block, 'title');
    const description = extractTag(block, 'description');
    const link = extractTag(block, 'link') || extractAttr(block, 'link', 'href');
    const pubDate = extractTag(block, 'pubDate') || extractTag(block, 'dc:date') || extractTag(block, 'published');
    const category = extractTag(block, 'category');

    if (!title || !link) continue;

    const publishedAt = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
    const id = `${sourceName}-${Buffer.from(link).toString('base64').slice(0, 16)}`;
    const conflictTag = detectConflictTag(title + ' ' + description);

    items.push({
      id,
      title,
      description: description.slice(0, 240) + (description.length > 240 ? '…' : ''),
      url: link,
      source: sourceName,
      sourceColor,
      publishedAt,
      category: category || undefined,
      conflictTag,
    });
  }

  return items;
}

async function fetchSource(source: typeof SOURCES[0]): Promise<NewsItem[]> {
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'ConflictMonitor/1.0 (news aggregator)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseItems(xml, source.name, source.color);
  } catch {
    return [];
  }
}

function deduplicate(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Route handler ──────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const conflictOnly = req.nextUrl.searchParams.get('conflict') === '1';

  // Serve from cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    const items = conflictOnly ? cache.conflict : cache.all;
    return NextResponse.json({ items, fetchedAt: cache.fetchedAt, cached: true });
  }

  // Fetch all sources concurrently
  const results = await Promise.allSettled(SOURCES.map(fetchSource));
  const allItems: NewsItem[] = results.flatMap((r) =>
    r.status === 'fulfilled' ? r.value : [],
  );

  // Sort by newest first
  allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const all     = deduplicate(allItems).slice(0, 75);
  const conflict = deduplicate(
    allItems.filter((i) => isConflictRelated(i.title, i.description)),
  ).slice(0, 50);

  cache = { all, conflict, fetchedAt: Date.now() };

  const items = conflictOnly ? conflict : all;
  return NextResponse.json({ items, fetchedAt: cache.fetchedAt, cached: false });
}
