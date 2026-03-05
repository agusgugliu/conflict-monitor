'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, MessageSquare, ShieldAlert, Loader2, ExternalLink } from 'lucide-react';
import type { NewsItem } from '@/app/api/news/route';
import type { LiveEvent } from '@/app/api/live-events/route';

interface FeedItem {
    id: string;
    type: 'alert' | 'tweet' | 'intel';
    source: string;
    sourceColor?: string;
    content: string;
    time: string;
    url: string;
    isNew: boolean;
}

function timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export default function LiveFeed({ activeConflict }: { activeConflict: string }) {
    const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchItems = useCallback(async () => {
        try {
            // Fetch both news and GDELT live events
            const [newsRes, gdeltRes] = await Promise.all([
                fetch('/api/news?conflict=1'),
                fetch('/api/live-events')
            ]);

            const newsData = await newsRes.json();
            const gdeltData = await gdeltRes.json();

            const items: FeedItem[] = [];

            // Add news items
            if (newsData.items) {
                newsData.items.forEach((item: NewsItem) => {
                    const matchesUkraine = activeConflict === 'ukraine' && (item.conflictTag === 'ukraine' || item.conflictTag === 'russia');
                    const matchesIran = activeConflict === 'iran' && (item.conflictTag === 'iran-axis' || item.conflictTag === 'general');

                    if (matchesUkraine || matchesIran) {
                        items.push({
                            id: item.id,
                            type: item.title.toLowerCase().includes('alert') ? 'alert' : 'tweet',
                            source: item.source,
                            sourceColor: item.sourceColor,
                            content: item.title,
                            time: item.publishedAt,
                            url: item.url,
                            isNew: false
                        });
                    }
                });
            }

            // Add GDELT events
            if (gdeltData.events) {
                gdeltData.events.forEach((event: LiveEvent) => {
                    const matchesUkraine = activeConflict === 'ukraine' && (event.conflictTag === 'ukraine' || event.conflictTag === 'russia');
                    const matchesIran = activeConflict === 'iran' && (event.conflictTag === 'iran-axis');

                    if (matchesUkraine || matchesIran) {
                        items.push({
                            id: event.id,
                            type: 'intel',
                            source: 'GDELT Live',
                            sourceColor: '#f0a500',
                            content: event.title,
                            time: event.publishedAt,
                            url: event.url,
                            isNew: false
                        });
                    }
                });
            }

            // Sort by newest first
            items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

            setFeedItems(items.slice(0, 30));
        } catch (err) {
            console.error('Failed to fetch live feed:', err);
        } finally {
            setLoading(false);
        }
    }, [activeConflict]);

    useEffect(() => {
        setLoading(true);
        fetchItems();
        const interval = setInterval(fetchItems, 60000); // refresh every minute

        return () => clearInterval(interval);
    }, [fetchItems]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[#8b949e] p-4">
                <Loader2 className="animate-spin mb-2" size={24} />
                <p className="text-xs">Connecting to Intel feeds...</p>
            </div>
        );
    }

    if (feedItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-[#8b949e] p-4 text-center">
                <ShieldAlert className="mb-2 opacity-50" size={24} />
                <p className="text-xs">No active intelligence reports for this region at this time.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-3 w-full h-full">
            <AnimatePresence>
                {feedItems.map((item) => (
                    <motion.a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className={`block p-3 rounded-lg border bg-[#161b22] border-[#30363d] hover:border-[#8b949e] transition-colors group`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {item.type === 'alert' && <AlertTriangle size={14} className="text-[#e05252]" />}
                                {item.type === 'tweet' && <MessageSquare size={14} className="text-[#58a6ff]" />}
                                {item.type === 'intel' && <ShieldAlert size={14} className="text-[#f0a500]" />}
                                <span
                                    className="text-xs font-bold px-1.5 py-0.5 rounded"
                                    style={{
                                        backgroundColor: item.sourceColor ? `${item.sourceColor}20` : '#30363d',
                                        color: item.sourceColor || '#e6edf3',
                                        border: `1px solid ${item.sourceColor ? `${item.sourceColor}40` : '#40444b'}`
                                    }}
                                >
                                    {item.source}
                                </span>
                                {(Date.now() - new Date(item.time).getTime() < 600000) && (
                                    <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-[#3fb950]/20 text-[#3fb950] border border-[#3fb950]/30 animate-pulse">
                                        LATEST INTEL
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] text-[#8b949e] flex items-center gap-1">
                                {timeAgo(item.time)}
                                <ExternalLink size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </span>
                        </div>
                        <p className="text-xs text-[#c9d1d9] leading-relaxed group-hover:text-white transition-colors line-clamp-3">
                            {item.content}
                        </p>
                    </motion.a>
                ))}
            </AnimatePresence>
        </div >
    );
}
