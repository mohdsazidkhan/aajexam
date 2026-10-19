import { NextResponse } from 'next/server';
import { isBotUa } from '@/lib/utils/traffic';

export const dynamic = 'force-dynamic';

// GET /api/geo -> { outsideIndia } from Vercel's edge country header.
// Crawlers always get false so search engines never see the notice. Missing header (local dev) also gives false.
export async function GET(req) {
    const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
    const outsideIndia = !!country && country !== 'IN' && !isBotUa(req.headers.get('user-agent') || '');
    return NextResponse.json({ outsideIndia }, { headers: { 'Cache-Control': 'no-store' } });
}
