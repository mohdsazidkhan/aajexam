import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FlashcardDeck from '@/models/FlashcardDeck';
import mongoose from 'mongoose';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const topicId = searchParams.get('topic');
        const subjectId = searchParams.get('subject');

        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 20;
        const skip = (page - 1) * limit;

        const query = { status: 'published' };
        if (topicId && mongoose.Types.ObjectId.isValid(topicId)) {
            query.topic = topicId;
        } else if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
            query.subject = subjectId;
        }

        const [decks, total] = await Promise.all([
            FlashcardDeck.find(query)
                .select('title slug description cards tags') // Exclude heavy card contents if needed, but we probably want length
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            FlashcardDeck.countDocuments(query)
        ]);

        // Add cardCount to each deck
        const formattedDecks = decks.map(d => ({
            ...d,
            cardCount: d.cards?.length || 0,
            cards: undefined // don't send all cards in list API
        }));

        return NextResponse.json({
            success: true,
            data: formattedDecks,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    } catch (error) {
        console.error('Flashcards API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
