import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
    // Mock endpoint to prevent frontend 404s
    return NextResponse.json({
        success: false,
        message: 'Reward claiming is handled via the wallet system'
    }, { status: 400 });
}
