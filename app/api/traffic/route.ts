import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const lamin = searchParams.get('lamin');
    const lomin = searchParams.get('lomin');
    const lamax = searchParams.get('lamax');
    const lomax = searchParams.get('lomax');

    if (!lamin || !lomin || !lamax || !lomax) {
        return NextResponse.json({ error: 'Missing bounding box parameters' }, { status: 400 });
    }

    try {
        // We use Flightradar24's live zone feed here because OpenSky imposes strict IP rate limits
        const url = `https://data-cloud.flightradar24.com/zones/fcgi/feed.js?bounds=${lamax},${lamin},${lomin},${lomax}`;

        // Ensure we fetch fresh data and don't get trapped in a cache loop
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            throw new Error(`FlightRadar API error: ${response.status}`);
        }

        const data = await response.json();
        const states: any[] = [];

        // FR24 payload schema places flights organically into object keys 
        for (const [key, flight] of Object.entries(data)) {
            if (key !== 'full_count' && key !== 'version' && Array.isArray(flight)) {
                // Map FR24 array into OpenSky equivalent so frontend parses the same way
                states.push([
                    key,                                                    // 0: id
                    flight[16] || flight[13] || flight[9] || 'Unknown',     // 1: callsign
                    flight[18] || 'unknown',                                // 2: airline / origin
                    null,                                                   // 3: time_position
                    null,                                                   // 4: last_contact
                    flight[2],                                              // 5: longitude
                    flight[1],                                              // 6: latitude
                    (flight[4] || 0) * 0.3048,                              // 7: baro_altitude (feet to meters)
                    false,                                                  // 8: on_ground
                    (flight[5] || 0) * 0.514444,                            // 9: velocity (knots to m/s)
                    flight[3],                                              // 10: true_track (header)
                    flight[8] || 'Civilian Aircraft',                       // 11: aircraft type
                    flight[11] || 'Unknown',                                // 12: departure
                    flight[12] || 'Unknown',                                // 13: destination
                    flight[9] || 'Unknown'                                  // 14: registration
                ]);
            }
        }

        return NextResponse.json({ states });
    } catch (error) {
        console.error('Error fetching traffic:', error);
        return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: 500 });
    }
}
