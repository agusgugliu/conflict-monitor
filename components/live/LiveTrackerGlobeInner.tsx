'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { ExternalLink } from 'lucide-react';

interface Alert {
    id: string;
    lat: number;
    lng: number;
    label: string;
    type: string;
    impact: 'high' | 'medium' | 'low';
}
const CONFLICT_CONFIGS: Record<string, { lat: number, lng: number, alt: number }> = {
    ukraine: { lat: 48.3794, lng: 31.1656, alt: 1.5 },
    iran: { lat: 25.4000, lng: 55.5000, alt: 1.5 }, // Centered on Strait of Hormuz
};

const FAKE_ALERTS: Record<string, Alert[]> = {
    ukraine: [
        { id: 'u1', lat: 50.4501, lng: 30.5234, label: 'Kyiv - Air Raid Siren', type: 'air-raid', impact: 'high' },
        { id: 'u2', lat: 48.0159, lng: 37.8028, label: 'Donetsk - Explosion', type: 'explosion', impact: 'high' },
        { id: 'u3', lat: 46.4825, lng: 30.7233, label: 'Odesa - Port Activity', type: 'naval', impact: 'medium' },
        { id: 'u4', lat: 49.9935, lng: 36.2304, label: 'Kharkiv - Missile Impact', type: 'missile-impact', impact: 'high' },
    ],
    iran: [
        { id: 'i1', lat: 35.6892, lng: 51.3890, label: 'Tehran - Missile Launch', type: 'missile-launch', impact: 'high' },
        { id: 'i2', lat: 33.8547, lng: 35.8623, label: 'Lebanon - Artillery Blast', type: 'explosion', impact: 'high' },
        { id: 'i3', lat: 15.3694, lng: 44.1910, label: 'Sanaa - Drone Strike', type: 'explosion', impact: 'medium' },
        { id: 'i4', lat: 25.0456, lng: 54.8877, label: 'Strait of Hormuz - Naval Clash', type: 'naval', impact: 'high' },
        { id: 'i5', lat: 27.2154, lng: 52.6841, label: 'Persian Gulf - Fast Missile Boat Drills', type: 'missile-launch', impact: 'high' }
    ]
};

export default function GlobeInner({ activeConflict }: { activeConflict: string }) {
    const globeRef = useRef<any>(null);
    const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [globeStyle, setGlobeStyle] = useState<'dark' | 'night' | 'light' | 'satellite'>('satellite');
    const [countries, setCountries] = useState<any>({ features: [] });
    const [showPolitical, setShowPolitical] = useState(false);
    const [showPlanes, setShowPlanes] = useState(true);
    const [showVessels, setShowVessels] = useState(true);
    const [missileArcs, setMissileArcs] = useState<any[]>([]);
    const [explosions, setExplosions] = useState<any[]>([]);
    const [trails, setTrails] = useState<any[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    const config = CONFLICT_CONFIGS[activeConflict] || { lat: 0, lng: 0, alt: 1.5 };
    const baseAlerts = FAKE_ALERTS[activeConflict] || [];

    const [flightData, setFlightData] = useState<any[]>([]);
    const [mockTraffic, setMockTraffic] = useState<{ planes: any[], vessels: any[] }>({ planes: [], vessels: [] });

    // Update mock traffic when conflict changes
    useEffect(() => {
        setMockTraffic({
            planes: [
                { id: `RQ4-${activeConflict}`, label: 'USAF RQ-4 Global Hawk', lat: config.lat + 0.5, lng: config.lng + 2, type: 'plane', alt: 0.1, header: 45, speed: 0.05, countryCode: 'us', datasource: 'LIVE ELINT (SAT)' },
                { id: `E3-${activeConflict}`, label: 'NATO E-3 Sentry', lat: config.lat - 1, lng: config.lng - 3, type: 'plane', alt: 0.15, header: 130, speed: 0.04, countryCode: 'gb', datasource: 'LIVE ELINT (SAT)' },
            ],
            vessels: activeConflict === 'iran' ? [
                { id: 'CVN-72-LNC', label: 'USS Abraham Lincoln (CVN-72)', lat: 16.82, lng: 61.35, type: 'vessel', alt: 0, header: 145, speed: 0.004, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
                { id: 'DDG-111-SPR', label: 'USS Spruance (DDG 111)', lat: 16.55, lng: 61.12, type: 'vessel', alt: 0, header: 145, speed: 0.005, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
                { id: 'DDG-112-MUR', label: 'USS Michael Murphy (DDG 112)', lat: 17.15, lng: 61.58, type: 'vessel', alt: 0, header: 145, speed: 0.005, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
                { id: 'DDG-121-PTR', label: 'USS Frank E. Petersen Jr. (DDG 121)', lat: 16.68, lng: 61.82, type: 'vessel', alt: 0, header: 145, speed: 0.005, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
                { id: 'DDG-77-OKN', label: 'USS O\'Kane (DDG-77)', lat: 17.45, lng: 62.15, type: 'vessel', alt: 0, header: 145, speed: 0.005, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
                { id: 'DDG-60-HLM', label: 'USS Paul Hamilton (DDG 60)', lat: 16.95, lng: 60.55, type: 'vessel', alt: 0, header: 145, speed: 0.005, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
                { id: 'D37-DNC', label: 'HMS Duncan (D37)', lat: 25.12, lng: 57.85, type: 'vessel', alt: 0, header: 30, speed: 0.005, countryCode: 'gb', datasource: 'LIVE AIS (OSINT)' },
                { id: 'IRINS-JAM', label: 'IRINS Jamaran', lat: 26.95, lng: 55.45, type: 'vessel', alt: 0, header: 260, speed: 0.008, countryCode: 'ir', datasource: 'LIVE AIS (OSINT)' },
                { id: 'MV-T-CONF', label: 'MV True Confidence', lat: 12.05, lng: 44.85, type: 'vessel', alt: 0, header: 195, speed: 0.003, countryCode: 'unknown', datasource: 'LIVE AIS (OSINT)' }
            ] : [
                { id: 'vessel-u1', label: 'HMS Defender (D36)', lat: 45.1, lng: 32.4, type: 'vessel', alt: 0, header: 200, speed: 0.005, countryCode: 'gb', datasource: 'LIVE AIS (OSINT)' },
                { id: 'vessel-u2', label: 'USS Ross (DDG-71)', lat: 44.8, lng: 33.1, type: 'vessel', alt: 0, header: 45, speed: 0.004, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' }
            ]
        });
    }, [activeConflict, config]);

    const COUNTRY_MAP: Record<string, string> = {
        'Ukraine': 'ua', 'Turkey': 'tr', 'Poland': 'pl', 'Romania': 'ro',
        'United States': 'us', 'United Kingdom': 'gb', 'Russian Federation': 'ru',
        'France': 'fr', 'Germany': 'de', 'Iran, Islamic Republic of': 'ir',
        'Israel': 'il', 'Jordan': 'jo', 'Egypt': 'eg', 'Saudi Arabia': 'sa',
        'Iraq': 'iq', 'Syrian Arab Republic': 'sy', 'Finland': 'fi', 'Sweden': 'se',
        'Norway': 'no', 'Denmark': 'dk', 'Italy': 'it', 'Spain': 'es', 'Greece': 'gr'
    };

    useEffect(() => {
        // Initial fetch
        setActiveAlerts(baseAlerts.slice(0, 2));

        const intervalId = setInterval(() => {
            // Randomly update the active alerts array
            const count = Math.floor(Math.random() * baseAlerts.length) + 1;
            const shuffled = [...baseAlerts].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, count);
            setActiveAlerts(selected);

            // 🚨 MISSILE INTELLIGENCE & TRAJECTORY GENERATION
            const arcs: any[] = [];
            const newExplosions: any[] = [];

            selected.forEach(alert => {
                if (alert.type === 'missile-launch' || alert.type === 'missile-impact') {
                    const isImpact = alert.type === 'missile-impact';
                    // Predict target for launch, use alert site for impact
                    const targetLat = isImpact ? alert.lat : alert.lat + (Math.random() - 0.5) * 8;
                    const targetLng = isImpact ? alert.lng : alert.lng + (Math.random() - 0.5) * 8;

                    // Color palette based on origin
                    const isIranOrigin = activeConflict === 'iran' && (alert.label.includes('Tehran') || alert.label.includes('Persian Gulf'));
                    const isRussiaOrigin = activeConflict === 'ukraine' && (alert.label.includes('Russia') || alert.type === 'missile-impact');

                    const arcColor = (isIranOrigin || isRussiaOrigin)
                        ? ['rgba(255, 69, 0, 0.4)', 'rgba(255, 140, 0, 0.6)'] // Red-Orange for adversaries
                        : ['rgba(88, 166, 255, 0.4)', 'rgba(0, 191, 255, 0.6)']; // Blue-Cyan for allies/interceptions

                    const origin = isIranOrigin ? 'Iran (IRGC)' : (isRussiaOrigin ? 'Russian Federation' : 'Allied Defense Force');
                    const objective = alert.label || 'Strategic Infrastructure';

                    arcs.push({
                        id: `arc-${alert.id}-${Date.now()}`,
                        startLat: isImpact ? alert.lat - 5 : alert.lat,
                        startLng: isImpact ? alert.lng - 5 : alert.lng,
                        endLat: targetLat,
                        endLng: targetLng,
                        color: arcColor,
                        status: isImpact ? 'IMPACTED' : (Math.random() > 0.3 ? 'IN_FLIGHT' : 'INTERCEPTED'),
                        origin,
                        objective,
                        label: `Missile: ${origin}`
                    });

                    if (isImpact || Math.random() < 0.3) {
                        newExplosions.push({
                            id: `exp-${alert.id}-${Date.now()}`,
                            lat: targetLat,
                            lng: targetLng,
                            type: isImpact ? 'impact' : 'interception',
                            impact: alert.impact,
                            timestamp: Date.now()
                        });
                    }
                }
            });

            setMissileArcs(prev => [...prev.slice(-12), ...arcs]);
            setExplosions(prev => [...prev.slice(-15), ...newExplosions]);
        }, 6000); // Pulse cycle every 6 seconds

        return () => clearInterval(intervalId);
    }, [activeConflict, baseAlerts]);

    // Interpolation loop to animate vessels and mock planes
    useEffect(() => {
        const intervalId = setInterval(() => {
            const updateTrails = (entities: any[]) => {
                return entities.map(e => {
                    const rad = (90 - e.header) * (Math.PI / 180);
                    const speedFactor = (e.speed || 0.05) / 111320;
                    const newLng = e.lng + Math.cos(rad) * speedFactor * 1000;
                    const newLat = e.lat + Math.sin(rad) * speedFactor * 1000;

                    const history = e.history || [];
                    const newHistory = [...history, [newLng, newLat]].slice(-10); // Even shorter history for performance

                    return { ...e, lng: newLng, lat: newLat, history: newHistory };
                });
            };

            setMockTraffic(prev => ({
                planes: updateTrails(prev.planes),
                vessels: updateTrails(prev.vessels)
            }));

            setFlightData(prev => updateTrails(prev));
        }, 1000);

        return () => clearInterval(intervalId);
    }, []); // No dependencies - use functional updates to avoid interval restarts

    // Separate effect to update trails based on entity changes
    useEffect(() => {
        const allEntities = [...mockTraffic.planes, ...mockTraffic.vessels, ...flightData];
        const newTrails = allEntities.map(e => ({
            path: e.history || [],
            color: e.type === 'plane' ? '#a371f760' : '#58a6ff60'
        }));
        setTrails(newTrails);
    }, [mockTraffic.planes, mockTraffic.vessels, flightData]);

    // Fetch real API data
    useEffect(() => {
        const fetchTraffic = async () => {
            try {
                // define bounding box roughly 15 degrees around the config center
                const res = await fetch(`/api/traffic?lamin=${config.lat - 15}&lomin=${config.lng - 15}&lamax=${config.lat + 15}&lomax=${config.lng + 15}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.states) {
                        const subset = data.states.slice(0, 10).map((s: any) => {
                            const id = s[0];
                            const existing = flightData.find(f => f.id === id);
                            return {
                                id,
                                label: (s[1] || '').trim() || 'Unknown Flight',
                                lng: s[5],
                                lat: s[6],
                                alt: Math.min((s[7] || 10000) / 100000, 0.4),
                                type: 'plane',
                                header: s[10] || 0,
                                speed: s[9] || 250,
                                countryCode: COUNTRY_MAP[s[2]] || 'unknown',
                                datasource: 'LIVE ADS-B',
                                history: existing ? existing.history : [[s[5], s[6]]]
                            };
                        });
                        setFlightData(subset);
                    }
                }
            } catch (e) { }
        };
        fetchTraffic();
        const poll = setInterval(fetchTraffic, 15000);
        return () => clearInterval(poll);
    }, [config.lat, config.lng]);

    // Fetch Countries for Political style
    useEffect(() => {
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
            .then(res => res.json())
            .then(setCountries)
            .catch(err => console.error('Failed to load countries:', err));
    }, []);

    useEffect(() => {
        if (globeRef.current) {
            // Start rotating the globe initially, then smoothly pan to the active conflict region
            const controls = globeRef.current.controls();
            controls.autoRotateSpeed = 0.5;
            controls.autoRotate = true;

            // Ensure the globe rotates into position
            setTimeout(() => {
                globeRef.current?.pointOfView({ lat: config.lat, lng: config.lng, altitude: config.alt }, 2000);
                // Stop auto rotation after reaching destination
                setTimeout(() => { controls.autoRotate = false; }, 2000);
            }, 500);
        }
    }, [activeConflict, config]);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getImpactColor = (impact: string) => {
        if (impact === 'high') return '#e05252';
        if (impact === 'medium') return '#f0a500';
        return '#58a6ff';
    };

    // HTML content for labels
    const labelHtml = (d: any) => `
    <div style="
      background: rgba(13, 17, 23, 0.8);
      border: 1px solid ${getImpactColor(d.impact)}40;
      color: #e6edf3;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: bold;
      pointer-events: none;
      white-space: nowrap;
      filter: drop-shadow(0 0 4px ${getImpactColor(d.impact)}80);
      transform: translate(-50%, -120%);
    ">
      ${d.label}
    </div>
  `;

    // HTML for planes and vessels
    const planeHtml = (d: any) => `
      <div 
        style="color: #a371f7; background: rgba(0,0,0,0.6); border-radius: 50%; border: 1px solid #a371f740; cursor: pointer; pointer-events: auto; transform: translate(-50%, -50%) rotate(${d.header || 0}deg); display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; box-shadow: 0 0 8px rgba(163, 113, 247, 0.4); transition: width 0.2s, height 0.2s; position: relative;"
        onpointerdown="const e = new CustomEvent('entity-click', { detail: { id: '${d.id}', type: 'plane', label: '${d.label}' } }); window.dispatchEvent(e);"
        onmouseover="this.querySelector('.flag-tag').style.opacity='1'; this.style.width='32px'; this.style.height='32px';"
        onmouseout="this.querySelector('.flag-tag').style.opacity='0'; this.style.width='24px'; this.style.height='24px';"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(-45deg)"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3.5 3.5L3 16l-1 1 5 1 1 5 1-1-1-2.5L12 16l5 6 1.2-1.2c.4-.2.7-.6.6-1Z"/></svg>
        ${d.countryCode && d.countryCode !== 'unknown' ? `
          <div class="flag-tag" style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%) rotate(${- (d.header || 0)}deg); opacity: 0; transition: opacity 0.2s; background: #000; border: 1px solid #fff3; padding: 1px; border-radius: 2px;">
            <img src="https://flagcdn.com/w20/${d.countryCode}.png" width="12" height="9" alt="${d.countryCode}" style="display: block;">
          </div>
        ` : ''}
      </div>
    `;

    const explosionHtml = (d: any) => {
        const isInterception = d.type === 'interception';
        const color = isInterception ? '#58a6ff' : '#ff4d4d';
        return `
      <div style="position: relative; width: 30px; height: 30px; transform: translate(-50%, -50%); pointer-events: none;">
        <div style="position: absolute; width: 100%; height: 100%; border: 2px solid ${color}; border-radius: 50%; animation: blast-pulse 1.2s ease-out forwards; opacity: 0;"></div>
        <div style="position: absolute; width: 60%; height: 60%; top: 20%; left: 20%; border: 1.5px solid ${color}; border-radius: 50%; animation: blast-pulse 1.2s ease-out 0.2s forwards; opacity: 0;"></div>
        ${isInterception ? `<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: ${color}; font-size: 10px; font-weight: bold;">✕</div>` : ''}
        <style>
          @keyframes blast-pulse {
            0% { transform: scale(0.1); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
          }
        </style>
      </div>
    `;
    };

    const vesselHtml = (d: any) => `
      <div 
        style="color: #58a6ff; background: rgba(0,0,0,0.6); border-radius: 50%; border: 1px solid #58a6ff40; cursor: pointer; pointer-events: auto; transform: translate(-50%, -50%) rotate(${d.header || 0}deg); display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; box-shadow: 0 0 8px rgba(88, 166, 255, 0.4); transition: width 0.2s, height 0.2s; position: relative;"
        onpointerdown="const e = new CustomEvent('entity-click', { detail: { id: '${d.id}', type: 'vessel', label: '${d.label}' } }); window.dispatchEvent(e);"
        onmouseover="this.querySelector('.flag-tag').style.opacity='1'; this.style.width='32px'; this.style.height='32px';"
        onmouseout="this.querySelector('.flag-tag').style.opacity='0'; this.style.width='24px'; this.style.height='24px';"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(-90deg)"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/></svg>
        ${d.countryCode && d.countryCode !== 'unknown' ? `
          <div class="flag-tag" style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%) rotate(${- (d.header || 0)}deg); opacity: 0; transition: opacity 0.2s; background: #000; border: 1px solid #fff3; padding: 1px; border-radius: 2px;">
            <img src="https://flagcdn.com/w20/${d.countryCode}.png" width="12" height="9" alt="${d.countryCode}" style="display: block;">
          </div>
        ` : ''}
      </div>
    `;

    const overlayData = useMemo(() => {
        let items: any[] = [...activeAlerts];
        if (showPlanes) {
            items = [...items, ...(flightData.length > 0 ? flightData : mockTraffic.planes)];
        }
        if (showVessels) {
            items = [...items, ...mockTraffic.vessels];
        }
        // Add explosions to overlay (only for animation duration: 1.5s)
        const recentFX = explosions.filter(e => Date.now() - e.timestamp < 1500);
        items = [...items, ...recentFX.map(e => ({ ...e, type: 'explosion_fx' }))];
        return items;
    }, [activeAlerts, showPlanes, flightData, mockTraffic.planes, showVessels, mockTraffic.vessels, explosions]);

    const [trackedEntity, setTrackedEntity] = useState<any>(null);

    useEffect(() => {
        const handleEntityClick = (e: any) => {
            const data = e.detail;
            setTrackedEntity(data);
        };
        window.addEventListener('entity-click', handleEntityClick as any);
        return () => window.removeEventListener('entity-click', handleEntityClick as any);
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full relative cursor-grab active:cursor-grabbing pb-12 overflow-hidden bg-[#0d1117] flex items-center justify-center">
            {dimensions.width > 0 && dimensions.height > 0 && (
                <Globe
                    ref={globeRef}
                    width={dimensions.width}
                    height={dimensions.height}
                    globeImageUrl={
                        globeStyle === 'dark' ? "//unpkg.com/three-globe/example/img/earth-dark.jpg" :
                            globeStyle === 'night' ? "//unpkg.com/three-globe/example/img/earth-night.jpg" :
                                globeStyle === 'satellite' ? "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg" :
                                    "//unpkg.com/three-globe/example/img/earth-day.jpg"
                    }
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundColor={globeStyle === 'light' ? "#f0f0f0" : "#0d1117"}
                    showAtmosphere={true}
                    atmosphereColor={globeStyle === 'light' ? "lightskyblue" : "rgba(3,102,214,1)"}
                    atmosphereAltitude={0.15}

                    // Political Layer
                    polygonsData={showPolitical ? countries.features : null}
                    polygonCapColor={() => 'rgba(255, 255, 255, 0.4)'}
                    polygonSideColor={() => 'rgba(0, 0, 0, 0.05)'}
                    polygonStrokeColor={() => globeStyle === 'light' ? '#666' : '#888'}

                    labelsData={showPolitical ? countries.features : []}
                    labelLat={(d: any) => d.properties.LABEL_Y || 0}
                    labelLng={(d: any) => d.properties.LABEL_X || 0}
                    labelText={(d: any) => d.properties.NAME}
                    labelSize={(d: any) => 0.8}
                    labelDotRadius={(d: any) => 0.2}
                    labelColor={() => globeStyle === 'light' ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 0.9)'}
                    labelResolution={2} // Better performance
                    labelAltitude={0.01}



                    // Missiles Layer
                    arcsData={missileArcs}
                    arcStartLat="startLat"
                    arcStartLng="startLng"
                    arcEndLat="endLat"
                    arcEndLng="endLng"
                    arcColor="color"
                    arcDashLength={0.2}
                    arcDashGap={1}
                    arcDashAnimateTime={2500}
                    arcStroke={0.4}
                    arcAltitude={0.25}
                    onArcClick={(arc) => {
                        setTrackedEntity({
                            ...arc,
                            type: 'missile',
                            datasource: 'LIVE BALLISTIC TRACKING'
                        });
                    }}


                    // Entity Trails
                    pathsData={trails}
                    pathPoints="path"
                    pathPointLat={(p: any) => p[1]}
                    pathPointLng={(p: any) => p[0]}
                    pathColor={(d: any) => d.color}
                    pathDashLength={0.1}
                    pathDashGap={0.008}
                    pathDashAnimateTime={12000}
                    pathStroke={0.5}

                    htmlElementsData={overlayData}
                    htmlLat="lat"
                    htmlLng="lng"
                    htmlElement={(d: any) => {
                        const el = document.createElement('div');
                        if (d.type === 'plane') el.innerHTML = planeHtml(d);
                        else if (d.type === 'vessel') el.innerHTML = vesselHtml(d);
                        else if (d.type === 'explosion_fx') el.innerHTML = explosionHtml(d);
                        else el.innerHTML = labelHtml(d);
                        return el;
                    }}
                    customLayerData={activeAlerts}
                    customThreeObject={(d: any) => {
                        const color = getImpactColor(d.impact);
                        const group = new THREE.Group();
                        const geometry = new THREE.SphereGeometry(0.5, 16, 16);
                        const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 });
                        const sphere = new THREE.Mesh(geometry, material);
                        group.add(sphere);
                        return group;
                    }}
                    customThreeObjectUpdate={(obj, d: any) => {
                        Object.assign(obj.position, globeRef.current?.getCoords(d.lat, d.lng));
                    }}

                    // Impacts & Interceptions (stale points removed after 30s)
                    pointsData={[...activeAlerts, ...explosions.filter(e => Date.now() - e.timestamp < 30000)]}
                    pointLat="lat"
                    pointLng="lng"
                    pointColor={(d: any) => d.type === 'interception' ? 'rgba(88, 166, 255, 0.4)' : (d.type === 'impact' ? 'rgba(255, 61, 61, 0.4)' : getImpactColor(d.impact))}
                    pointAltitude={0.01}
                    pointRadius={(d: any) => d.type === 'impact' || d.type === 'interception' ? 0.2 : 0.3}

                    // Active Rings for Impacts & Alerts
                    ringsData={[...activeAlerts, ...explosions.filter(e => Date.now() - e.timestamp < 10000)]}
                    ringLat="lat"
                    ringLng="lng"
                    ringColor={(d: any) => d.type === 'interception' ? 'rgba(88, 166, 255, 0.6)' : (d.timestamp ? 'rgba(255, 62, 62, 0.6)' : getImpactColor(d.impact))}
                    ringMaxRadius={(d: any) => d.timestamp ? 6 : 3}
                    ringPropagationSpeed={(d: any) => d.timestamp ? 4 : 2}
                    ringRepeatPeriod={(d: any) => d.timestamp ? 1200 : 1500}

                />
            )}

            {/* Controls and Legend inside map view */}
            <div className="absolute bottom-4 left-4 glass-panel p-3 rounded-lg flex flex-col gap-3 z-10 pointer-events-auto">
                <div>
                    <h3 className="text-[10px] text-[#8b949e] font-bold tracking-wider uppercase mb-2">Live Activity</h3>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#e05252]" />
                        <span className="text-[11px] text-[#e6edf3]">High Intensity Engagement</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ff8c00aa]" />
                        <span className="text-[11px] text-[#e6edf3]">Missile Launch (Adversary)</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00bffffa]" />
                        <span className="text-[11px] text-[#e6edf3]">Air Defense / Interception</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2.5 h-0.5 bg-[#a371f780]" />
                        <span className="text-[11px] text-[#e6edf3]">Reconnaissance Trail</span>
                    </div>
                </div>

                <div className="h-px w-full bg-[#30363d]" />

                <div className="flex flex-col gap-1.5">
                    <h3 className="text-[10px] text-[#8b949e] font-bold tracking-wider uppercase mb-1">Globe Style</h3>
                    <div className="flex flex-wrap gap-1.5">
                        <button
                            onClick={() => setGlobeStyle('satellite')}
                            className={`text-[9px] px-2 py-1 rounded transition border ${globeStyle === 'satellite' ? 'bg-[#58a6ff] border-[#58a6ff] text-white' : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]'}`}
                        >
                            Satellite
                        </button>
                        <button
                            onClick={() => setGlobeStyle('dark')}
                            className={`text-[9px] px-2 py-1 rounded transition border ${globeStyle === 'dark' ? 'bg-[#58a6ff] border-[#58a6ff] text-white' : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]'}`}
                        >
                            Dark
                        </button>
                        <button
                            onClick={() => setGlobeStyle('night')}
                            className={`text-[9px] px-2 py-1 rounded transition border ${globeStyle === 'night' ? 'bg-[#58a6ff] border-[#58a6ff] text-white' : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]'}`}
                        >
                            Night
                        </button>
                        <button
                            onClick={() => setGlobeStyle('light')}
                            className={`text-[9px] px-2 py-1 rounded transition border ${globeStyle === 'light' ? 'bg-[#58a6ff] border-[#58a6ff] text-white' : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]'}`}
                        >
                            Political (Light)
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <label className="text-[10px] text-white flex items-center gap-1 cursor-pointer hover:text-[#58a6ff]">
                            <input type="checkbox" checked={showPlanes} onChange={(e) => setShowPlanes(e.target.checked)} className="accent-[#58a6ff]" />
                            ✈️ Air
                        </label>
                        <label className="text-[10px] text-white flex items-center gap-1 cursor-pointer hover:text-[#58a6ff]">
                            <input type="checkbox" checked={showVessels} onChange={(e) => setShowVessels(e.target.checked)} className="accent-[#58a6ff]" />
                            🚢 Naval
                        </label>
                        <label className="text-[10px] text-white flex items-center gap-1 cursor-pointer hover:text-[#58a6ff]">
                            <input type="checkbox" checked={showPolitical} onChange={(e) => setShowPolitical(e.target.checked)} className="accent-[#58a6ff]" />
                            🗺️ Borders
                        </label>
                    </div>
                </div>
            </div>

            {/* Tracked Entity Overlay */}
            {trackedEntity && (
                <div className="absolute top-4 right-4 glass-panel p-4 rounded-lg z-10 pointer-events-auto w-64 border border-[#30363d]">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xs font-bold text-white flex items-center gap-2">
                            {trackedEntity.type === 'plane' ? '✈️' : trackedEntity.type === 'vessel' ? '🚢' : trackedEntity.type === 'missile' ? '🚀' : '📍'}
                            {trackedEntity.type === 'plane' ? 'Air Target' : trackedEntity.type === 'vessel' ? 'Naval Target' : trackedEntity.type === 'missile' ? 'Ballistic Track' : 'Target'}
                        </h3>
                        <button onClick={() => setTrackedEntity(null)} className="text-[#8b949e] hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-[#58a6ff]">{trackedEntity.label}</p>

                        {trackedEntity.type === 'missile' && (
                            <>
                                <div className="flex justify-between text-[10px] bg-[#0d1117] p-2 rounded">
                                    <span className="text-[#8b949e]">Origin:</span>
                                    <span className="text-white font-bold">{trackedEntity.origin}</span>
                                </div>
                                <div className="flex justify-between text-[10px] bg-[#0d1117] p-2 rounded">
                                    <span className="text-[#8b949e]">Objective:</span>
                                    <span className="text-white truncate max-w-[120px]">{trackedEntity.objective}</span>
                                </div>
                            </>
                        )}

                        <div className="flex justify-between text-[10px] bg-[#0d1117] p-2 rounded">
                            <span className="text-[#8b949e]">ID:</span>
                            <span className="font-mono text-white text-[9px]">{trackedEntity.id.split('-').slice(0, 2).join('-')}</span>
                        </div>
                        <div className="flex justify-between text-[10px] bg-[#0d1117] p-2 rounded">
                            <span className="text-[#8b949e]">Data Source:</span>
                            <span className={trackedEntity.datasource === 'LIVE ADS-B' || trackedEntity.datasource === 'LIVE AIS (OSINT)' ? "text-[#3fb950] font-bold" : "text-[#f0a500] font-bold"}>
                                {trackedEntity.datasource || 'INTELLIGENCE FEED'}
                            </span>
                        </div>
                        <div className="flex justify-between text-[10px] bg-[#0d1117] p-2 rounded">
                            <span className="text-[#8b949e]">Status:</span>
                            <span className={`font-bold ${trackedEntity.status === 'IMPACTED' ? 'text-[#ff3e3e]' : trackedEntity.status === 'INTERCEPTED' ? 'text-[#58a6ff]' : 'text-[#3fb950] animate-pulse'}`}>
                                {trackedEntity.status === 'IN_FLIGHT' ? '● Flight Active' : trackedEntity.status === 'INTERCEPTED' ? '◌ Neutralized (Iron Dome)' : '● Impact Confirmed'}
                            </span>
                        </div>
                    </div>

                    {/* OSINT Tools Integration */}
                    {(trackedEntity.type === 'plane' || trackedEntity.type === 'vessel') && (
                        <div className="mt-3 pt-3 border-t border-[#30363d] flex flex-col gap-2">
                            <span className="text-[9px] text-[#8b949e] uppercase font-bold tracking-wider">Live Radar Integration</span>
                            {trackedEntity.type === 'plane' ? (
                                <>
                                    <a href={`https://globe.adsbexchange.com/?icao=${trackedEntity.id}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] rounded text-[10px] text-[#e6edf3] transition-colors">
                                        Open in ADS-B Exchange
                                    </a>
                                    <a href={`https://www.flightradar24.com/realtimeradar?icao=${trackedEntity.id}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] rounded text-[10px] text-[#e6edf3] transition-colors">
                                        Open in Flightradar24
                                    </a>
                                </>
                            ) : (
                                <>
                                    <a href={`https://www.marinetraffic.com/en/ais/details/ships/name:${encodeURIComponent(trackedEntity.label)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] rounded text-[10px] text-[#e6edf3] transition-colors font-bold text-[#58a6ff]">
                                        Track on MarineTraffic
                                    </a>
                                    <a href={`https://www.shipspotting.com/ships/search?q=${encodeURIComponent(trackedEntity.label)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] rounded text-[10px] text-[#e6edf3] transition-colors">
                                        Open in ShipSpotting
                                    </a>
                                </>
                            )}
                        </div>
                    )}

                    {trackedEntity.type === 'missile' && (
                        <div className="mt-3 pt-3 border-t border-[#30363d] flex flex-col gap-2">
                            <span className="text-[9px] text-[#8b949e] uppercase font-bold tracking-wider">Intelligence Data</span>
                            <div className="text-[10px] text-[#e6edf3] bg-[#0d1117] p-2 rounded leading-relaxed">
                                {trackedEntity.status === 'INTERCEPTED'
                                    ? "Track eliminated by Arrow-3 defense system. Collision signature detected in upper atmosphere."
                                    : trackedEntity.status === 'IMPACTED'
                                        ? "Thermal signature spike at objective coordinates. Local assets confirming impact damage."
                                        : "Active trajectory analysis suggests high-velocity ballistic profile. Possible payload: Conventional/Thermobaric."}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
