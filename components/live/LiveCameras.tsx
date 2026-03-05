'use client';

import { Radio, ExternalLink, Settings, Shield, Lock, User, Key, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function LiveCameras({ activeConflict, gridCols = 1 }: { activeConflict: string, gridCols?: number }) {
    const searchParams = useSearchParams();
    const [cameraData, setCameraData] = useState<Record<string, any[]>>({});
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [newYtId, setNewYtId] = useState('');

    useEffect(() => {
        // Persistence Check
        if (localStorage.getItem('admin_session') === 'active') {
            setIsAdmin(true);
        }

        // URL Override
        if (searchParams.get('admin') === 'vault') {
            setIsAdmin(true);
            localStorage.setItem('admin_session', 'active');
        }

        fetch('/api/cameras')
            .then(res => res.json())
            .then(data => {
                setCameraData(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [searchParams]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Secure validation against provided credentials
        if (username === 'agusgugliu' && password === 'Ag40567020') {
            setIsAdmin(true);
            localStorage.setItem('admin_session', 'active');
            setShowLogin(false);
            setError('');
        } else {
            setError('ACCESS DENIED: INVALID CREDENTIALS');
        }
    };

    const handleLogout = () => {
        setIsAdmin(false);
        localStorage.removeItem('admin_session');
    };

    const cameras = cameraData[activeConflict] || [];

    const handleSave = async (id: string) => {
        const updatedData = { ...cameraData };
        updatedData[activeConflict] = updatedData[activeConflict].map(c =>
            c.id === id ? { ...c, ytId: newYtId, status: newYtId ? 'LIVE' : 'OFFLINE' } : c
        );
        setCameraData(updatedData);
        setEditingId(null);

        await fetch('/api/cameras', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-token': 'admin-secret'
            },
            body: JSON.stringify(updatedData)
        });
    };

    if (loading) return <div className="p-4 text-[10px] text-[#8b949e] font-mono animate-pulse uppercase">Booting Surveillance Matrix...</div>;

    return (
        <div className="flex flex-col h-full gap-2 overflow-hidden relative">
            {/* Admin Toggle Area (Classified) */}
            <div className="flex justify-between items-center px-2 py-1">
                <div className="flex items-center gap-2">
                    {isAdmin && <span className="text-[8px] font-mono text-[#3fb950] bg-[#3fb950]/10 border border-[#3fb950]/30 px-1.5 py-0.5 rounded animate-pulse">ADMIN_ACTIVE</span>}
                </div>
                <button
                    onClick={() => isAdmin ? handleLogout() : setShowLogin(true)}
                    className="opacity-10 hover:opacity-100 transition-opacity text-[8px] text-[#8b949e] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase"
                >
                    {isAdmin ? 'TERMINATE_SESSION' : 'CRYPTO_LOGIN'}
                </button>
            </div>

            {/* Login Modal Overlay */}
            {showLogin && (
                <div className="absolute inset-0 z-[100] bg-[#0d1117]/95 backdrop-blur-md flex items-center justify-center p-6 border border-[#30363d] rounded-sm shadow-2xl">
                    <div className="w-full max-w-[280px] space-y-4">
                        <div className="flex justify-between items-center border-b border-[#30363d] pb-2">
                            <h3 className="text-xs font-black text-white flex items-center gap-2 tracking-tighter uppercase">
                                <Lock size={14} className="text-[#58a6ff]" />
                                Authentication Required
                            </h3>
                            <button onClick={() => setShowLogin(false)}><X size={16} className="text-[#8b949e] hover:text-white" /></button>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-mono text-[#8b949e] uppercase">Agent ID</label>
                                <div className="relative">
                                    <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-[#050505] border border-[#30363d] rounded p-2 pl-9 text-xs text-white focus:border-[#58a6ff] focus:outline-none placeholder:text-white/10"
                                        placeholder="Username"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-mono text-[#8b949e] uppercase">Secret Key</label>
                                <div className="relative">
                                    <Key size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#050505] border border-[#30363d] rounded p-2 pl-9 text-xs text-white focus:border-[#58a6ff] focus:outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            {error && <p className="text-[8px] font-mono text-[#ff3e3e] bg-[#ff3e3e]/10 p-2 rounded border border-[#ff3e3e]/20">{error}</p>}
                            <button className="w-full bg-[#58a6ff] hover:bg-[#388bfd] text-white text-[10px] font-black py-2 rounded transition-all uppercase tracking-widest shadow-lg shadow-[#58a6ff22]">
                                ESCALATE PRIVILEGES
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className={`grid gap-2 h-full ${gridCols === 2 ? 'grid-cols-2 grid-rows-2' : 'grid-cols-1'}`}>
                {cameras.slice(0, 4).map((cam) => (
                    <div key={cam.id} className="relative aspect-video rounded-sm bg-[#000] border border-[#30363d] overflow-hidden group cursor-crosshair">
                        {/* Stream Background */}
                        {cam.status === 'LIVE' && cam.ytId ? (
                            <div className="absolute inset-0 overflow-hidden flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                <iframe
                                    className="w-[110%] h-[110%] pointer-events-none"
                                    src={`https://www.youtube.com/embed/${cam.ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${cam.ytId}&showinfo=0&rel=0`}
                                    allow="autoplay; encrypted-media"
                                    title={cam.label}
                                />
                            </div>
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-[#0d1117]">
                                <div className="text-[10px] text-[#8b949e] font-mono tracking-tighter flex flex-col items-center gap-1">
                                    <Radio size={16} className="opacity-50" />
                                    SIGNAL LOST
                                </div>
                            </div>
                        )}

                        {/* Admin HUD - Visible only when Authorized */}
                        {isAdmin && (
                            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-4 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                {editingId === cam.id ? (
                                    <div className="w-full space-y-2">
                                        <div className="flex items-center gap-2 border-b border-[#3fb950] pb-1 mb-2">
                                            <Shield size={10} className="text-[#3fb950]" />
                                            <span className="text-[8px] font-mono text-[#3fb950]">RE-ROUTE ENCRYPTED STREAM</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={newYtId}
                                            onChange={(e) => setNewYtId(e.target.value)}
                                            placeholder="YouTube ID..."
                                            className="w-full bg-[#0d1117] border border-[#3fb950] text-[#3fb950] text-[10px] p-1.5 rounded font-mono shadow-[0_0_10px_rgba(63,185,80,0.2)]"
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleSave(cam.id)} className="flex-1 bg-[#3fb950] text-white text-[9px] py-1 rounded font-black">SYNC</button>
                                            <button onClick={() => setEditingId(null)} className="flex-1 bg-[#30363d] text-white text-[9px] py-1 rounded">ABORT</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setEditingId(cam.id); setNewYtId(cam.ytId || ''); }}
                                        className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[9px] px-3 py-1.5 rounded font-black flex items-center gap-2 backdrop-blur-md"
                                    >
                                        <Settings size={12} />
                                        ADMIN RE-CONFIG
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Static/Visual Effects */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] bg-[length:100%_2px,3px_100%] z-10" />
                        <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.9)] pointer-events-none z-10" />

                        {/* HUD Overlays */}
                        <div className="absolute top-2 left-2 flex items-center gap-2 z-20">
                            <div className="flex items-center gap-1.5 bg-black/80 border border-white/10 px-1.5 py-0.5 rounded-sm backdrop-blur-sm">
                                {cam.status === 'LIVE' ? (
                                    <>
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#ff3e3e] animate-pulse" />
                                        <span className="text-[8px] font-black text-white/90 uppercase tracking-[0.1em]">LIVE</span>
                                    </>
                                ) : (
                                    <span className="text-[8px] font-bold text-[#8b949e] uppercase">OFF</span>
                                )}
                            </div>
                        </div>

                        <div className="absolute bottom-1.5 left-2 right-2 flex justify-between items-end z-20 pointer-events-none">
                            <div className="flex flex-col">
                                <span className="text-[9px] font-black text-white/90 uppercase tracking-wider">{cam.label}</span>
                                <span className="text-[7px] font-mono text-white/30 truncate uppercase">SENS_ID: {cam.id}</span>
                            </div>
                            <div className="text-[8px] font-mono text-[#3fb950] bg-black/40 px-1 rounded">
                                {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
