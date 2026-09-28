import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import City from '@/models/City';
import State from '@/models/State';
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

        if (type === 'state') {
            const items = await State.find(query).sort({ name: 1 }).limit(50).select('name').lean();
            return NextResponse.json({ success: true, data: items.map(i => i.name) });
        }

        if (type === 'city') {
            const stateName = searchParams.get('state');
            if (stateName && stateName.trim() !== '') {
                const stateDoc = await State.findOne({ name: stateName.trim(), isActive: true }).select('_id').lean();
                query.state = stateDoc ? stateDoc._id : null;
            }

            const items = await City.find(query).sort({ name: 1 }).limit(50).select('name').lean();
            return NextResponse.json({ success: true, data: items.map(i => i.name) });
        }

        return NextResponse.json({ success: false, message: 'Unsupported location type' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
