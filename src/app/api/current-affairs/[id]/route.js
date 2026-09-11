import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CurrentAffair from '@/models/CurrentAffair';

// GET - Single current affair detail
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const affair = await CurrentAffair.findById(id).lean();
        if (!affair) return NextResponse.json({ message: 'Not found' }, { status: 404 });

        affair.views += 1;
        CurrentAffair.updateOne({ _id: affair._id }, { $inc: { views: 1 } }).catch((e) => console.error('View increment failed:', e));

        return NextResponse.json({ success: true, data: affair });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
