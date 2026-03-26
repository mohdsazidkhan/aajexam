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
    const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
    return { totalScore, correctCount, wrongCount, attemptedCount, accuracy, answerDetails, sectionWiseScore };
}

export async function recomputeRanksForTest(testId, targetAttemptId = null) {
    try {
        const allAttempts = await UserTestAttempt.find({ practiceTest: testId, status: 'Completed' })
            .select('_id score accuracy totalTime submittedAt')
            .sort({ score: -1, accuracy: -1, totalTime: 1, submittedAt: 1 });
        const totalAttempts = allAttempts.length;
        if (totalAttempts === 0) return { rank: null, percentile: null };
        const bulkOps = [];
        let previousMetrics = null, previousRank = null, rankForTarget = { rank: null, percentile: null };
        allAttempts.forEach((attemptDoc, index) => {
            const { score: s = 0, accuracy: a = 0, totalTime: t = Infinity } = attemptDoc;
            let currentRank = index + 1;
            if (previousMetrics && previousMetrics.score === s && previousMetrics.accuracy === a && previousMetrics.totalTime === t) currentRank = previousRank;
            const percentileValue = totalAttempts > 1 ? Number((((totalAttempts - currentRank) / (totalAttempts - 1)) * 100).toFixed(2)) : 100;
            bulkOps.push({ updateOne: { filter: { _id: attemptDoc._id }, update: { $set: { rank: currentRank, percentile: percentileValue } } } });
            if (targetAttemptId && attemptDoc._id.toString() === targetAttemptId.toString()) rankForTarget = { rank: currentRank, percentile: percentileValue };
            previousMetrics = { score: s, accuracy: a, totalTime: t };
            previousRank = currentRank;
        });
        if (bulkOps.length > 0) await UserTestAttempt.bulkWrite(bulkOps);
        if (!targetAttemptId && totalAttempts > 0) rankForTarget = { rank: allAttempts[0].rank ?? 1, percentile: totalAttempts > 1 ? Number((((totalAttempts - 1) / (totalAttempts - 1)) * 100).toFixed(2)) : 100 };
        return rankForTarget;
    } catch (error) {
        console.error('Error recalculating ranks:', error);
        return { rank: null, percentile: null };
    }
}
