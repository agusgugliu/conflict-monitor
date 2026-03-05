'use client';

import { useMemo, useState, useEffect } from 'react';
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface Alert {
    id: string;
    lat: number;
    lng: number;
    label: string;
    type: 'air-raid' | 'artillery' | 'troop-movement' | 'naval';
    impact: 'high' | 'medium' | 'low';
}

const CONFLICT_CONFIGS: Record<string, { center: [number, number], zoom: number }> = {
    ukraine: { center: [31.1656, 48.3794], zoom: 6 }, // Center on Ukraine
    iran: { center: [53.6880, 32.4279], zoom: 5 }, // Center on Iran/ME
};

// Fake live alerts data
const FAKE_ALERTS: Record<string, Alert[]> = {
    ukraine: [
        { id: 'u1', lat: 50.4501, lng: 30.5234, label: 'Kyiv - Air Raid Siren', type: 'air-raid', impact: 'high' },
        { id: 'u2', lat: 48.0159, lng: 37.8028, label: 'Donetsk - Artillery', type: 'artillery', impact: 'medium' },
        { id: 'u3', lat: 46.4825, lng: 30.7233, label: 'Odesa - Port Activity', type: 'naval', impact: 'medium' },
        { id: 'u4', lat: 49.9935, lng: 36.2304, label: 'Kharkiv - Alerts', type: 'air-raid', impact: 'high' },
    ],
    iran: [
        { id: 'i1', lat: 35.6892, lng: 51.3890, label: 'Tehran - Alert', type: 'air-raid', impact: 'high' },
        { id: 'i2', lat: 33.8547, lng: 35.8623, label: 'Lebanon - Border Skirmish', type: 'artillery', impact: 'medium' },
        { id: 'i3', lat: 15.3694, lng: 44.1910, label: 'Sanaa - Drone Activity', type: 'troop-movement', impact: 'medium' },
        { id: 'i4', lat: 25.0456, lng: 54.8877, label: 'Strait of Hormuz - Naval', type: 'naval', impact: 'high' },
    ]
};

export default function LiveTrackerMap({ activeConflict }: { activeConflict: string }) {
    const config = CONFLICT_CONFIGS[activeConflict] || { center: [0, 0], zoom: 1 };
    const baseAlerts = FAKE_ALERTS[activeConflict] || [];

    // Randomly make alerts pop in and out to simulate live behavior
    const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);

    useEffect(() => {
        // Initial fetch
        setActiveAlerts(baseAlerts.slice(0, 2));

        const intervalId = setInterval(() => {
            // Randomly update the active alerts array
            const count = Math.floor(Math.random() * baseAlerts.length) + 1;
            const shuffled = [...baseAlerts].sort(() => 0.5 - Math.random());
            setActiveAlerts(shuffled.slice(0, count));
        }, 4500); // Change active alerts every 4.5 seconds

        return () => clearInterval(intervalId);
    }, [activeConflict, baseAlerts]);

    const getImpactColor = (impact: string) => {
        if (impact === 'high') return '#e05252';
        if (impact === 'medium') return '#f0a500';
        return '#58a6ff';
    };

    return (
        <div className="w-full h-full bg-[#0d1117] relative">
            <ComposableMap
                projection="geoMercator"
                projectionConfig={{ scale: 130 }}
                style={{ width: '100%', height: '100%' }}
            >
                <ZoomableGroup
                    center={config.center}
                    zoom={config.zoom}
                    minZoom={2}
                    maxZoom={12}
                    onMoveEnd={() => { }} // Disable scroll zoom annoyance potentially
                >
                    <Geographies geography={GEO_URL}>
                        {({ geographies }) =>
                            geographies.map((geo) => (
                                <Geography
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill="#1c2333"
                                    stroke="#30363d"
                                    strokeWidth={0.5 / config.zoom}
                                    style={{
                                        default: { outline: 'none' },
                                        hover: { fill: '#21262d', outline: 'none' },
                                        pressed: { outline: 'none' },
                                    }}
                                />
                            ))
                        }
                    </Geographies>

                    <AnimatePresence>
                        {activeAlerts.map((alert) => (
                            <Marker key={alert.id} coordinates={[alert.lng, alert.lat]}>
                                <motion.circle
                                    r={4 / config.zoom}
                                    fill={getImpactColor(alert.impact)}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                />

                                <motion.circle
                                    r={(12 / config.zoom)}
                                    fill="transparent"
                                    stroke={getImpactColor(alert.impact)}
                                    strokeWidth={1.5 / config.zoom}
                                    initial={{ scale: 0.5, opacity: 1 }}
                                    animate={{ scale: 3, opacity: 0 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                                />
                                <motion.text
                                    textAnchor="middle"
                                    y={-8 / config.zoom}
                                    fill="#e6edf3"
                                    fontSize={12 / config.zoom}
                                    fontWeight="bold"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: -8 / config.zoom }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        pointerEvents: 'none',
                                        filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))'
                                    }}
                                >
                                    {alert.label}
                                </motion.text>
                            </Marker>
                        ))}
                    </AnimatePresence>
                </ZoomableGroup>
            </ComposableMap>

            {/* Legend inside map view */}
            <div className="absolute bottom-4 left-4 glass-panel p-3 rounded-lg flex flex-col gap-2">
                <h3 className="text-[10px] text-[#8b949e] font-bold tracking-wider uppercase">Live Activity</h3>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e05252]" />
                    <span className="text-[11px] text-[#e6edf3]">High Intensity</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f0a500]" />
                    <span className="text-[11px] text-[#e6edf3]">Medium Intensity</span>
                </div>
            </div>
        </div>
    );
}
