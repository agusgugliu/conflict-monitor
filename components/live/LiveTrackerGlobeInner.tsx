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
        { id: 'i5', lat: 27.2154, lng: 52.6841, label: 'Persian Gulf - Fast Missile Boat Drills', type: 'missile-launch', impact: 'high' },
        { id: 'i6', lat: 32.6539, lng: 51.6660, label: 'Isfahan - Airbase Strike', type: 'missile-impact', impact: 'high' },
        { id: 'i7', lat: 29.5926, lng: 52.5836, label: 'Shiraz - Unknown Explosion', type: 'missile-impact', impact: 'high' },
        { id: 'i8', lat: 38.0792, lng: 46.2887, label: 'Tabriz - Strategic Impact', type: 'missile-impact', impact: 'medium' },
        { id: 'i9', lat: 31.7683, lng: 35.2137, label: 'Jerusalem - Iron Dome Interception', type: 'missile-impact', impact: 'high' }
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
    const [showMissiles, setShowMissiles] = useState(true);
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
        const globalPlanes = [
            // US
            { id: `US-RQ4-GLB-1`, label: 'USAF RQ-4 Global Hawk', lat: config.lat + 0.5, lng: config.lng + 2, type: 'plane', alt: 0.1, header: 45, speed: 0.05, countryCode: 'us', datasource: 'LIVE ELINT (SAT)', departure: 'Al Dhafra Air Base (UAE)', destination: 'Loitering (AOR)', airframe: 'Northrop Grumman RQ-4' },
            { id: `US-RQ4-GLB-2`, label: 'USAF RQ-4 Global Hawk', lat: 34.1, lng: 36.3, type: 'plane', alt: 0.1, header: 120, speed: 0.05, countryCode: 'us', datasource: 'LIVE ELINT (SAT)', departure: 'NAS Sigonella (Italy)', destination: 'Eastern Mediterranean', airframe: 'Northrop Grumman RQ-4' },
            { id: `US-RC135-EU`, label: 'USAF RC-135V Rivet Joint', lat: 52.5, lng: 15.2, type: 'plane', alt: 0.12, header: 270, speed: 0.04, countryCode: 'us', datasource: 'LIVE ELINT (SAT)', departure: 'RAF Mildenhall (UK)', destination: 'Baltic Sea Recon', airframe: 'Boeing RC-135V' },
            { id: `US-P8-PAC`, label: 'USN P-8A Poseidon', lat: 22.3, lng: 121.5, type: 'plane', alt: 0.08, header: 180, speed: 0.035, countryCode: 'us', datasource: 'LIVE ADS-B', departure: 'Kadena Air Base (Japan)', destination: 'South China Sea Patrol', airframe: 'Boeing P-8A Poseidon' },
            { id: `US-P8-MED`, label: 'USN P-8A Poseidon', lat: 33.5, lng: 31.0, type: 'plane', alt: 0.08, header: 90, speed: 0.035, countryCode: 'us', datasource: 'LIVE ADS-B', departure: 'NAS Sigonella (Italy)', destination: 'Eastern Med Patrol', airframe: 'Boeing P-8A Poseidon' },
            { id: `US-E3-MED`, label: 'NATO E-3 Sentry', lat: 34.5, lng: 20.0, type: 'plane', alt: 0.15, header: 90, speed: 0.045, countryCode: 'us', datasource: 'LIVE ELINT (SAT)', departure: 'Geilenkirchen (Germany)', destination: 'Mediterranean Sea', airframe: 'Boeing E-3 Sentry AWACS' },
            { id: `US-MQ9-RED`, label: 'USAF MQ-9 Reaper', lat: 18.5, lng: 40.2, type: 'plane', alt: 0.05, header: 150, speed: 0.025, countryCode: 'us', datasource: 'LIVE ADS-B', departure: 'Camp Lemonnier (Djibouti)', destination: 'Red Sea Patrol', airframe: 'General Atomics MQ-9' },
            { id: `US-F35-ME`, label: 'USAF F-35A Lightning II', lat: 28.5, lng: 49.2, type: 'plane', alt: 0.09, header: 210, speed: 0.08, countryCode: 'us', datasource: 'LIVE ELINT (SAT)', departure: 'Al Dhafra Air Base (UAE)', destination: 'Classified (AOR)', airframe: 'Lockheed Martin F-35A' },

            // Israel
            { id: `IL-F35I-1`, label: 'IAF F-35I Adir', lat: 32.1, lng: 34.8, type: 'plane', alt: 0.08, header: 45, speed: 0.09, countryCode: 'il', datasource: 'LIVE ELINT (SAT)', departure: 'Nevatim Airbase (Israel)', destination: 'Classified', airframe: 'Lockheed Martin F-35I Adir' },
            { id: `IL-F15I-1`, label: 'IAF F-15I Ra\'am', lat: 33.0, lng: 35.5, type: 'plane', alt: 0.07, header: 30, speed: 0.085, countryCode: 'il', datasource: 'LIVE ELINT (SAT)', departure: 'Hatzerim Airbase (Israel)', destination: 'Northern Border CAP', airframe: 'McDonnell Douglas F-15I' },
            { id: `IL-G550-1`, label: 'IAF G550 Nachshon Aitam', lat: 31.5, lng: 34.0, type: 'plane', alt: 0.12, header: 180, speed: 0.04, countryCode: 'il', datasource: 'LIVE ADS-B', departure: 'Nevatim Airbase (Israel)', destination: 'Mediterranean Coast', airframe: 'Gulfstream G550 AEW' },
            { id: `IL-HERON-1`, label: 'IAF Heron TP', lat: 33.8, lng: 35.8, type: 'plane', alt: 0.05, header: 90, speed: 0.02, countryCode: 'il', datasource: 'LIVE ADS-B', departure: 'Tel Nof Airbase (Israel)', destination: 'Lebanon Surveillance', airframe: 'IAI Heron TP Eitan' },

            // UK
            { id: `UK-RC135`, label: 'RAF RC-135W', lat: 54.0, lng: -2.0, type: 'plane', alt: 0.11, header: 110, speed: 0.045, countryCode: 'gb', datasource: 'LIVE ADS-B', departure: 'RAF Waddington (UK)', destination: 'Black Sea Recon', airframe: 'Boeing RC-135W' },
            { id: `UK-E3-NATO`, label: 'RAF E-3D Sentry', lat: config.lat - 1, lng: config.lng - 3, type: 'plane', alt: 0.15, header: 130, speed: 0.04, countryCode: 'gb', datasource: 'LIVE ELINT (SAT)', departure: 'RAF Waddington (UK)', destination: 'Eastern Europe Patrol', airframe: 'Boeing E-3D Sentry' },

            // Russia (if Ukraine involved, or globally just in case)
            { id: 'RU-A50-BLR', label: 'RuAF A-50U', lat: 53.8, lng: 27.5, type: 'plane', alt: 0.12, header: 80, speed: 0.04, countryCode: 'ru', datasource: 'LIVE ELINT (SAT)', departure: 'Machulishchy Base (Belarus)', destination: 'Belarus Airspace', airframe: 'Beriev A-50U Mainstay' },
            { id: 'RU-TU95-PAC', label: 'RuAF Tu-95MS', lat: 55.4, lng: 150.2, type: 'plane', alt: 0.11, header: 240, speed: 0.042, countryCode: 'ru', datasource: 'LIVE ELINT (SAT)', departure: 'Engels-2 Air Base (Russia)', destination: 'North Pacific Patrol', airframe: 'Tupolev Tu-95MS Bear' },
            { id: 'RU-SU35-SYR', label: 'RuAF Su-35S', lat: 35.1, lng: 36.2, type: 'plane', alt: 0.09, header: 160, speed: 0.06, countryCode: 'ru', datasource: 'LIVE ADS-B', departure: 'Khmeimim Air Base (Syria)', destination: 'Eastern Mediterranean', airframe: 'Sukhoi Su-35S Flanker-E' },

            // Iran
            { id: 'IR-F14-THR', label: 'IRIAF F-14 Tomcat', lat: 35.6, lng: 51.4, type: 'plane', alt: 0.07, header: 260, speed: 0.05, countryCode: 'ir', datasource: 'LIVE ADS-B', departure: 'Mehrabad Airbase (Iran)', destination: 'Tehran CAP', airframe: 'Grumman F-14 Tomcat' },
            { id: 'IR-MOH-UAV', label: 'IRGC Mohajer-6', lat: 33.5, lng: 44.5, type: 'plane', alt: 0.05, header: 300, speed: 0.02, countryCode: 'ir', datasource: 'LIVE ELINT (SAT)', departure: 'Kermanshah Airbase (Iran)', destination: 'Iraq Border Recon', airframe: 'Mohajer-6 UCAV' }
        ];

        const globalVessels = [
            // US Carrier Strike Groups & Global presence
            { id: 'CVN-72-PAC', label: 'USS Abraham Lincoln (CVN-72)', lat: 16.82, lng: 61.35, type: 'vessel', alt: 0, header: 145, speed: 0.004, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
            { id: 'DDG-111-SPR', label: 'USS Spruance (DDG 111)', lat: 16.55, lng: 61.12, type: 'vessel', alt: 0, header: 145, speed: 0.005, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
            { id: 'DDG-71-BLK', label: 'USS Ross (DDG-71)', lat: 44.8, lng: 33.1, type: 'vessel', alt: 0, header: 45, speed: 0.004, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
            { id: 'CVN-69-MED', label: 'USS Dwight D. Eisenhower (CVN-69)', lat: 34.2, lng: 25.4, type: 'vessel', alt: 0, header: 270, speed: 0.003, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
            { id: 'DDG-1000-PAC', label: 'USS Zumwalt (DDG-1000)', lat: 21.3, lng: -157.9, type: 'vessel', alt: 0, header: 200, speed: 0.006, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
            { id: 'LHD-4-BOX', label: 'USS Boxer (LHD-4)', lat: 15.2, lng: 55.4, type: 'vessel', alt: 0, header: 280, speed: 0.003, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
            { id: 'DDG-51-ARL', label: 'USS Arleigh Burke (DDG-51)', lat: 33.1, lng: 34.8, type: 'vessel', alt: 0, header: 10, speed: 0.005, countryCode: 'us', datasource: 'LIVE AIS (OSINT)' },
            { id: 'SSN-774-VIR', label: 'USS Virginia (SSN-774)', lat: 34.1, lng: 33.5, type: 'vessel', alt: -0.01, header: 90, speed: 0.002, countryCode: 'us', datasource: 'LIVE ELINT (SAT)' },

            // Israel
            { id: 'INS-EILAT', label: 'INS Eilat (Sa\'ar 5)', lat: 32.5, lng: 34.0, type: 'vessel', alt: 0, header: 180, speed: 0.005, countryCode: 'il', datasource: 'LIVE AIS (OSINT)' },
            { id: 'INS-LAHAV', label: 'INS Lahav (Sa\'ar 5)', lat: 31.8, lng: 34.2, type: 'vessel', alt: 0, header: 360, speed: 0.004, countryCode: 'il', datasource: 'LIVE AIS (OSINT)' },
            { id: 'INS-MAGEN', label: 'INS Magen (Sa\'ar 6)', lat: 32.9, lng: 34.5, type: 'vessel', alt: 0, header: 270, speed: 0.005, countryCode: 'il', datasource: 'LIVE AIS (OSINT)' },
            { id: 'INS-DRAKON', label: 'INS Drakon (Dolphin-class)', lat: 33.2, lng: 33.8, type: 'vessel', alt: -0.01, header: 45, speed: 0.002, countryCode: 'il', datasource: 'LIVE ELINT (SAT)' },

            // UK
            { id: 'D37-DNC', label: 'HMS Duncan (D37)', lat: 25.12, lng: 57.85, type: 'vessel', alt: 0, header: 30, speed: 0.005, countryCode: 'gb', datasource: 'LIVE AIS (OSINT)' },
            { id: 'D36-DEF', label: 'HMS Defender (D36)', lat: 45.1, lng: 32.4, type: 'vessel', alt: 0, header: 200, speed: 0.005, countryCode: 'gb', datasource: 'LIVE AIS (OSINT)' },
            { id: 'R08-QNLZ', label: 'HMS Queen Elizabeth (R08)', lat: 50.2, lng: -4.5, type: 'vessel', alt: 0, header: 180, speed: 0.003, countryCode: 'gb', datasource: 'LIVE AIS (OSINT)' },

            // Russia
            { id: 'RU-CG-VRYG', label: 'Varyag (Slava-class)', lat: 35.8, lng: 35.9, type: 'vessel', alt: 0, header: 90, speed: 0.004, countryCode: 'ru', datasource: 'LIVE AIS (OSINT)' },
            { id: 'RU-SSN-SEV', label: 'Severodvinsk (Yasen-class)', lat: 68.5, lng: 35.2, type: 'vessel', alt: -0.01, header: 45, speed: 0.002, countryCode: 'ru', datasource: 'LIVE ELINT (SAT)' },
            { id: 'RU-DDG-ADM', label: 'Admiral Gorshkov', lat: 54.5, lng: 19.5, type: 'vessel', alt: 0, header: 260, speed: 0.005, countryCode: 'ru', datasource: 'LIVE AIS (OSINT)' },

            // Iran
            { id: 'IRINS-JAM', label: 'IRINS Jamaran', lat: 26.95, lng: 55.45, type: 'vessel', alt: 0, header: 260, speed: 0.008, countryCode: 'ir', datasource: 'LIVE AIS (OSINT)' },
            { id: 'IRINS-MAKRAN', label: 'IRINS Makran', lat: -5.4, lng: 40.2, type: 'vessel', alt: 0, header: 180, speed: 0.004, countryCode: 'ir', datasource: 'LIVE AIS (OSINT)' },
            { id: 'IRGC-FAST', label: 'IRGC Fast Attack Craft Formation', lat: 25.5, lng: 54.8, type: 'vessel', alt: 0, header: 90, speed: 0.012, countryCode: 'ir', datasource: 'LIVE ELINT (SAT)' },

            // Others / Commercial incident related
            { id: 'MV-T-CONF', label: 'MV True Confidence', lat: 12.05, lng: 44.85, type: 'vessel', alt: 0, header: 195, speed: 0.003, countryCode: 'unknown', datasource: 'LIVE AIS (OSINT)' }
        ];

        setMockTraffic({
            planes: globalPlanes,
            vessels: globalVessels
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

                    let originLat = alert.lat;
                    let originLng = alert.lng;
                    let targetLat = alert.lat;
                    let targetLng = alert.lng;

                    if (activeConflict === 'iran') {
                        // E.g., Iran to Israel or vice versa
                        const isTargetInIran = alert.lng > 44; // Anything east of Iraq roughly is Iranian territory

                        if (isImpact) {
                            if (isTargetInIran) {
                                // Impact in Iran. Origin is likely Allied/Israel (e.g. Nevatim)
                                originLat = 31.2;
                                originLng = 35.0;
                            } else {
                                // Impact in Israel. Origin is Iran (e.g. Kermanshah)
                                originLat = 34.3;
                                originLng = 47.0;
                            }
                        } else {
                            // Launch event
                            if (isTargetInIran) {
                                // Launch from Iran. Target is Israel (e.g. Tel Aviv/Jerusalem)
                                targetLat = 31.7;
                                targetLng = 35.2;
                            } else {
                                // Launch from Israel/Allies. Target is Iran (e.g. Tehran)
                                targetLat = 35.6;
                                targetLng = 51.3;
                            }
                        }
                    } else if (activeConflict === 'ukraine') {
                        // E.g., Russia to Ukraine
                        originLat = isImpact ? 50.6 : alert.lat; // Belgorod basis if impact
                        originLng = isImpact ? 36.6 : alert.lng;
                        targetLat = isImpact ? alert.lat : 50.4; // Kyiv basis if launch
                        targetLng = isImpact ? alert.lng : 30.5;
                    }

                    // Sligth variation for realism rather than wide randomness
                    if (isImpact) {
                        originLat += (Math.random() - 0.5) * 2;
                        originLng += (Math.random() - 0.5) * 2;
                    } else {
                        targetLat += (Math.random() - 0.5) * 2;
                        targetLng += (Math.random() - 0.5) * 2;
                    }

                    // Color palette based on origin
                    const isIranOrigin = activeConflict === 'iran' && (originLng > 44);
                    const isRussiaOrigin = activeConflict === 'ukraine' && (!alert.label.includes('Ukraine'));

                    const arcColor = (isIranOrigin || isRussiaOrigin)
                        ? ['rgba(255, 69, 0, 0.9)', 'rgba(255, 140, 0, 0.1)'] // Solid hot orange trailing off
                        : ['rgba(0, 191, 255, 0.9)', 'rgba(88, 166, 255, 0.1)']; // Solid cyan trailing off

                    const origin = isIranOrigin ? 'Iran (IRGC)' : (isRussiaOrigin ? 'Russian Federation' : 'Allied Defense Force / IDF');
                    const objective = alert.label || 'Strategic Infrastructure';

                    arcs.push({
                        id: `arc-${alert.id}-${Date.now()}`,
                        startLat: originLat,
                        startLng: originLng,
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
                // increase bounding box to roughly 30 degrees around the config center
                const lamin = Math.max(-90, config.lat - 30);
                const lomin = Math.max(-180, config.lng - 35);
                const lamax = Math.min(90, config.lat + 30);
                const lomax = Math.min(180, config.lng + 35);
                const res = await fetch(`/api/traffic?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.states) {
                        // Get a much larger subset of real flights (e.g. up to 250 for performance reasons)
                        const subset = data.states.slice(0, 250).map((s: any) => {
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
                                departure: 'Unknown (ADS-B Feed)',
                                destination: 'Unknown',
                                airframe: 'Civilian / Commercial Aircraft',
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
    const labelHtml = (d: any) => {
        const isHit = d.type === 'missile-impact' || d.type === 'explosion';
        return `
    <div 
        style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: auto; cursor: pointer; transform: translate(-50%, -50%); min-width: 40px; min-height: 40px; justify-content: center;"
        onmouseover="this.querySelector('.alert-text').style.opacity='1'"
        onmouseout="this.querySelector('.alert-text').style.opacity='0'"
        onpointerdown="const e = new CustomEvent('entity-click', { detail: { id: '${d.id}', type: 'alert', label: '${d.label}', impact: '${d.impact}', status: 'ACTIVE' } }); window.dispatchEvent(e);"
    >
      ${isHit ? `
        <div style="font-size: 24px; text-shadow: 0 0 15px #ff4d4d; animation: fire-flicker 0.4s infinite alternate; display: flex; align-items: center; justify-content: center;">🔥</div>
      ` : `
        <div style="width: 24px; height: 24px; border-radius: 50%; opacity: 0;"></div>
      `}
      <div class="alert-text" style="
        background: rgba(13, 17, 23, 0.8);
        border: 1px solid ${getImpactColor(d.impact)}40;
        color: #e6edf3;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: bold;
        white-space: nowrap;
        filter: drop-shadow(0 0 4px ${getImpactColor(d.impact)}80);
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: none;
        position: absolute;
        top: 100%;
        margin-top: 4px;
      ">
        ${d.label}
      </div>
      <style>
        @keyframes fire-flicker {
          0% { opacity: 0.8; transform: scale(0.9); filter: brightness(0.8); }
          100% { opacity: 1; transform: scale(1.2); filter: brightness(1.2); }
        }
      </style>
    </div>
  `;
    };

    // HTML for planes and vessels
    const planeHtml = (d: any) => `
      <div 
        style="color: #a371f7; background: rgba(0,0,0,0.6); border-radius: 50%; border: 1px solid #a371f740; cursor: pointer; pointer-events: auto; transform: translate(-50%, -50%) rotate(${d.header || 0}deg); display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; box-shadow: 0 0 8px rgba(163, 113, 247, 0.4); transition: width 0.2s, height 0.2s; position: relative;"
        onpointerdown="const e = new CustomEvent('entity-click', { detail: { id: '${d.id}', type: 'plane', label: '${d.label}', countryCode: '${d.countryCode || ''}', datasource: '${d.datasource || ''}', departure: '${d.departure || 'Classified'}', destination: '${d.destination || 'Classified'}', airframe: '${d.airframe || 'Classified'}' } }); window.dispatchEvent(e);"
        onmouseover="this.style.width='32px'; this.style.height='32px';"
        onmouseout="this.style.width='24px'; this.style.height='24px';"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(-45deg)"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 5-3.5 3.5L3 16l-1 1 5 1 1 5 1-1-1-2.5L12 16l5 6 1.2-1.2c.4-.2.7-.6.6-1Z"/></svg>
        ${d.countryCode && d.countryCode !== 'unknown' ? `
          <div class="flag-tag" style="position: absolute; bottom: -8px; right: -8px; transform: rotate(${- (d.header || 0)}deg); opacity: 1; background: #000; border: 1px solid #fff3; padding: 1px; border-radius: 2px; z-index: 10;">
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
        onmouseover="this.style.width='32px'; this.style.height='32px';"
        onmouseout="this.style.width='24px'; this.style.height='24px';"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(-90deg)"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M12 10v4"/><path d="M12 2v3"/></svg>
        ${d.countryCode && d.countryCode !== 'unknown' ? `
          <div class="flag-tag" style="position: absolute; bottom: -8px; right: -8px; transform: rotate(${- (d.header || 0)}deg); opacity: 1; background: #000; border: 1px solid #fff3; padding: 1px; border-radius: 2px; z-index: 10;">
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
                    arcsData={showMissiles ? missileArcs : []}
                    arcStartLat="startLat"
                    arcStartLng="startLng"
                    arcEndLat="endLat"
                    arcEndLng="endLng"
                    arcColor="color"
                    arcDashLength={0.6}
                    arcDashGap={0.4}
                    arcDashAnimateTime={3000}
                    arcStroke={1}
                    arcAltitude={0.3}
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
                    <div className="flex flex-wrap gap-2 mt-1.5">
                        <label className="text-[10px] text-white flex items-center gap-1 cursor-pointer hover:text-[#58a6ff]">
                            <input type="checkbox" checked={showPlanes} onChange={(e) => setShowPlanes(e.target.checked)} className="accent-[#58a6ff]" />
                            ✈️ Air
                        </label>
                        <label className="text-[10px] text-white flex items-center gap-1 cursor-pointer hover:text-[#58a6ff]">
                            <input type="checkbox" checked={showVessels} onChange={(e) => setShowVessels(e.target.checked)} className="accent-[#58a6ff]" />
                            🚢 Naval
                        </label>
                        <label className="text-[10px] text-white flex items-center gap-1 cursor-pointer hover:text-[#58a6ff]">
                            <input type="checkbox" checked={showMissiles} onChange={(e) => setShowMissiles(e.target.checked)} className="accent-[#58a6ff]" />
                            🚀 Missiles
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
                            {trackedEntity.type === 'plane' ? 'Air Target' : trackedEntity.type === 'vessel' ? 'Naval Target' : trackedEntity.type === 'missile' ? 'Ballistic Track' : 'Incident Alert'}
                        </h3>
                        <button onClick={() => setTrackedEntity(null)} className="text-[#8b949e] hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-semibold text-[#58a6ff] mb-2">{trackedEntity.label}</p>

                        {trackedEntity.type === 'plane' && (
                            <div className="mb-3 p-2 bg-[#0d1117] rounded border border-[#30363d] space-y-1.5">
                                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#30363d]">
                                    {trackedEntity.countryCode && trackedEntity.countryCode !== 'unknown' && (
                                        <img src={`https://flagcdn.com/w40/${trackedEntity.countryCode}.png`} width="20" height="15" alt={trackedEntity.countryCode} className="border border-[#30363d] rounded-sm" />
                                    )}
                                    <span className="text-[12px] font-bold text-white uppercase">{trackedEntity.countryCode === 'unknown' ? 'Unknown Origin' : trackedEntity.countryCode}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-[#8b949e]">Type:</span>
                                    <span className="text-white font-bold ml-2 text-right">{trackedEntity.airframe || 'Classified'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-[#8b949e]">DEP:</span>
                                    <span className="text-[#58a6ff] font-bold ml-2 text-right truncate max-w-[140px]" title={trackedEntity.departure}>{trackedEntity.departure || 'Classified'}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-[#8b949e]">DEST:</span>
                                    <span className="text-[#58a6ff] font-bold ml-2 text-right truncate max-w-[140px]" title={trackedEntity.destination}>{trackedEntity.destination || 'Classified'}</span>
                                </div>
                            </div>
                        )}

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
                            <span className={`font-bold ${trackedEntity.type === 'missile'
                                ? (trackedEntity.status === 'IMPACTED' ? 'text-[#ff3e3e]' : trackedEntity.status === 'INTERCEPTED' ? 'text-[#58a6ff]' : 'text-[#3fb950] animate-pulse')
                                : (trackedEntity.type === 'alert' ? 'text-[#ff3e3e] animate-pulse' : 'text-[#3fb950]')
                                }`}>
                                {trackedEntity.type === 'missile'
                                    ? (trackedEntity.status === 'IN_FLIGHT' ? '● Flight Active' : trackedEntity.status === 'INTERCEPTED' ? '◌ Neutralized (Iron Dome)' : '● Impact Confirmed')
                                    : (trackedEntity.type === 'plane' ? '● Airborne' : trackedEntity.type === 'alert' ? '● Active Alert (High Priority)' : '● Underway')}
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
