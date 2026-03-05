'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import AppLogo from '@/components/AppLogo';
import OsintSidebar from '@/components/osint/OsintSidebar';
import EntityGraph from '@/components/osint/EntityGraph';
import EntityDetailsPanel from '@/components/osint/EntityDetailsPanel';

export default function OsintPage() {
    const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

    return (
        <div className="flex flex-col h-screen bg-[#0d1117] text-[#e6edf3] overflow-hidden">
            {/* Header */}
            <header className="glass-panel border-b border-[#30363d] px-4 py-3 flex items-center justify-between z-20 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5">
                        <AppLogo size={20} />
                        <div>
                            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                                GHOST Intel CRM
                            </h1>
                            <p className="text-[10px] text-[#8b949e] mt-0.5">
                                OSINT investigation & entity management
                            </p>
                        </div>
                    </div>
                    <div className="h-5 w-px bg-[#30363d]" />
                    <Navigation />
                </div>

                <div className="flex items-center gap-3">
                    <button className="bg-[#238636] hover:bg-[#2ea043] text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors">
                        + New Case
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar (Lists/Cases) */}
                <div className="w-72 flex-shrink-0 border-r border-[#30363d] bg-[#0d1117] flex flex-col z-10">
                    <OsintSidebar onSelectEntity={setSelectedEntityId} selectedEntityId={selectedEntityId} />
                </div>

                {/* Center Canvas (Network Graph) */}
                <div className="flex-1 relative bg-[#010409]">
                    {/* Graph Controls overlay */}
                    <div className="absolute top-4 left-4 z-10 glass-panel px-3 py-2 rounded-lg pointer-events-none">
                        <h2 className="text-xs font-bold text-white mb-1">Entity Relational Map</h2>
                        <p className="text-[10px] text-[#8b949e]">Visualizing connections & intelligence points</p>
                    </div>

                    <EntityGraph selectedEntityId={selectedEntityId} onSelectEntity={setSelectedEntityId} />
                </div>

                {/* Right Sidebar (Details/Inspector) */}
                {selectedEntityId && (
                    <div className="w-80 flex-shrink-0 border-l border-[#30363d] bg-[#0d1117] flex flex-col z-10 transition-all duration-300">
                        <EntityDetailsPanel entityId={selectedEntityId} onClose={() => setSelectedEntityId(null)} />
                    </div>
                )}
            </div>
        </div>
    );
}
