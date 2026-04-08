import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { username } = await params;
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        return NextResponse.json({
            success: true,
            contributions: {}
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
