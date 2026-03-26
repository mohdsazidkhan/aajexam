import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { protect, admin } from '@/middleware/auth';

// GET all expenses with filtering and pagination
export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);

        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const skip = (page - 1) * limit;

        const search = searchParams.get('search');
        const category = searchParams.get('category');

        const query = {};

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search && search.trim()) {
            query.title = { $regex: search.trim(), $options: 'i' };
        }

        const [expenses, total] = await Promise.all([
            Expense.find(query)
                .populate('createdBy', 'name email')
                .sort({ date: -1 })
                .skip(skip)
                .limit(limit),
            Expense.countDocuments(query)
        ]);

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data: expenses,
            totalPages,
            currentPage: page,
            totalExpenses: total
        });
    } catch (error) {
        console.error('Error getting expenses:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch expenses',
            error: error.message
        }, { status: 500 });
    }
}

// POST - Create new expense
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const body = await req.json();
        await dbConnect();

        // Add createdBy from auth user
        body.createdBy = auth.user._id;

        const expense = await Expense.create(body);

        return NextResponse.json({
            success: true,
            data: expense
        });
    } catch (error) {
        console.error('Error creating expense:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to create expense',
            error: error.message
        }, { status: 500 });
    }
}
