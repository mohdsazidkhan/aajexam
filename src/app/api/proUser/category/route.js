import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { protect, proOnly } from '@/middleware/auth';

export async function POST(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !proOnly(auth.user)) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

        const { name, description } = await req.json();
        if (!name || name.trim().length < 3 || name.trim().length > 100) {
            return NextResponse.json({ success: false, message: 'Category name must be between 3 and 100 characters' }, { status: 400 });
        }

        const existing = await Category.findOne({ name: name.trim(), createdBy: auth.user.id, createdType: 'user' });
        if (existing) return NextResponse.json({ success: false, message: 'You already have a category with this name' }, { status: 409 });

        const category = await Category.create({
            name: name.trim(),
            description: description?.trim() || '',
            createdBy: auth.user.id,
            createdType: 'user',
            status: 'pending'
        });

        return NextResponse.json({ success: true, data: category, message: 'Category submitted for admin approval' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !proOnly(auth.user)) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const filter = { createdBy: auth.user.id, createdType: 'user' };
        if (status && ['pending', 'approved', 'rejected'].includes(status)) filter.status = status;

        const [items, total] = await Promise.all([
            Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Category.countDocuments(filter)
        ]);

        return NextResponse.json({
            success: true,
            data: items,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
