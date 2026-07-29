import mongoose from 'mongoose';

/**
 * A question stored in another language, ready to serve.
 *
 * Unlike TranslationCache (hash of an arbitrary string), this is keyed by the
 * question itself, so an attempt screen can load every translated question of a
 * quiz/test in one query instead of translating string by string at runtime.
 *
 * `questionId` is the Question document id for quizzes, and the embedded
 * question subdocument's _id for practice tests. It is the only lookup key that
 * matters — quizzes reuse the same Question documents, so one translation
 * serves every quiz that includes that question. `sourceType`/`sourceId` are
 * provenance for the source that first paid for it, not a filter.
 */
const questionTranslationSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sourceType: { type: String, enum: ['quiz', 'test'], required: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    lang: { type: String, required: true, lowercase: true },
    questionText: { type: String, default: '' },
    options: [{ type: String }],
    model: { type: String, default: '' }
}, { timestamps: true });

questionTranslationSchema.index({ questionId: 1, lang: 1 }, { unique: true });

export default mongoose.models.QuestionTranslation
    || mongoose.model('QuestionTranslation', questionTranslationSchema);
