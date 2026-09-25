import mongoose from 'mongoose';
import { attachSlugHook } from '../lib/utils/slug';

const interviewQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true, trim: true },
    questionHi: { type: String, trim: true, default: '' },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    answer: { type: String, required: true },
    answerHi: { type: String, default: '' },
    tips: { type: String, default: '' },
    tipsHi: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewCategory', required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    views: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' }
}, { timestamps: true });

interviewQuestionSchema.index({ category: 1, status: 1 });
interviewQuestionSchema.index({ question: 'text', answer: 'text', questionHi: 'text', answerHi: 'text', tags: 'text' });

attachSlugHook(interviewQuestionSchema, { sourceField: 'question' });

export default mongoose.models.InterviewQuestion || mongoose.model('InterviewQuestion', interviewQuestionSchema);
