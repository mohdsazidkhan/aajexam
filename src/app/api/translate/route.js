import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const LANGUAGE_MAP = {
    'en': 'English', 'hi': 'Hindi', 'mr': 'Marathi', 'gu': 'Gujarati', 'bn': 'Bengali',
    'pa': 'Punjabi', 'ta': 'Tamil', 'te': 'Telugu', 'kn': 'Kannada', 'ml': 'Malayalam', 'or': 'Odia', 'ur': 'Urdu',
};

export async function POST(req) {
    try {
        const { text, target } = await req.json();
        if (!text || !target) return NextResponse.json({ error: 'Missing text or target' }, { status: 400 });

        const targetLang = LANGUAGE_MAP[target.toLowerCase()];
        if (!targetLang) return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
        if (target.toLowerCase() === 'en') return NextResponse.json({ translated: text });

        if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'OpenAI key missing' }, { status: 500 });

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: `Translate to ${targetLang}. Keep special separators intact.` },
                { role: 'user', content: text }
            ],
            temperature: 0.1,
            max_tokens: 2000,
        });

        const translated = completion.choices[0]?.message?.content?.trim() || text;
        return NextResponse.json({ translated });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
