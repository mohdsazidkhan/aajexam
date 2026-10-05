import mongoose from 'mongoose';
import { questionDocKey } from '../lib/utils/mirrorTestQuestions';

const questionSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
    questionText: { type: String, required: true, trim: true },
    options: [{
        text: { type: String, required: true, trim: true },
        isCorrect: { type: Boolean, default: false },
        image: { type: String, default: '' }
    }],
    explanation: { type: String, trim: true, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    tags: [{ type: String, trim: true, lowercase: true }],
    language: { type: String, enum: ['hi', 'en'], default: 'hi' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    // 'practice_embedded' = mirrors a PracticeTest/PYQ embedded question (see lib/utils/embeddedSource.js)
    source: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

questionSchema.index({ exam: 1, subject: 1, topic: 1 });
questionSchema.index({ subject: 1, difficulty: 1 });
questionSchema.index({ topic: 1, isActive: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdAt: -1 });

// `questions` is the single source of truth, and `questiontranslations` is keyed by the question id. A translation belongs to the
// exact text/options it was made from, so when the content of a question changes (from the admin form, a test edit, anywhere) its
// stored translations are deleted and are made again from the new text on demand.
const translationsOf = (id) => mongoose.connection.db.collection('questiontranslations').deleteMany({ questionId: id });
const contentKey = (d) => questionDocKey({ questionText: d.questionText, options: d.options, image: d.image });

questionSchema.pre('findOneAndUpdate', async function rememberContent(next) {
    try {
        const u = this.getUpdate() || {};
        const set = u.$set || u;
        if (set.questionText === undefined && set.options === undefined && set.image === undefined) return next();
        const before = await this.model.findOne(this.getQuery()).select('questionText options image').lean();
        if (!before) return next();
        const after = { questionText: set.questionText ?? before.questionText, options: set.options ?? before.options, image: set.image ?? before.image };
        this._translationsToDrop = contentKey(before) !== contentKey(after) ? before._id : null;
    } catch (err) {
        console.error('Question update: could not compare content:', err);
    }
    next();
});

questionSchema.post('findOneAndUpdate', async function dropStaleTranslations() {
    try {
        if (this._translationsToDrop) await translationsOf(this._translationsToDrop);
    } catch (err) {
        console.error('Question update: could not drop stale translations:', err);
    }
});

questionSchema.pre('save', async function dropStaleTranslationsOnSave(next) {
    try {
        if (!this.isNew && (this.isModified('questionText') || this.isModified('options') || this.isModified('image'))) await translationsOf(this._id);
    } catch (err) {
        console.error('Question save: could not drop stale translations:', err);
    }
    next();
});

export default mongoose.models.Question || mongoose.model('Question', questionSchema);
