'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, ChevronLeft, Maximize2, Monitor, Shield, Activity } from 'lucide-react';
import LiveCameras from '@/components/live/LiveCameras';

export default function CamerasOnlyPage() {
    const [activeConflict, setActiveConflict] = useState('iran');

    return (
        <main className="min-h-screen bg-[#050505] text-[#e6edf3] flex flex-col font-sans selection:bg-[#58a6ff33]">
            {/* Tactical Header */}
            <header className="h-14 border-b border-white/5 bg-[#0d1117]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link
                        href="/live"
                        className="flex items-center gap-2 text-xs font-bold text-[#8b949e] hover:text-white transition-colors group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                        RETURN TO GLOBE
                    </Link>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Monitor size={18} className="text-[#58a6ff]" />
                        <h1 className="text-sm font-black tracking-tighter uppercase italic">
                            Multi-Theater Surveillance <span className="text-[#58a6ff]">Matrix</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-black/40 border border-white/5 rounded-full px-3 py-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950] animate-pulse" />
                        <span className="text-[10px] font-mono text-[#3fb950] uppercase tracking-wider">ALL STREAMS ACTIVE</span>
                    </div>

                    <div className="flex p-1 bg-black/40 border border-white/5 rounded-lg">
                        <button
                            onClick={() => setActiveConflict('ukraine')}
                            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${activeConflict === 'ukraine' ? 'bg-[#58a6ff] text-white shadow-lg' : 'text-[#8b949e] hover:text-white'}`}
                        >
                            UKRAINE
                        </button>
                        <button
                            onClick={() => setActiveConflict('iran')}
                            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${activeConflict === 'iran' ? 'bg-[#e05252] text-white shadow-lg' : 'text-[#8b949e] hover:text-white'}`}
                        >
                            IRAN / ME
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Surveillance Grid */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex justify-between items-end mb-6">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-[#8b949e]">
                                <Shield size={14} />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Operational Theater</span>
                            </div>
                            <h2 className="text-2xl font-black text-white capitalize tracking-tight flex items-center gap-3">
                                {activeConflict} Region
                                <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-white/40">GEO-SYNC: ENABLED</span>
                            </h2>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-mono text-[#8b949e] uppercase">System Latency</span>
                                <span className="text-[10px] font-mono text-[#3fb950]">14ms</span>
                            </div>
                            <div className="h-8 w-px bg-white/5" />
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] font-mono text-[#8b949e] uppercase">Encrypted Peak</span>
                                <span className="text-[10px] font-mono text-[#f0a500]">0.8 Gbps</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                        {/* We reuse the LiveCameras component but we'll modify it to support grid better or wrap it */}
                        <div className="contents md:[&>div]:grid-cols-2">
                            <LiveSurveillanceGrid activeConflict={activeConflict} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Stats */}
            <footer className="h-10 border-t border-white/5 bg-[#0d1117] px-6 flex items-center justify-between text-[10px] font-mono text-[#8b949e]">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1"><Activity size={10} className="text-[#3fb950]" /> STABLE</span>
                    <span>PROTO: AES-256</span>
                </div>
                <div className="flex gap-4">
                    <span>SERVER: EDGE-US-EAST-1</span>
                    <span className="text-white/60">{new Date().toISOString()}</span>
                </div>
            </footer>
        </main>
    );
}

// Inner component to render the grid properly for this page
function LiveSurveillanceGrid({ activeConflict }: { activeConflict: string }) {
    return (
        <div className="w-full h-full">
            <LiveCameras activeConflict={activeConflict} gridCols={2} />
        </div>
    );
}
