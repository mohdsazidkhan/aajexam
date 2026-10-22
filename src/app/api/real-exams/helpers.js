import mongoose from 'mongoose';
import UserTestAttempt from '@/models/UserTestAttempt';

const ANSWER_VALUE_FIELDS = ['selectedIndex', 'value', 'option', 'text', 'label'];

export function extractCandidateStrings(option) {
    if (option === null || option === undefined) return [];
    if (typeof option !== 'object') return [String(option).trim().toLowerCase()];
    const values = [];
    ANSWER_VALUE_FIELDS.forEach((field) => {
        if (option[field] !== undefined && option[field] !== null) {
            values.push(String(option[field]).trim().toLowerCase());
        }
    });
    if (!values.length) values.push(String(option).trim().toLowerCase());
    return values;
}

export function coerceSubmittedAnswer(question, value) {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const numeric = Number(value);
        if (!Number.isNaN(numeric)) return numeric;
    }
    if (typeof value === 'object' && value.selectedIndex !== undefined) {
        const numeric = Number(value.selectedIndex);
        if (!Number.isNaN(numeric)) return numeric;
    }
    const options = Array.isArray(question?.options) ? question.options : [];
    const targetString = String(typeof value === 'object' && value !== null && value.value !== undefined ? value.value : value).trim().toLowerCase();
    if (!targetString) return null;
    for (let i = 0; i < options.length; i += 1) {
        const candidates = extractCandidateStrings(options[i]);
        if (candidates.includes(targetString)) return i;
    }
    return null;
}

export function normalizeSubmittedAnswers(test, answers) {
    if (!Array.isArray(answers)) return [];
    const questionById = new Map((test.questions || []).map((q) => [q._id.toString(), q]));
    return answers.map((value, index) => {
        let question = test.questions?.[index];
        if (!question && value && typeof value === 'object' && value.questionId) {
            question = questionById.get(String(value.questionId));
        }
        return coerceSubmittedAnswer(question, value);
    });
}

export function evaluateAnswers(questions, submittedAnswers, sections) {
    let totalScore = 0, correctCount = 0, wrongCount = 0, attemptedCount = 0;
    const answerDetails = [];
    const sectionWiseScore = {};
    sections.forEach(s => { sectionWiseScore[s.name] = { correct: 0, wrong: 0, score: 0 }; });
    questions.forEach((question, index) => {
        const submitted = submittedAnswers[index];
        const isAnswered = submitted !== null && submitted !== undefined && submitted !== -1;
        let isCorrect = false, marks = 0, negative = 0;
        if (isAnswered) {
            attemptedCount++;
            isCorrect = submitted === question.correctAnswerIndex;
            const sectionConfig = sections.find(s => s.name === question.section);
            if (isCorrect) {
                correctCount++;
                marks = sectionConfig?.marksPerQuestion || 1;
                totalScore += marks;
                if (sectionWiseScore[question.section]) {
                    sectionWiseScore[question.section].correct++;
                    sectionWiseScore[question.section].score += marks;
                }
            } else {
                wrongCount++;
                negative = sectionConfig?.negativePerQuestion || 0;
                totalScore -= negative;
                if (sectionWiseScore[question.section]) {
                    sectionWiseScore[question.section].wrong++;
                    sectionWiseScore[question.section].score -= negative;
                }
            }
        }
        answerDetails.push({ questionId: question._id, selectedIndex: isAnswered ? submitted : -1, isCorrect, timeTaken: 0 });
    });
    // Sums of fractional marks (e.g. 0.33 * 17) carry float noise (5.699999999999999); store 2 decimals.
    const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
    Object.values(sectionWiseScore).forEach(sec => { sec.score = round2(sec.score); });
    const accuracy = round2(attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0);
    return { totalScore: round2(totalScore), correctCount, wrongCount, attemptedCount, accuracy, answerDetails, sectionWiseScore };
}

// Rank of ONE attempt among the test's completed attempts, computed with two indexed
// counts. The old version re-sorted and bulk-rewrote every attempt's rank on every
// submit (O(N) writes per submit), which doesn't survive a popular test with
// millions of attempts. Ranks of other attempts are not rewritten; the test
// leaderboard derives live ranks at read time, and a stored rank is "rank at submission".
export async function recomputeRanksForTest(testId, targetAttemptId = null) {
    try {
        if (!targetAttemptId) return { rank: null, percentile: null };
        const target = await UserTestAttempt.findById(targetAttemptId).select('score accuracy totalTime').lean();
        if (!target) return { rank: null, percentile: null };
        const { score = 0, accuracy = 0, totalTime = 0 } = target;
        const base = { practiceTest: testId, status: 'Completed' };
        const [total, better] = await Promise.all([
            UserTestAttempt.countDocuments(base),
            UserTestAttempt.countDocuments({
                ...base,
                $or: [
                    { score: { $gt: score } },
                    { score, accuracy: { $gt: accuracy } },
                    { score, accuracy, totalTime: { $lt: totalTime } },
                ],
            }),
        ]);
        if (!total) return { rank: null, percentile: null };
        const rank = better + 1;
        const percentile = total > 1 ? Number((((total - rank) / (total - 1)) * 100).toFixed(2)) : 100;
        return { rank, percentile };
    } catch (error) {
        console.error('Error computing rank:', error);
        return { rank: null, percentile: null };
    }
}
