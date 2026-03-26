import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export async function GET() {
    try {
        await dbConnect();
        const health = {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                state: mongoose.connection.readyState,
                states: {
                    0: 'disconnected',
                    1: 'connected',
                    2: 'connecting',
                    3: 'disconnecting'
                }
            }
        };

        return NextResponse.json({
            success: true,
            message: 'Health check completed',
            data: health
        });
    } catch (error) {
        console.error('Health check error:', error);
        return NextResponse.json({
            success: false,
            message: 'Health check failed',
            error: error.message
        }, { status: 500 });
    }
}
