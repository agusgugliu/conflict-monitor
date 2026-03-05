import { NextResponse } from 'next/server';

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
        const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

        const response = await fetch(url, {
            next: { revalidate: 15 }, // Cache for 15 seconds to avoid rate limiting
        });

        if (!response.ok) {
            throw new Error(`OpenSky API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching traffic:', error);
        return NextResponse.json({ error: 'Failed to fetch flight data' }, { status: 500 });
    }
}
