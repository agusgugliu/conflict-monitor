'use client';

import { ShieldCheck, Crosshair, AlertTriangle, Link2, Download, Copy, ExternalLink, X } from 'lucide-react';

interface PanelProps {
    entityId: string;
    onClose: () => void;
}

export default function EntityDetailsPanel({ entityId, onClose }: PanelProps) {
    // Mock data based on selection
    const isPerson = entityId.startsWith('p_');
    const isOrg = entityId.startsWith('org_');
    const isInfra = entityId.startsWith('i_');

    return (
        <div className="h-full flex flex-col relative w-full overflow-hidden bg-[#0d1117] border-l border-[#30363d]">
            <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#161b22]">
                <h2 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                    <Crosshair size={16} className="text-[#a371f7]" />
                    Entity Intel
                </h2>
                <button onClick={onClose} className="text-[#8b949e] hover:text-[#e6edf3] transition-colors rounded-sm hover:bg-[#30363d] p-1">
                    <X size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {/* Header Block */}
                <div className="mb-6 p-4 rounded-xl border border-[#30363d] bg-gradient-to-br from-[#161b22] to-[#0d1117]">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[10px] text-[#8b949e] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                                {isPerson && <><span className="w-1.5 h-1.5 rounded-full bg-[#a371f7]" /> Human Target</>}
                                {isOrg && <><span className="w-1.5 h-1.5 rounded-full bg-[#f0a500]" /> Organization</>}
                                {isInfra && <><span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" /> Infrastructure</>}
                            </p>
                            <h3 className="text-xl font-bold text-[#e6edf3]">
                                {entityId === 'p_yevgeny' ? 'Identity 129' :
                                    entityId === 'org_wagner' ? 'Wagner Group' :
                                        entityId === 'i_domain' ? 'Dark Ops Portal' :
                                            'Unknown Target'}
                            </h3>
                            <p className="text-xs text-[#8b949e] mt-1 font-mono">ID: {entityId.toUpperCase()}</p>
                        </div>
                        {isPerson && <ShieldCheck size={28} className="text-[#3fb950] opacity-80" />}
                        {isOrg && <AlertTriangle size={28} className="text-[#e05252] opacity-80" />}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mb-6">
                    <button className="flex-1 border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] hover:border-[#8b949e] text-xs text-white p-2 rounded flex items-center justify-center gap-2 transition-colors">
                        <Copy size={14} /> Copy ID
                    </button>
                    <button className="flex-1 border border-[#30363d] bg-[#21262d] hover:bg-[#30363d] hover:border-[#8b949e] text-xs text-white p-2 rounded flex items-center justify-center gap-2 transition-colors">
                        <Download size={14} /> Export
                    </button>
                </div>

                {/* Detail Blocks */}
                <div className="space-y-4">
                    <div>
                        <h4 className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-2 font-bold border-b border-[#30363d] pb-2 text-left">Intelligence Profile</h4>
                        <div className="bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
                            <div className="text-xs text-[#e6edf3] space-y-2">
                                <div className="flex justify-between border-b border-[#30363d] pb-1.5">
                                    <span className="text-[#8b949e]">Status:</span>
                                    <span className="text-[#e05252] font-bold">ACTIVE</span>
                                </div>
                                <div className="flex justify-between border-b border-[#30363d] pb-1.5">
                                    <span className="text-[#8b949e]">First Seen:</span>
                                    <span>2023-01-14T10:43Z</span>
                                </div>
                                <div className="flex justify-between pb-1.5">
                                    <span className="text-[#8b949e]">Confidence Score:</span>
                                    <span className="text-[#3fb950] font-mono">94%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-2 font-bold border-b border-[#30363d] pb-2 flex items-center gap-1">
                            <Link2 size={12} className="text-[#58a6ff]" /> Known Connections
                        </h4>
                        <div className="flex flex-col gap-2">
                            <div className="p-2 gap-2 text-xs bg-[#010409] border border-[#30363d] rounded flex items-center justify-between group cursor-pointer hover:border-[#58a6ff]">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#f0a500]" />
                                    <span className="text-[#e6edf3]">Wagner Group</span>
                                </div>
                                <ExternalLink size={12} className="text-[#8b949e] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div className="p-2 gap-2 text-xs bg-[#010409] border border-[#30363d] rounded flex items-center justify-between group cursor-pointer hover:border-[#58a6ff]">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-[#58a6ff]" />
                                    <span className="text-[#e6edf3] font-mono">192.168.1.100</span>
                                </div>
                                <ExternalLink size={12} className="text-[#8b949e] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
