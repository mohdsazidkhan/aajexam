import RevisionQueue from '@/models/RevisionQueue';

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

export async function addWrongAnswerToRevision({ userId, source, sourceId, sourceTitle = '', sourceQuestionId, questionRef = null, snapshot }) {
    if (!userId || !source || !sourceId || !sourceQuestionId || !snapshot) return null;

    const nextReviewDate = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const existing = await RevisionQueue.findOne({ user: userId, source, sourceQuestionId });
    if (existing) {
        existing.interval = 1;
        existing.easeFactor = Math.max(1.3, existing.easeFactor - 0.2);
        existing.nextReviewDate = nextReviewDate;
        existing.lastAnswer = 'wrong';
        existing.status = 'active';
        existing.questionSnapshot = snapshot;
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
    const results = await Promise.allSettled(items.map(item => addWrongAnswerToRevision(item)));
    results.forEach(r => {
        if (r.status === 'rejected') console.error('Revision insert failed:', r.reason?.message);
    });
    return results;
}
