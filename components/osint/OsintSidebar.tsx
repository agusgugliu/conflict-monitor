'use client';

import { Users, Building, ShieldAlert, Globe2 } from 'lucide-react';
import { INTEL_ENTITIES } from '@/data/ghost-intel';

interface SidebarProps {
    onSelectEntity: (id: string) => void;
    selectedEntityId: string | null;
}

const ORGS = INTEL_ENTITIES.filter(e => e.type === 'org');
const PEOPLE = INTEL_ENTITIES.filter(e => e.type === 'person');
const INFRA = INTEL_ENTITIES.filter(e => e.type === 'infra');

export default function OsintSidebar({ onSelectEntity, selectedEntityId }: SidebarProps) {
    return (
        <div className="h-full overflow-y-auto p-4 custom-scrollbar">
            <div className="mb-4">
                <h2 className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider mb-2">Organizations & Entities</h2>
                <div className="flex flex-col gap-1.5">
                    {ORGS.map((org) => {
                        return (
                            <button
                                key={org.id}
                                onClick={() => onSelectEntity(org.id)}
                                className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${selectedEntityId === org.id ? 'bg-[#21262d] border-[#58a6ff]' : 'border-[#30363d] hover:border-[#8b949e]'}`}
                            >
                                <ShieldAlert size={14} className="text-[#f0a500]" />
                                <div>
                                    <h3 className="text-xs font-bold text-white">{org.name}</h3>
                                    <p className="text-[10px] text-[#8b949e] mt-0.5">{org.role}</p>
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
                        return (
                            <button
                                key={p.id}
                                onClick={() => onSelectEntity(p.id)}
                                className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${selectedEntityId === p.id ? 'bg-[#21262d] border-[#58a6ff]' : 'border-[#30363d] hover:border-[#8b949e]'}`}
                            >
                                <Users size={14} className="text-[#a371f7]" />
                                <div>
                                    <h3 className="text-xs font-bold text-white">{p.name}</h3>
                                    <p className="text-[10px] text-[#8b949e] mt-0.5">{p.role}</p>
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
                        return (
                            <button
                                key={i.id}
                                onClick={() => onSelectEntity(i.id)}
                                className={`flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ${selectedEntityId === i.id ? 'bg-[#21262d] border-[#58a6ff]' : 'border-[#30363d] hover:border-[#8b949e]'}`}
                            >
                                <Building size={14} className="text-[#58a6ff]" />
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
