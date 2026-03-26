import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Level from '@/models/Level';
import { protect, admin } from '@/middleware/auth';

export async function PUT(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { levelOrders } = await req.json();
        if (!Array.isArray(levelOrders)) return NextResponse.json({ success: false, message: 'Array required' }, { status: 400 });

        await Promise.all(levelOrders.map(({ id, order }) =>
            Level.findByIdAndUpdate(id, { order, updatedBy: auth.user.id })
        ));

        return NextResponse.json({ success: true, message: 'Levels reordered successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
