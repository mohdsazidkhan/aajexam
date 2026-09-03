import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExamCategory from '@/models/ExamCategory';
import Exam from '@/models/Exam';
import ExamPattern from '@/models/ExamPattern';
import Subject from '@/models/Subject';
import Topic from '@/models/Topic';
import Quiz from '@/models/Quiz';
import PracticeTest from '@/models/PracticeTest';
import { protect, admin } from '@/middleware/auth';

export async function GET(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated || !admin(auth.user)) {
            return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        await dbConnect();

        // 1. Overall Statistics
        const [
            categoriesCount,
            examsCount,
            patternsCount,
            subjectsCount,
            topicsCount,
            quizzesCount,
            pyqsCount,
            mocksCount
        ] = await Promise.all([
            ExamCategory.countDocuments(),
            Exam.countDocuments(),
            ExamPattern.countDocuments(),
            Subject.countDocuments(),
            Topic.countDocuments(),
            Quiz.countDocuments(),
            PracticeTest.countDocuments({ isPYQ: true }),
            PracticeTest.countDocuments({ isPYQ: false })
        ]);

        const overallStats = {
            categories: categoriesCount,
            exams: examsCount,
            patterns: patternsCount,
            subjects: subjectsCount,
            topics: topicsCount,
            quizzes: quizzesCount,
            pyqs: pyqsCount,
            practiceTests: mocksCount
        };

        // 2. Main Content - Exam List Hierarchy
        
        // Fetch all base data
        const [
            allCategories,
            allExams,
            allPatterns,
            allSubjects,
            allTopics,
            allQuizzes,
            allPracticeTests
        ] = await Promise.all([
            ExamCategory.find().lean(),
            Exam.find().lean(),
            ExamPattern.find().lean(),
            Subject.find().lean(),
            Topic.find().lean(),
            Quiz.find().lean(),
            PracticeTest.find().lean()
        ]);

        // Helper mappings
        const categoryMap = allCategories.reduce((acc, cat) => {
            acc[cat._id.toString()] = cat;
            return acc;
        }, {});

        const examPatternsMap = {}; // examId -> patterns[]
        allPatterns.forEach(pattern => {
            const examId = pattern.exam?.toString();
            if (examId) {
                if (!examPatternsMap[examId]) examPatternsMap[examId] = [];
                examPatternsMap[examId].push(pattern);
            }
        });

        const examSubjectsMap = {}; // examId -> subjects[]
        allSubjects.forEach(subject => {
            if (subject.exams && Array.isArray(subject.exams)) {
                subject.exams.forEach(examId => {
                    const eid = examId.toString();
                    if (!examSubjectsMap[eid]) examSubjectsMap[eid] = [];
                    examSubjectsMap[eid].push(subject);
                });
            }
        });

        const examTopicsMap = {}; // examId -> topics[]
        allTopics.forEach(topic => {
            if (topic.exams && Array.isArray(topic.exams)) {
                topic.exams.forEach(examId => {
                    const eid = examId.toString();
                    if (!examTopicsMap[eid]) examTopicsMap[eid] = [];
                    examTopicsMap[eid].push(topic);
                });
            }
        });

        const examQuizzesMap = {}; // examId -> quizzes[]
        allQuizzes.forEach(quiz => {
            if (quiz.applicableExams && Array.isArray(quiz.applicableExams)) {
                quiz.applicableExams.forEach(examId => {
                    const eid = examId.toString();
                    if (!examQuizzesMap[eid]) examQuizzesMap[eid] = [];
                    examQuizzesMap[eid].push(quiz);
                });
            }
        });

        // Practice Tests are linked to ExamPattern, not directly to Exam
        const patternToExamMap = {};
        allPatterns.forEach(pattern => {
            if (pattern.exam) {
                patternToExamMap[pattern._id.toString()] = pattern.exam.toString();
            }
        });

        const examPYQsMap = {}; // examId -> practiceTests (isPYQ = true)
        const examMocksMap = {}; // examId -> practiceTests (isPYQ = false)
        allPracticeTests.forEach(pt => {
            const patternId = pt.examPattern?.toString();
            if (patternId && patternToExamMap[patternId]) {
                const examId = patternToExamMap[patternId];
                if (pt.isPYQ) {
                    if (!examPYQsMap[examId]) examPYQsMap[examId] = [];
                    examPYQsMap[examId].push(pt);
                } else {
                    if (!examMocksMap[examId]) examMocksMap[examId] = [];
                    examMocksMap[examId].push(pt);
                }
            }
        });

        // Assemble hierarchy
        const examHierarchy = allExams.map(exam => {
            const examIdStr = exam._id.toString();
            
            // Collect relationships
            const patterns = examPatternsMap[examIdStr] || [];
            const subjects = examSubjectsMap[examIdStr] || [];
            const topics = examTopicsMap[examIdStr] || [];
            const quizzes = examQuizzesMap[examIdStr] || [];
            const pyqs = examPYQsMap[examIdStr] || [];
            const mocks = examMocksMap[examIdStr] || [];

            return {
                _id: examIdStr,
                name: exam.name,
                code: exam.code,
                isActive: exam.isActive,
                category: categoryMap[exam.category?.toString()] || null,
                
                counts: {
                    patterns: patterns.length,
                    subjects: subjects.length,
                    topics: topics.length,
                    quizzes: quizzes.length,
                    pyqs: pyqs.length,
                    practiceTests: mocks.length
                },

                // Detailed lists for the expandable section
                patterns: patterns.map(p => ({
                    _id: p._id,
                    title: p.title,
                    duration: p.duration,
                    totalMarks: p.totalMarks
                })),
                
                subjects: subjects.map(s => ({
                    _id: s._id,
                    name: s.name,
                    isActive: s.isActive
                })),
                
                topics: topics.map(t => ({
                    _id: t._id,
                    name: t.name,
                    subjectId: t.subject,
                    isActive: t.isActive
                })),
                
                quizzes: quizzes.map(q => ({
                    _id: q._id,
                    title: q.title,
                    totalQuestions: q.questions?.length || 0,
                    status: q.status
                })),
                
                pyqs: pyqs.map(p => ({
                    _id: p._id,
                    title: p.title,
                    pyqYear: p.pyqYear,
                    totalQuestions: p.questions?.length || 0
                })),
                
                practiceTests: mocks.map(m => ({
                    _id: m._id,
                    title: m.title,
                    totalQuestions: m.questions?.length || 0,
                    duration: m.duration
                }))
            };
        });

        return NextResponse.json({
            success: true,
            data: {
                overallStats,
                examHierarchy
            }
        });
    } catch (error) {
        console.error('Error fetching exams overview:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
