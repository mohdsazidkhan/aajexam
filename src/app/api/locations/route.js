import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import City from '@/models/City';
import { escapeRegex } from '@/lib/utils/regex';

export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        const query = { isActive: true };
        if (search && search.trim() !== '') {
            query.name = { $regex: escapeRegex(search.trim().slice(0, 100)), $options: 'i' };
        }

        if (type !== 'city') {
            return NextResponse.json({ success: false, message: 'Unsupported location type' }, { status: 400 });
        }

        const items = await City.find(query).sort({ name: 1 }).limit(50).select('name').lean();

        return NextResponse.json({ success: true, data: items.map(i => i.name) });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
