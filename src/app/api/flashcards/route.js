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

        const query = { status: 'published' };
        if (topicId && mongoose.Types.ObjectId.isValid(topicId)) {
            query.topic = topicId;
        } else if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) {
            query.subject = subjectId;
        }

        const decks = await FlashcardDeck.find(query)
            .select('title slug description cards tags') // Exclude heavy card contents if needed, but we probably want length
            .sort({ createdAt: -1 })
            .lean();

        // Add cardCount to each deck
        const formattedDecks = decks.map(d => ({
            ...d,
            cardCount: d.cards?.length || 0,
            cards: undefined // don't send all cards in list API
        }));

        return NextResponse.json({ success: true, data: formattedDecks });
    } catch (error) {
        console.error('Flashcards API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
