import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudyMaterial from '@/models/StudyMaterial';
import Question from '@/models/Question';
import { protect } from '@/middleware/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        await dbConnect();
        const auth = await protect(req);
        
        // If not authenticated, we'll give general content
        const targetExam = auth.authenticated ? (auth.user.primaryTargetExam || 'General') : 'General';

        // 1. Fetch a random study material for this exam
        const material = await StudyMaterial.findOne({ 
            examType: targetExam, 
            isActive: true 
        }).sort({ createdAt: -1 }).limit(1).lean();

        // 2. Fetch a random question for this exam
        const question = await Question.findOne({ 
            examType: targetExam 
        }).limit(1).lean();

        // 3. Optional: Add "Quote of the Day" or "Fact of the Day"
        const facts = [
            "Consistent practice is the key to mastering competitive exams.",
            "Analyzing your mock tests is more important than giving them.",
            "Visual learning (Videos) can improve retention by up to 50%."
        ];
        const randomFact = facts[Math.floor(Math.random() * facts.length)];

        return NextResponse.json({
            success: true,
            data: {
                targetExam,
                featuredMaterial: material,
                questionOfDay: question,
                factOfDay: randomFact
            }
        });

    } catch (error) {
        console.error('Daily Dose API Error:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Failed to fetch daily dose' 
        }, { status: 500 });
    }
}
