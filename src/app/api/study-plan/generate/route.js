import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import StudyPlan from '@/models/StudyPlan';
import User from '@/models/User';
import Exam from '@/models/Exam';
import { protect } from '@/middleware/auth';
import { generateCompletion, isAIConfigured } from '@/lib/ai';
import { buildStudyPlanPrompt } from '@/lib/studyPlanPrompt';

// POST - Generate AI study plan
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) {
            return NextResponse.json({ message: 'Login required' }, { status: 401 });
        }
        await dbConnect();

        const body = await req.json();
        const { examId, examDate, dailyHours, weakSubjects = [], strongSubjects = [] } = body;

        if (!examId || !examDate || !dailyHours) {
            return NextResponse.json({ message: 'examId, examDate, dailyHours required' }, { status: 400 });
        }

        const exam = await Exam.findById(examId);
        if (!exam) return NextResponse.json({ message: 'Exam not found' }, { status: 404 });

        const user = await User.findById(auth.user._id);

        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        const targetDate = new Date(examDate);
        targetDate.setHours(0, 0, 0, 0);
        const daysRemaining = Math.ceil((targetDate - startDate) / (1000 * 60 * 60 * 24));

        if (daysRemaining < 1) {
            return NextResponse.json({ message: 'Exam date must be in the future' }, { status: 400 });
        }

        const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

        // Deactivate existing plans for same exam
        await StudyPlan.updateMany(
            { user: auth.user._id, exam: examId, isActive: true },
            { isActive: false, status: 'paused' }
        );

        let weeklySchedule = [];
        let aiModel = '';

        if (isAIConfigured()) {
            try {
                const prompt = buildStudyPlanPrompt({
                    examName: exam.name,
                    examDate,
                    dailyHours,
                    weakSubjects,
                    strongSubjects,
                    currentReadiness: user.performanceMetrics?.examStats?.overallReadiness || 0,
                    subjectAccuracy: user.performanceMetrics?.examStats?.subjectAccuracy || {},
                    daysRemaining,
                    startDate: `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
                });

                const aiResponse = await generateCompletion(prompt, [
                    { role: 'user', content: `Generate my ${exam.name} study plan for ${daysRemaining} days.` }
                ], { temperature: 0.6, maxTokens: 4000 });

                const parsed = JSON.parse(aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());

                if (parsed.weeklySchedule) {
                    weeklySchedule = parsed.weeklySchedule.map((week, i) => ({
                        week: week.week || i + 1,
                        tasks: (week.tasks || []).map(task => ({
                            day: task.day,
                            subject: task.subject,
                            topic: task.topic,
                            duration: task.duration,
                            taskType: task.taskType || 'study',
                            description: task.description || ''
                        }))
                    }));
                }
                aiModel = process.env.AI_MODEL || 'openrouter';
            } catch (aiError) {
                console.error('AI plan generation failed, using template:', aiError.message);
            }
        }

        // Fallback: template-based plan if AI fails or not configured
        if (weeklySchedule.length === 0) {
            const totalWeeks = Math.ceil(daysRemaining / 7);
            const allSubjects = [...weakSubjects, ...strongSubjects];
            if (allSubjects.length === 0) allSubjects.push('General Studies', 'Quantitative Aptitude', 'English', 'Reasoning');

            for (let w = 1; w <= totalWeeks; w++) {
                const tasks = [];
                const daysInWeek = Math.min(7, daysRemaining - (w - 1) * 7);
                for (let d = 1; d <= daysInWeek; d++) {
                    const subjectIndex = (w * 7 + d) % allSubjects.length;
                    const isRevisionWeek = w > totalWeeks - 2;
                    tasks.push({
                        day: d,
                        subject: allSubjects[subjectIndex],
                        topic: isRevisionWeek ? 'Revision' : `Week ${w} Topics`,
                        duration: dailyHours,
                        taskType: isRevisionWeek ? 'revision' : (d === 7 ? 'mock_test' : 'study'),
                        description: isRevisionWeek ? 'Revise all topics covered this week' : `Study ${allSubjects[subjectIndex]} for ${dailyHours} hours`
                    });
                }
                weeklySchedule.push({ week: w, tasks });
            }
        }

        // Attach exact dates: week startDate/endDate and per-day date; also build dailyTasks[]
        const dailyTasksMap = new Map();
        weeklySchedule = weeklySchedule.map((week, wIdx) => {
            const wStart = addDays(startDate, wIdx * 7);
            const wEnd = addDays(wStart, Math.min(6, daysRemaining - wIdx * 7 - 1));
            const tasks = (week.tasks || []).map(t => {
                const dayDate = addDays(wStart, (t.day || 1) - 1);
                const key = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}-${String(dayDate.getDate()).padStart(2, '0')}`;
                if (!dailyTasksMap.has(key)) dailyTasksMap.set(key, { date: dayDate, tasks: [] });
                dailyTasksMap.get(key).tasks.push({
                    subject: t.subject,
                    topic: t.topic,
                    duration: t.duration,
                    taskType: t.taskType || 'study',
                    description: t.description || ''
                });
                return { ...t, date: dayDate };
            });
            return { week: week.week || wIdx + 1, startDate: wStart, endDate: wEnd, tasks };
        });
        const dailyTasks = Array.from(dailyTasksMap.values()).sort((a, b) => a.date - b.date);

        const plan = new StudyPlan({
            user: auth.user._id,
            exam: examId,
            examDate: new Date(examDate),
            dailyHours,
            weakSubjects,
            strongSubjects,
            totalDays: daysRemaining,
            weeklySchedule,
            dailyTasks,
            generatedBy: aiModel ? 'ai' : 'template',
            aiModel,
            isActive: true,
            status: 'active'
        });

        await plan.save();
        return NextResponse.json({ success: true, data: plan }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
