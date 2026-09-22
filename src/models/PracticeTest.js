import mongoose from 'mongoose';
import { attachSlugHook, slugify } from '../lib/utils/slug';
import ExamPattern from './ExamPattern';
import Exam from './Exam';

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
    questions: [{
        questionText: { type: String, required: true },
        questionImage: { type: String, default: '' },
        options: [{ type: String, required: true }],
        optionImages: [{ type: String, default: '' }],
        correctAnswerIndex: { type: Number, required: true, min: 0 },
        explanation: { type: String, trim: true },
        explanationImage: { type: String, default: '' },
        section: { type: String, required: true, trim: true },
        tags: [{ type: String, trim: true }],
        difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'mixed'], default: 'medium' }
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
