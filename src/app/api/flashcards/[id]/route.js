import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FlashcardDeck from '@/models/FlashcardDeck';
import mongoose from 'mongoose';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        
        const isObjectId = mongoose.Types.ObjectId.isValid(id) && (new String(id).length === 24);
        const query = isObjectId ? { _id: id } : { slug: id };

        const deck = await FlashcardDeck.findOne({ ...query, status: 'published' })
            .populate('subject', 'name slug')
            .populate('topic', 'name slug')
            .lean();

        if (!deck) {
            return NextResponse.json({ success: false, message: 'Flashcard Deck not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: deck });
    } catch (error) {
        console.error('Flashcard API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
