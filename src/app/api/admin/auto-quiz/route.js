import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import { protect, adminOnly } from '@/middleware/auth';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        if (!auth.authenticated || !adminOnly(auth.user)) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const { category, subcategory, level } = await req.json();
        if (!category || !subcategory || !level) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const subcat = await Subcategory.findById(subcategory);
        if (!subcat) return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });

        const existing = await Quiz.findOne({ subcategory, requiredLevel: level });
        if (existing) return NextResponse.json({ error: 'Quiz already exists' }, { status: 400 });

        const prompt = `Generate a quiz with 5 multiple-choice questions for the topic: ${subcat.name}. Suited for level ${level}. JSON array: [{question, options, correctAnswerIndex}].`;
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000
        });

        let quizData;
        try {
            quizData = JSON.parse(response.choices[0].message.content);
        } catch (e) {
            return NextResponse.json({ error: 'AI Parse error' }, { status: 500 });
        }

        const quiz = await Quiz.create({
            title: `${subcat.name} Auto Quiz (L${level})`,
            category,
            subcategory,
            totalMarks: quizData.length,
            timeLimit: quizData.length * 2,
            description: `Auto-generated for ${subcat.name}`,
            isActive: true,
            difficulty: 'beginner',
            requiredLevel: level,
            recommendedLevel: level,
            levelRange: { min: 1, max: 10 },
            tags: [subcat.name]
        });

        for (const q of quizData) {
            await Question.create({
                quiz: quiz._id,
                questionText: q.question,
                options: q.options,
                correctAnswerIndex: q.correctAnswerIndex,
                timeLimit: 30
            });
        }

        return NextResponse.json({ success: true, quizId: quiz._id }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
