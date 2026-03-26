import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    // Mock endpoint to prevent frontend 404s since no actual Reward model exists
    // in the backend associated with this specific route path.
    return NextResponse.json({
        success: true,
        data: [], // Return empty array of rewards
        message: 'Rewards functionality is handled via WalletTransactions'
    });
}
