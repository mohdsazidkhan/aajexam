import Question from '@/models/Question';
import QuestionTranslation from '@/models/QuestionTranslation';
import Subject from '@/models/Subject';
import DailyChallenge from '@/models/DailyChallenge';

const DEVANAGARI = /[ऀ-ॿ]/;
const JUNK = /figure|diagram|graph|table|chart|passage|\[\[|image|unavailable/i;

/** Ids of questions already used in some daily challenge, so new days are not repeats. */
export async function usedDailyQuestionIds() {
    const rows = await DailyChallenge.find({}).select('questions.question').lean();
    const used = new Set();
    rows.forEach((c) => (c.questions || []).forEach((q) => q.question && used.add(String(q.question))));
    return used;
}

const englishOrHindiSubjects = async () => {
    const subs = await Subject.find({ name: /english|hindi/i }).select('_id').lean();
    return new Set(subs.map((s) => String(s._id)));
};

const clean = (q, badSubjects) => {
    const t = q.questionText || '';
    const o = q.options || [];
    return q.isActive !== false
        && !q.image
        && !badSubjects.has(String(q.subject))
        && !DEVANAGARI.test(t)
        && t.length >= 15 && t.length <= 400
        && o.length >= 4
        && o.some((x) => x.isCorrect)
        && o.every((x) => x.text && x.text.trim() && x.text.length <= 150 && !DEVANAGARI.test(x.text))
        && !JUNK.test(t + ' ' + o.map((x) => x.text).join(' '));
};

/**
 * Pick `count` random questions for a daily challenge: active, image-free, plain-English MCQs (not the English/Hindi
 * language subjects) that already have a stored Hindi translation, so the EN/HI toggle works on every question.
 * `exclude` (Set of id strings) is updated with the picked ids, so successive calls never repeat a question.
 * `difficulty` 'mixed' keeps any difficulty. Returns [] when the bank has nothing eligible.
 */
export async function pickDailyQuestions({ count = 10, difficulty = 'mixed', exclude = new Set() } = {}) {
    const badSubjects = await englishOrHindiSubjects();
    const picked = [];

    for (let attempt = 0; attempt < 6 && picked.length < count; attempt += 1) {
        const sample = await QuestionTranslation.aggregate([
            { $match: { lang: 'hi' } },
            { $sample: { size: Math.max(60, count * 8) } },
            { $project: { questionId: 1 } }
        ]);
        const ids = sample.map((s) => s.questionId).filter((id) => !exclude.has(String(id)));
        if (!ids.length) continue;

        const match = { _id: { $in: ids }, isActive: true };
        if (difficulty !== 'mixed') match.difficulty = difficulty;
        const docs = await Question.find(match).select('questionText options subject difficulty image isActive').lean();

        for (const q of docs) {
            if (picked.length >= count) break;
            if (exclude.has(String(q._id)) || !clean(q, badSubjects)) continue;
            picked.push(q);
            exclude.add(String(q._id));
        }
    }
    return picked;
}

/** The shape stored in DailyChallenge.questions */
export const toChallengeQuestions = (questions) => questions.map((q) => ({
    question: q._id,
    subject: q.subject ? String(q.subject) : '',
    difficulty: q.difficulty
}));
