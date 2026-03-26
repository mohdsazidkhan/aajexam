import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Level from '@/models/Level';
import User from '@/models/User';
import { protect, admin } from '@/middleware/auth';
import mongoose from 'mongoose';

/**
 * Helper to find level by ID or levelNumber
 */
async function findLevelByIdentifier(identifier) {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
        return await Level.findById(identifier);
    }
    const levelNum = parseInt(identifier);
    if (!isNaN(levelNum)) {
        return await Level.findOne({ levelNumber: levelNum });
    }
    return null;
}

export async function GET(req, { params }) {
    try {
        const { identifier } = await params;
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const level = await findLevelByIdentifier(identifier);

        if (!level) return NextResponse.json({ success: false, message: 'Level not found' }, { status: 404 });

        // Populate creators/updaters if found by levelNumber (findById/findOne returns same model)
        await level.populate([
            { path: 'createdBy', select: 'name email' },
            { path: 'updatedBy', select: 'name email' }
        ]);

        return NextResponse.json({ success: true, data: level });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { identifier } = await params;
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const data = await req.json();
        const level = await findLevelByIdentifier(identifier);
        if (!level) return NextResponse.json({ success: false, message: 'Level not found' }, { status: 404 });

        // Check conflicts if levelNumber changed
        if (data.levelNumber !== undefined && data.levelNumber !== level.levelNumber) {
            const existing = await Level.findOne({ levelNumber: data.levelNumber });
            if (existing) return NextResponse.json({ success: false, message: `Level ${data.levelNumber} exists` }, { status: 400 });
        }

        Object.assign(level, { ...data, updatedBy: auth.user.id });
        await level.save();

        return NextResponse.json({ success: true, message: 'Level updated successfully', data: level });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { identifier } = await params;
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const level = await findLevelByIdentifier(identifier);
        if (!level) return NextResponse.json({ success: false, message: 'Level not found' }, { status: 404 });

        const usersOnLevel = await User.countDocuments({ 'level.currentLevel': level.levelNumber });
        if (usersOnLevel > 0) {
            return NextResponse.json({ success: false, message: `Cannot delete level ${level.levelNumber}. ${usersOnLevel} users on it.` }, { status: 400 });
        }

        await level.deleteOne();
        return NextResponse.json({ success: true, message: 'Level deleted successfully' });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
