'use client';

import { useState, Suspense } from 'react';
import Navigation from '@/components/Navigation';
import AppLogo from '@/components/AppLogo';
import LiveTrackerGlobe from '@/components/live/LiveTrackerGlobe';
import LiveFeed from '@/components/live/LiveFeed';
import LiveCameras from '@/components/live/LiveCameras';
import LiveMarkets from '@/components/live/LiveMarkets';

export default function LiveTrackerPage() {
    const [activeConflict, setActiveConflict] = useState('iran');

    return (
        <div className="flex flex-col h-screen bg-[#0d1117] text-[#e6edf3] overflow-hidden">
            {/* Header */}
            <header className="glass-panel border-b border-[#30363d] px-4 py-3 flex items-center justify-between z-20 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <AppLogo size={20} />
                        <div>
                            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                                Real-Time Monitor
                            </h1>
                            <p className="text-[10px] text-[#8b949e] mt-0.5">
                                Live alerts, feeds, and market impact
                            </p>
                        </div>
                    </div>
                    <div className="h-5 w-px bg-[#30363d]" />
                    <Navigation />
                </div>

                {/* Real-time indicator */}
                <div className="flex items-center gap-2 text-xs font-medium text-[#e05252]">
                    <span className="w-2 h-2 rounded-full bg-[#e05252] animate-pulse" />
                    SYSTEM LIVE
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-64 flex-shrink-0 border-r border-[#30363d] p-4 flex flex-col gap-2 bg-[#0d1117] z-10 overflow-y-auto">
                    <h2 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-2">Active Conflicts</h2>
                    <button
                        onClick={() => setActiveConflict('ukraine')}
                        className={`text-left p-3 rounded-xl border transition-all ${activeConflict === 'ukraine' ? 'bg-[#21262d] border-[#58a6ff]' : 'border-[#30363d] hover:border-[#8b949e]'}`}
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-white">Russia vs. Ukraine</h3>
                            {activeConflict === 'ukraine' && <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff] animate-pulse mt-1" />}
                        </div>
                        <p className="text-xs text-[#8b949e] mt-1">Eastern Europe</p>
                    </button>

                    <button
                        onClick={() => setActiveConflict('iran')}
                        className={`text-left p-3 rounded-xl border transition-all ${activeConflict === 'iran' ? 'bg-[#21262d] border-[#f0a500]' : 'border-[#30363d] hover:border-[#8b949e]'}`}
                    >
                        <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-white">Iran / Middle East</h3>
                            {activeConflict === 'iran' && <span className="w-1.5 h-1.5 rounded-full bg-[#f0a500] animate-pulse mt-1" />}
                        </div>
                        <p className="text-xs text-[#8b949e] mt-1">Middle East</p>
                    </button>

                    <div className="mt-8 flex-1">
                        <h2 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-3">Markets Impact</h2>
                        <LiveMarkets activeConflict={activeConflict} />
                    </div>
                </div>

                {/* Center Panel: Map & Right Tabs */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Map Section */}
                    <div className="flex-1 relative">
                        <LiveTrackerGlobe activeConflict={activeConflict} />
                    </div>

                    {/* Side Panel: Intel & Cameras */}
                    <div className="w-[400px] flex-shrink-0 bg-[#0d1117] flex flex-col border-l border-[#30363d] overflow-hidden">
                        {/* Cameras Tab */}
                        <div className="h-1/2 flex flex-col border-b border-[#30363d]">
                            <div className="p-3 border-b border-[#30363d] flex justify-between items-center bg-[#161b22]/50">
                                <h2 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#e05252] animate-pulse" />
                                    Live Field Feeds
                                </h2>
                                <a
                                    href="/live/cameras"
                                    className="text-[10px] text-[#58a6ff] hover:underline flex items-center gap-1"
                                >
                                    Full Grid
                                    <span className="text-xs">↗</span>
                                </a>
                            </div>
                            <div className="flex-1 p-2">
                                <Suspense fallback={<div className="p-4 text-[10px] text-[#8b949e] font-mono animate-pulse uppercase">Booting Surveillance Matrix...</div>}>
                                    <LiveCameras activeConflict={activeConflict} gridCols={2} />
                                </Suspense>
                            </div>
                        </div>

                        {/* Intel Feed Tab */}
                        <div className="h-1/2 flex flex-col">
                            <div className="p-3 border-b border-[#30363d] flex justify-between items-center bg-[#161b22]/50">
                                <h2 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider flex items-center gap-2">
                                    <span className="text-[#58a6ff] text-base">#</span>
                                    Signal Intel
                                </h2>
                                <span className="text-[9px] text-[#3fb950] font-bold border border-[#3fb950]/30 bg-[#3fb950]/10 px-1.5 py-0.5 rounded leading-none">REAL-TIME</span>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                <LiveFeed activeConflict={activeConflict} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
