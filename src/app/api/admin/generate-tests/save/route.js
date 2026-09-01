import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PracticeTest from '@/models/PracticeTest';
import ExamPattern from '@/models/ExamPattern';
import { protect, admin } from '@/middleware/auth';

// POST — Save AI-generated questions as a PracticeTest
export async function POST(req) {
  try {
    const auth = await protect(req);
    if (!auth.authenticated || !admin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    await dbConnect();

    const body = await req.json();
    const {
      patternId,
      title,
      sections,   // [{ sectionName, questions: [...] }]
      accessLevel = 'FREE',
    } = body;

    if (!patternId || !title || !sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, error: 'patternId, title, and sections are required' },
        { status: 400 }
      );
    }

    // Validate pattern exists
    const pattern = await ExamPattern.findById(patternId).populate('exam', 'name');
    if (!pattern) {
      return NextResponse.json({ success: false, error: 'ExamPattern not found' }, { status: 404 });
    }

    // Flatten all questions from sections
    const allQuestions = sections.flatMap((s) =>
      (s.questions || []).map((q) => ({
        questionText: String(q.questionText || '').trim(),
        questionImage: '',
        options: (q.options || []).map((o) => String(o).trim()),
        optionImages: [],
        correctAnswerIndex: Number(q.correctAnswerIndex),
        explanation: String(q.explanation || '').trim(),
        explanationImage: '',
        section: String(s.sectionName || q.section || '').trim(),
        tags: Array.isArray(q.tags) ? q.tags.map((t) => String(t).trim()) : [],
        difficulty: ['easy', 'medium', 'hard', 'mixed'].includes(q.difficulty) ? q.difficulty : 'medium',
      }))
    );

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No questions to save' },
        { status: 400 }
      );
    }

    const test = await PracticeTest.create({
      examPattern: patternId,
      title: title.trim(),
      totalMarks: pattern.totalMarks || allQuestions.length,
      duration: pattern.duration || 60,
      accessLevel,
      isPYQ: false,
      publishedAt: new Date(),
      questions: allQuestions,
    });

    return NextResponse.json({
      success: true,
      message: `Practice test saved with ${allQuestions.length} questions`,
      testId: test._id,
      slug: test.slug,
    });
  } catch (error) {
    console.error('[generate-tests/save] Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
