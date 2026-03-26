import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import { protect, proOnly } from '@/middleware/auth';
import mongoose from 'mongoose';

export async function POST(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !proOnly(auth.user)) return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });

        const { name, description, categoryId } = await req.json();
        if (!name || name.trim().length < 3 || name.trim().length > 100) return NextResponse.json({ success: false, message: 'Invalid name' }, { status: 400 });
        if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) return NextResponse.json({ success: false, message: 'Invalid category' }, { status: 400 });

        const category = await Category.findOne({ _id: categoryId, status: 'approved' });
        if (!category) return NextResponse.json({ success: false, message: 'Category not found or not approved' }, { status: 404 });

        const existing = await Subcategory.findOne({ name: name.trim(), category: categoryId, createdBy: auth.user.id, createdType: 'user' });
        if (existing) return NextResponse.json({ success: false, message: 'Subcategory already exists' }, { status: 409 });

        const subcategory = await Subcategory.create({
            name: name.trim(),
            description: description?.trim() || '',
            category: categoryId,
            createdBy: auth.user.id,
            createdType: 'user',
            status: 'pending'
        });

        return NextResponse.json({ success: true, data: subcategory, message: 'Subcategory submitted for admin approval' }, { status: 201 });
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
        const categoryId = searchParams.get('categoryId');
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const filter = { createdBy: auth.user.id, createdType: 'user' };
        if (status && ['pending', 'approved', 'rejected'].includes(status)) filter.status = status;
        if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) filter.category = categoryId;

        const [items, total] = await Promise.all([
            Subcategory.find(filter).populate('category', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit),
            Subcategory.countDocuments(filter)
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
