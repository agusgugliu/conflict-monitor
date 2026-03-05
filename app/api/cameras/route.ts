import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data/cameras.json');

export async function GET() {
    try {
        if (!fs.existsSync(DATA_PATH)) {
            return NextResponse.json({ error: 'Data not found' }, { status: 404 });
        }
        const data = fs.readFileSync(DATA_PATH, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Simple "admin" check via header for demonstration, in real app use auth
        const isAdmin = request.headers.get('x-admin-token') === 'admin-secret';

        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        fs.writeFileSync(DATA_PATH, JSON.stringify(body, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
