import { NextResponse } from 'next/server';

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
];

// ── In-memory cache (5 min TTL) ────────────────────────────────────────────────
let cache: { items: NewsItem[]; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

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

    items.push({
      id,
      title,
      description: description.slice(0, 240) + (description.length > 240 ? '…' : ''),
      url: link,
      source: sourceName,
      sourceColor,
      publishedAt,
      category: category || undefined,
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

// ── Route handler ──────────────────────────────────────────────────────────────
export async function GET() {
  // Serve from cache if fresh
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return NextResponse.json({ items: cache.items, fetchedAt: cache.fetchedAt, cached: true });
  }

  // Fetch all sources concurrently
  const results = await Promise.allSettled(SOURCES.map(fetchSource));
  const allItems: NewsItem[] = results.flatMap((r) =>
    r.status === 'fulfilled' ? r.value : [],
  );

  // Sort by newest first, deduplicate by title similarity
  const seen = new Set<string>();
  const deduped = allItems
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .filter((item) => {
      const key = item.title.toLowerCase().slice(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 50);

  cache = { items: deduped, fetchedAt: Date.now() };

  return NextResponse.json({ items: deduped, fetchedAt: cache.fetchedAt, cached: false });
}
