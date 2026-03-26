import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Level from '@/models/Level';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 50;
        const isActive = searchParams.get('isActive');
        const search = searchParams.get('search');

        const query = {};
        if (isActive !== null) query.isActive = isActive === 'true';
        if (search && search.trim()) {
            query.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { description: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;
        const levels = await Level.find(query)
            .populate('createdBy', 'name email')
            .populate('updatedBy', 'name email')
            .sort({ levelNumber: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Level.countDocuments(query);

        return NextResponse.json({
            success: true,
            data: levels,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total,
                hasNextPage: skip + levels.length < total,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const data = await req.json();
        const { levelNumber, name, description, quizzesRequired } = data;

        if (levelNumber === undefined || !name || !description || quizzesRequired === undefined) {
            return NextResponse.json({ success: false, message: 'Mandatory fields missing' }, { status: 400 });
        }

        const existingLevel = await Level.findOne({ levelNumber });
        if (existingLevel) return NextResponse.json({ success: false, message: `Level ${levelNumber} already exists` }, { status: 400 });

        const level = await Level.create({
            ...data,
            createdBy: auth.user.id
        });

        return NextResponse.json({ success: true, message: 'Level created successfully', data: level }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
