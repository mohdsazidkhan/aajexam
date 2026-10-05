import mongoose from 'mongoose';
import { attachSlugHook, slugify } from '../lib/utils/slug';
import ExamPattern from './ExamPattern';
import Exam from './Exam';
import { linkAndCompactQuestions } from '../lib/utils/mirrorTestQuestions';

const practiceTestSchema = new mongoose.Schema({
    examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern', required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    totalMarks: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 1 },
    accessLevel: { type: String, enum: ['FREE', 'PRO'], default: 'FREE' },
    isPYQ: { type: Boolean, default: false },
    pyqYear: { type: Number, default: null },
    pyqShift: { type: String, default: null, trim: true },
    pyqExamName: { type: String, default: null, trim: true },
    publishedAt: { type: Date, default: Date.now },
    // A test element is a LINK: `_id` is the id of the question in the `questions` collection (text, options, correct answer, images,
    // explanation, tags and difficulty live there, translations in `questiontranslations`) and `section` is the only test-specific
    // field. The content fields below are optional: they are only present on an element that has not been linked yet (new input
    // before the model hook runs, a question repeated inside one test, an invalid question).
    questions: [{
        questionText: { type: String },
        questionImage: { type: String },
        options: { type: [String], default: undefined },
        optionImages: { type: [String], default: undefined },
        correctAnswerIndex: { type: Number, min: 0 },
        explanation: { type: String, trim: true },
        explanationImage: { type: String },
        section: { type: String, required: true, trim: true },
        tags: { type: [String], default: undefined },
        difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'] }
    }]
}, { timestamps: true });

practiceTestSchema.index({ examPattern: 1 });
practiceTestSchema.index({ accessLevel: 1 });
practiceTestSchema.index({ publishedAt: -1 });
practiceTestSchema.index({ isPYQ: 1, pyqYear: -1 });
practiceTestSchema.index({ isPYQ: 1, examPattern: 1, pyqYear: -1 });
practiceTestSchema.index({ slug: 1 }, { unique: true, sparse: true });

// Auto-number new, non-PYQ practice test slugs sequentially per exam:
// "<exam-slug>-practice-test-<n>", where n continues the highest number
// already used across every pattern of that exam -- regardless of what
// the admin-entered title says or where the test was created from.
// PYQs, edits, and callers that set `slug` explicitly are untouched and
// fall through to the generic title-based hook below.
practiceTestSchema.pre('save', async function autoNumberSlug(next) {
    try {
        if (!this.isNew || this.isPYQ || this.slug) return next();

        const pattern = await ExamPattern.findById(this.examPattern).select('exam').lean();
        if (!pattern?.exam) return next();
        const exam = await Exam.findById(pattern.exam).select('slug name').lean();
        const examBase = exam?.slug || slugify(exam?.name || '');
        if (!examBase) return next();

        const base = `${examBase}-practice-test`;
        const siblingPatterns = await ExamPattern.find({ exam: pattern.exam }).select('_id').lean();
        const patternIds = siblingPatterns.map((p) => p._id);

        const existing = await this.constructor.find({
            examPattern: { $in: patternIds },
            isPYQ: { $ne: true },
            slug: new RegExp(`^${base}(-\\d+)?$`)
        }).select('slug').lean();

        let maxNum = 0;
        const numberedRe = new RegExp(`^${base}-(\\d+)$`);
        for (const doc of existing) {
            const m = doc.slug?.match(numberedRe);
            if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
            else if (doc.slug === base) maxNum = Math.max(maxNum, 1);
        }

        this.slug = `${base}-${maxNum + 1}`;
        next();
    } catch (err) {
        next(err);
    }
});

// Store-time linking: every question is stored as a link to its document in `questions` (see linkAndCompactQuestions): identical
// content reuses the existing document, new content creates a hidden one, an edit of a linked question updates the shared
// document in place (and clears its translations). Best-effort: a failure is logged and the test is still saved as submitted.
// Callers that bypass Mongoose (raw-driver seeds) run scripts/mirrorTests.mjs afterwards.
practiceTestSchema.pre('save', async function linkEmbeddedQuestions(next) {
    try {
        if ((this.isNew || this.isModified('questions')) && this.questions && this.questions.length) {
            await linkAndCompactQuestions(this.questions, { examPatternId: this.examPattern });
        }
    } catch (err) {
        console.error('PracticeTest question linking failed (save):', err);
    }
    next();
});

practiceTestSchema.pre('insertMany', async function linkEmbeddedQuestionsBulk(next, docs) {
    try {
        for (const doc of Array.isArray(docs) ? docs : []) {
            if (doc && Array.isArray(doc.questions) && doc.questions.length) {
                await linkAndCompactQuestions(doc.questions, { examPatternId: doc.examPattern });
            }
        }
    } catch (err) {
        console.error('PracticeTest question linking failed (insertMany):', err);
    }
    next();
});

practiceTestSchema.pre('findOneAndUpdate', async function linkEditedQuestions(next) {
    try {
        const update = this.getUpdate() || {};
        const target = update.$set && update.$set.questions ? update.$set : update;
        if (Array.isArray(target.questions) && target.questions.length) {
            let patternId = target.examPattern || (update.$set && update.$set.examPattern);
            if (!patternId) {
                const current = await this.model.findOne(this.getQuery()).select('examPattern').lean();
                patternId = current && current.examPattern;
            }
            await linkAndCompactQuestions(target.questions, { examPatternId: patternId });
        }
    } catch (err) {
        console.error('PracticeTest question linking failed (update):', err);
    }
    next();
});

attachSlugHook(practiceTestSchema, { sourceField: 'title' });

// Keeps accessLevel self-maintaining per examPattern: the latest-year PYQ is
// always FREE (all others PRO), and the most recently added non-PYQ practice
// test is always FREE (all others PRO). Runs after any save or delete so a
// newly added or removed paper automatically shifts which one is free,
// without a separate manual/scripted recompute step.
async function syncAccessLevel(Model, examPatternId, isPYQ) {
    if (!examPatternId) return;
    try {
        if (isPYQ) {
            const docs = await Model.find({ examPattern: examPatternId, isPYQ: true }).select('pyqYear').lean();
            if (!docs.length) return;
            const years = docs.filter((d) => d.pyqYear).map((d) => d.pyqYear);
            if (!years.length) return;
            const maxYear = Math.max(...years);
            await Model.updateMany({ examPattern: examPatternId, isPYQ: true, pyqYear: maxYear }, { $set: { accessLevel: 'FREE' } });
            await Model.updateMany({ examPattern: examPatternId, isPYQ: true, pyqYear: { $ne: maxYear } }, { $set: { accessLevel: 'PRO' } });
        } else {
            const latest = await Model.findOne({ examPattern: examPatternId, isPYQ: { $ne: true } })
                .sort({ createdAt: -1 })
                .select('_id')
                .lean();
            if (!latest) return;
            await Model.updateOne({ _id: latest._id }, { $set: { accessLevel: 'FREE' } });
            await Model.updateMany({ examPattern: examPatternId, isPYQ: { $ne: true }, _id: { $ne: latest._id } }, { $set: { accessLevel: 'PRO' } });
        }
    } catch (err) {
        console.error('PracticeTest accessLevel auto-sync failed:', err);
    }
}

practiceTestSchema.post('save', function (doc) {
    syncAccessLevel(doc.constructor, doc.examPattern, doc.isPYQ);
});

practiceTestSchema.post(/^findOneAndDelete$/, function (doc) {
    if (doc) syncAccessLevel(doc.constructor, doc.examPattern, doc.isPYQ);
});

export default mongoose.models.PracticeTest || mongoose.model('PracticeTest', practiceTestSchema);
