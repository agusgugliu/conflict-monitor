'use client';

import dynamic from 'next/dynamic';

const GlobeInner = dynamic(() => import('./LiveTrackerGlobeInner'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1117] relative">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-[#8b949e]">Loading 3D Globe...</p>
            </div>
        </div>
    ),
});

export default function LiveTrackerGlobe({ activeConflict }: { activeConflict: string }) {
    return <GlobeInner activeConflict={activeConflict} />;
}
