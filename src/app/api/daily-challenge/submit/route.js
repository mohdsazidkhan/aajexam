import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import DailyChallenge from '@/models/DailyChallenge';
import DailyChallengeAttempt from '@/models/DailyChallengeAttempt';
import UserStreak from '@/models/UserStreak';
import { protect } from '@/middleware/auth';
import { addManyWrongAnswersToRevision, snapshotFromDailyChallengeQuestion } from '@/utils/revision';

// POST - Submit daily challenge
export async function POST(req) {
    try {
        const auth = await protect(req);
        if (!auth.authenticated) return NextResponse.json({ message: 'Login required' }, { status: 401 });
        await dbConnect();

        const { challengeId, answers, totalTime } = await req.json();

        const challenge = await DailyChallenge.findById(challengeId);
        if (!challenge) return NextResponse.json({ message: 'Challenge not found' }, { status: 404 });

        // Check if already attempted
        const existing = await DailyChallengeAttempt.findOne({ user: auth.user._id, challenge: challengeId });
        if (existing) return NextResponse.json({ message: 'Already attempted today', data: existing }, { status: 400 });

        // Calculate score
        let correctCount = 0, wrongCount = 0, skippedCount = 0;
        const processedAnswers = answers.map((ans, i) => {
            const question = challenge.questions[i];
            if (!question) return { questionIndex: i, selectedOptionIndex: -1, isCorrect: false, timeTaken: 0 };

            if (ans.selectedOptionIndex === -1 || ans.selectedOptionIndex === undefined) {
                skippedCount++;
                return { questionIndex: i, selectedOptionIndex: -1, isCorrect: false, timeTaken: ans.timeTaken || 0 };
            }

            const isCorrect = question.options[ans.selectedOptionIndex]?.isCorrect || false;
            if (isCorrect) correctCount++;
            else wrongCount++;

            return {
                questionIndex: i,
                selectedOptionIndex: ans.selectedOptionIndex,
                isCorrect,
                timeTaken: ans.timeTaken || 0
            };
        });

        const score = correctCount;
        const accuracy = challenge.questions.length > 0 ? Math.round((correctCount / challenge.questions.length) * 100) : 0;

        const attempt = await DailyChallengeAttempt.create({
            user: auth.user._id,
            challenge: challengeId,
            answers: processedAnswers,
            score,
            correctCount,
            wrongCount,
            skippedCount,
            accuracy,
            totalTime: totalTime || 0
        });

        const wrongRevisionItems = processedAnswers
            .filter(a => !a.isCorrect && a.selectedOptionIndex !== -1)
            .map(a => {
                const q = challenge.questions[a.questionIndex];
                return q ? {
                    userId: auth.user._id,
                    source: 'daily_challenge',
                    sourceId: challengeId,
                    sourceTitle: challenge.date ? new Date(challenge.date).toISOString().slice(0, 10) : '',
                    sourceQuestionId: q._id,
                    snapshot: snapshotFromDailyChallengeQuestion(q)
                } : null;
            })
            .filter(Boolean);
        if (wrongRevisionItems.length) {
            addManyWrongAnswersToRevision(wrongRevisionItems).catch(() => {});
        }

        // Update challenge stats
        challenge.totalAttempts += 1;
        challenge.avgScore = Math.round(((challenge.avgScore * (challenge.totalAttempts - 1)) + score) / challenge.totalAttempts);
        await challenge.save();

        // Update streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streak = await UserStreak.findOne({ user: auth.user._id });
        if (!streak) streak = new UserStreak({ user: auth.user._id });

        const lastActive = streak.lastActiveDate ? new Date(streak.lastActiveDate) : null;
        if (lastActive) lastActive.setHours(0, 0, 0, 0);

        const isNewDay = !lastActive || lastActive.getTime() !== today.getTime();

        if (isNewDay) {
            if (lastActive) {
                const diffDays = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) {
                    streak.currentStreak += 1;
                } else if (diffDays > 1) {
                    streak.currentStreak = 1;
                }
            } else {
                streak.currentStreak = 1;
            }

            streak.totalActiveDays += 1;
            streak.lastActiveDate = today;

            if (streak.currentStreak > streak.longestStreak) {
                streak.longestStreak = streak.currentStreak;
            }

            streak.streakHistory.push({
                date: today,
                challengeCompleted: true,
                questionsAttempted: challenge.questions.length,
                correctAnswers: correctCount,
                frozeStreak: false
            });
        }

        // Pro users get 2 freezes per week
        if (auth.user.subscriptionStatus === 'PRO') {
            const weekStart = new Date(today);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const freezesThisWeek = streak.streakHistory.filter(h => {
                const d = new Date(h.date);
                return d >= weekStart && h.frozeStreak;
            }).length;
            if (freezesThisWeek === 0 && streak.freezesAvailable < 2) {
                streak.freezesAvailable = 2;
            }
        }

        await streak.save();

        return NextResponse.json({
            success: true,
            data: {
                attempt,
                streak: {
                    currentStreak: streak.currentStreak,
                    longestStreak: streak.longestStreak,
                    totalActiveDays: streak.totalActiveDays
                }
            }
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
