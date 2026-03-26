import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BankDetail from '@/models/BankDetail';
import { protect } from '@/middleware/auth';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const bankDetail = await BankDetail.findOne({ user: auth.user.id });
        return NextResponse.json({ success: true, bankDetail });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
