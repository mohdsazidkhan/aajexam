import RevisionQueue from '@/models/RevisionQueue';
import Question from '@/models/Question';

const labelsOnly = (snapshot) => ({ subject: snapshot?.subject || '', topic: snapshot?.topic || '', difficulty: snapshot?.difficulty || 'medium' });

// the question this entry links to: an explicit questionRef, or the id itself when it is a quiz / practice-test question
const refCandidate = (item) => item.questionRef || ((item.source === 'quiz' || item.source === 'practice_test') ? item.sourceQuestionId : null);

async function existingQuestionIds(ids) {
    const list = [...new Set(ids.filter(Boolean).map(String))];
    if (!list.length) return new Set();
    const docs = await Question.find({ _id: { $in: list } }).select('_id').lean();
    return new Set(docs.map((d) => String(d._id)));
}

export function snapshotFromQuestionDoc(question) {
    const rawOptions = question?.options || [];
    const options = rawOptions.map(o => (typeof o === 'string' ? o : (o?.text ?? '')));
    const correctAnswerIndex = rawOptions.findIndex(o => o?.isCorrect === true);
    return {
        questionText: question?.questionText || '',
        options,
        correctAnswerIndex: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
        explanation: question?.explanation || '',
        subject: question?.subject || '',
        topic: question?.topic || '',
        difficulty: question?.difficulty || 'medium'
    };
}

export function snapshotFromPracticeTestQuestion(q) {
    return {
        questionText: q?.questionText || '',
        options: (q?.options || []).map(String),
        correctAnswerIndex: q?.correctAnswerIndex ?? 0,
        explanation: q?.explanation || '',
        subject: q?.section || '',
        topic: '',
        difficulty: q?.difficulty || 'medium'
    };
}

export function snapshotFromDailyChallengeQuestion(q) {
    const rawOptions = q?.options || [];
    const options = rawOptions.map(o => o?.text || '');
    const correctAnswerIndex = rawOptions.findIndex(o => o?.isCorrect === true);
    return {
        questionText: q?.questionText || '',
        options,
        correctAnswerIndex: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
        explanation: q?.explanation || '',
        subject: q?.subject || '',
        topic: '',
        difficulty: q?.difficulty || 'medium'
    };
}

export function snapshotFromReel(reel) {
    return {
        questionText: reel?.questionText || '',
        options: (reel?.options || []).map(String),
        correctAnswerIndex: reel?.correctAnswerIndex ?? 0,
        explanation: reel?.explanation || '',
        subject: reel?.subject || '',
        topic: reel?.topic || '',
        difficulty: reel?.difficulty || 'medium'
    };
}

export async function addWrongAnswerToRevision({ userId, source, sourceId, sourceTitle = '', sourceQuestionId, questionRef = null, snapshot }, known = null) {
    if (!userId || !source || !sourceId || !sourceQuestionId || !snapshot) return null;

    // linked to a question => keep only the labels, the content is read from `questions`
    const candidate = refCandidate({ source, sourceQuestionId, questionRef });
    const exists = candidate ? (known || await existingQuestionIds([candidate])).has(String(candidate)) : false;
    if (exists) { questionRef = candidate; snapshot = labelsOnly(snapshot); }

    // Available for review immediately so newly-wrong answers show up instantly in the queue
    const nextReviewDate = new Date();

    const existing = await RevisionQueue.findOne({ user: userId, source, sourceQuestionId });
    if (existing) {
        existing.interval = 1;
        existing.easeFactor = Math.max(1.3, existing.easeFactor - 0.2);
        existing.nextReviewDate = nextReviewDate;
        existing.lastAnswer = 'wrong';
        existing.status = 'active';
        existing.questionSnapshot = snapshot;
        if (questionRef) existing.questionRef = questionRef;
        if (sourceTitle) existing.sourceTitle = sourceTitle;
        await existing.save();
        return existing;
    }

    return RevisionQueue.create({
        user: userId,
        source,
        sourceId,
        sourceTitle,
        sourceQuestionId,
        questionRef,
        questionSnapshot: snapshot,
        nextReviewDate,
        interval: 1,
        easeFactor: 2.5,
        lastAnswer: 'wrong'
    });
}

export async function addManyWrongAnswersToRevision(items) {
    const known = await existingQuestionIds(items.map(refCandidate));
    const results = await Promise.allSettled(items.map(item => addWrongAnswerToRevision(item, known)));
    results.forEach(r => {
        if (r.status === 'rejected') console.error('Revision insert failed:', r.reason?.message);
    });
    return results;
}
