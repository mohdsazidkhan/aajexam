// `questions` is the source of truth for every question. Practice tests / PYQs link to it by id (their element `_id` IS the Question `_id`,
// see mirrorTestQuestions.js); the text still embedded in a test is only a leftover copy. These helpers re-attach the content from
// `questions` onto the lean test, in the SAME shape the embedded copy had, so every caller keeps working unchanged:
//   - a question that has a `questions` document is taken from there (text, options, correct answer, images, explanation, tags, difficulty);
//   - a question without one (a repeat inside the same test, an invalid one) keeps whatever it carries.
// This also works after the embedded copies are removed, and it keeps working while they are still there.
import Question from '../../models/Question';
import PracticeTest from '../../models/PracticeTest';

const needsContent = (q) => !!q && q._id != null;

function shapeFrom(q, d) {
    const opts = d.options || [];
    const images = opts.map((o) => o.image || '');
    return {
        ...q,
        questionText: d.questionText,
        options: opts.map((o) => o.text),
        optionImages: images.some(Boolean) ? images : [],
        correctAnswerIndex: opts.findIndex((o) => o.isCorrect),
        questionImage: d.image || q.questionImage || '',
        explanation: d.explanation || q.explanation || '',
        tags: d.tags && d.tags.length ? d.tags : (q.tags || []),
        difficulty: d.difficulty || q.difficulty || 'medium',
    };
}

/** Fills `test.questions` (lean object) in place and returns it. */
export async function hydrateTestQuestions(test) {
    if (!test || !Array.isArray(test.questions) || !test.questions.some(needsContent)) return test;
    const ids = test.questions.filter(needsContent).map((q) => q._id);
    const docs = await Question.find({ _id: { $in: ids } }).select('questionText options image explanation difficulty tags').lean();
    const byId = new Map(docs.map((d) => [String(d._id), d]));
    test.questions = test.questions.map((q) => {
        if (!needsContent(q)) return q;
        const d = byId.get(String(q._id));
        return d ? shapeFrom(q, d) : q;
    });
    return test;
}

/** Same for a list of lean tests, with ONE query for all of them. */
export async function hydrateTests(tests) {
    const list = (tests || []).filter((t) => t && Array.isArray(t.questions) && t.questions.some(needsContent));
    if (!list.length) return tests;
    const ids = [...new Set(list.flatMap((t) => t.questions.filter(needsContent).map((q) => String(q._id))))];
    const byId = new Map();
    for (let i = 0; i < ids.length; i += 5000) {
        const docs = await Question.find({ _id: { $in: ids.slice(i, i + 5000) } }).select('questionText options image explanation difficulty tags').lean();
        docs.forEach((d) => byId.set(String(d._id), d));
    }
    for (const t of list) t.questions = t.questions.map((q) => { if (!needsContent(q)) return q; const d = byId.get(String(q._id)); return d ? shapeFrom(q, d) : q; });
    return tests;
}

/**
 * Ids of the questions whose text / explanation / difficulty / tags match a search regex. Tests no longer carry their own text, so
 * search finds the tests that contain these ids instead of regex-matching the embedded copy.
 */
export async function questionIdsMatching(regex, limit = 3000) {
    if (!regex) return [];
    const docs = await Question.find({ $or: [{ questionText: regex }, { explanation: regex }, { difficulty: regex }, { tags: regex }] })
        .select('_id').limit(limit).lean();
    return docs.map((d) => d._id);
}

// ---------------------------------------------------------------------------------------------------------------------
// Daily challenges and the revision queue link to `questions` the same way. Their embedded text/options are optional copies.

const optionObjects = (d) => (d.options || []).map((o) => ({ text: o.text, isCorrect: !!o.isCorrect }));

/** Daily challenge (lean): fills each question that has a `question` link, in the shape the challenge always had. */
export async function hydrateDailyChallenge(challenge) {
    if (!challenge || !Array.isArray(challenge.questions)) return challenge;
    const ids = challenge.questions.filter((q) => q && q.question).map((q) => q.question);
    if (!ids.length) return challenge;
    const docs = await Question.find({ _id: { $in: ids } }).select('questionText options explanation difficulty').lean();
    const byId = new Map(docs.map((d) => [String(d._id), d]));
    challenge.questions = challenge.questions.map((q) => {
        const d = q && q.question ? byId.get(String(q.question)) : null;
        return d ? { ...q, questionText: d.questionText, options: optionObjects(d), explanation: d.explanation || q.explanation || '', difficulty: d.difficulty || q.difficulty || 'medium' } : q;
    });
    return challenge;
}

/**
 * Revision queue entries (lean objects): when an entry links to a question (`questionRef`) its text, options, correct answer and
 * explanation are read from `questions`; the snapshot only keeps the subject / topic / difficulty labels. Entries whose question
 * has no document keep the snapshot they carry.
 */
export async function hydrateRevisionItems(items) {
    const list = Array.isArray(items) ? items : [];
    const need = list.filter((it) => it && it.questionRef && !(it.questionSnapshot && it.questionSnapshot.questionText));
    if (!need.length) return items;
    const ids = [...new Set(need.map((it) => String(it.questionRef)))];
    const byId = new Map();
    for (let i = 0; i < ids.length; i += 5000) {
        const docs = await Question.find({ _id: { $in: ids.slice(i, i + 5000) } }).select('questionText options explanation difficulty').lean();
        docs.forEach((d) => byId.set(String(d._id), d));
    }
    for (const it of need) {
        const d = byId.get(String(it.questionRef)); if (!d) continue;
        const opts = d.options || [];
        const snap = it.questionSnapshot || {};
        it.questionSnapshot = { ...snap, questionText: d.questionText, options: opts.map((o) => o.text), correctAnswerIndex: Math.max(0, opts.findIndex((o) => o.isCorrect)), explanation: d.explanation || '', difficulty: snap.difficulty || d.difficulty || 'medium' };
    }
    return items;
}

/** Ids of the questions whose text / explanation match, to find daily challenges and revision entries that link to them. */
export async function questionIdsByText(regex, limit = 3000) {
    if (!regex) return [];
    const docs = await Question.find({ $or: [{ questionText: regex }, { explanation: regex }] }).select('_id').limit(limit).lean();
    return docs.map((d) => d._id);
}


// ---------------------------------------------------------------------------------------------------------------------
// Start / attempt-detail routes load the same test (with its examPattern and every question) for each student. That is the
// heaviest read in the app, so keep the hydrated test in this instance's memory for two minutes. Callers must treat it as read-only.
const TEST_TTL_MS = 120 * 1000;
const TEST_MAX = 30;
const testCache = new Map();
const testInflight = new Map();

export async function loadHydratedTest(testId) {
    const key = String(testId);
    const hit = testCache.get(key);
    if (hit && hit.exp > Date.now()) return hit.test;
    if (testInflight.has(key)) return testInflight.get(key);
    const run = (async () => {
        try {
            const test = await PracticeTest.findById(testId).populate('examPattern', 'title duration totalMarks sections negativeMarking').lean();
            if (!test) return null;
            await hydrateTestQuestions(test);
            testCache.set(key, { test, exp: Date.now() + TEST_TTL_MS });
            if (testCache.size > TEST_MAX) testCache.delete(testCache.keys().next().value);
            return test;
        } finally {
            testInflight.delete(key);
        }
    })();
    testInflight.set(key, run);
    return run;
}
