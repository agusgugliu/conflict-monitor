'use client';

import { Users, Building, ShieldAlert, Globe2 } from 'lucide-react';

interface SidebarProps {
    onSelectEntity: (id: string) => void;
    selectedEntityId: string | null;
}

const ORGS = [
    { id: 'org_wagner', name: 'Wagner Group', type: 'PMC', icon: ShieldAlert },
    { id: 'org_osint', name: 'OSINT Collective', type: 'Intelligence', icon: Globe2 },
];

const PEOPLE = [
    { id: 'p_yevgeny', name: 'Identity 129', alias: '@dark_web', role: 'Operative', icon: Users },
    { id: 'p_john', name: 'John Doe', alias: 'Specter', role: 'Informant', icon: Users },
];

const INFRA = [
    { id: 'i_svr', name: 'Command Server', info: '192.168.1.100', icon: Building },
    { id: 'i_domain', name: 'Dark Ops Portal', info: 'ops-ghost-xyz.net', icon: Globe2 },
];

export default function OsintSidebar({ onSelectEntity, selectedEntityId }: SidebarProps) {
    return (
        <div className="h-full overflow-y-auto p-4 custom-scrollbar">
            <div className="mb-4">
                <h2 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-2">Organizations & Entities</h2>
                <div className="flex flex-col gap-1.5">
                    {ORGS.map((org) => {
                        const Icon = org.icon;
                        return (
                            <button
                                key={org.id}
                                onClick={() => onSelectEntity(org.id)}
                                className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${selectedEntityId === org.id ? 'bg-[#21262d] border-[#58a6ff]' : 'border-[#30363d] hover:border-[#8b949e]'}`}
                            >
                                <Icon size={14} className="text-[#f0a500]" />
                                <div>
                                    <h3 className="text-xs font-bold text-white">{org.name}</h3>
                                    <p className="text-[10px] text-[#8b949e] mt-0.5">{org.type}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mb-4">
                <h2 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-2">Identities</h2>
                <div className="flex flex-col gap-1.5">
                    {PEOPLE.map((p) => {
                        const Icon = p.icon;
                        return (
                            <button
                                key={p.id}
                                onClick={() => onSelectEntity(p.id)}
                                className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${selectedEntityId === p.id ? 'bg-[#21262d] border-[#58a6ff]' : 'border-[#30363d] hover:border-[#8b949e]'}`}
                            >
                                <Icon size={14} className="text-[#a371f7]" />
                                <div>
                                    <h3 className="text-xs font-bold text-white">{p.name}</h3>
                                    <p className="text-[10px] text-[#8b949e] mt-0.5">AKA: {p.alias}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="mb-4">
                <h2 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-2">Infrastructure</h2>
                <div className="flex flex-col gap-1.5">
                    {INFRA.map((i) => {
                        const Icon = i.icon;
                        return (
                            <button
                                key={i.id}
                                onClick={() => onSelectEntity(i.id)}
                                className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${selectedEntityId === i.id ? 'bg-[#21262d] border-[#58a6ff]' : 'border-[#30363d] hover:border-[#8b949e]'}`}
                            >
                                <Icon size={14} className="text-[#58a6ff]" />
                                <div>
                                    <h3 className="text-xs font-bold text-white">{i.name}</h3>
                                    <p className="text-[10px] text-[#8b949e] font-mono mt-0.5">{i.info}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
