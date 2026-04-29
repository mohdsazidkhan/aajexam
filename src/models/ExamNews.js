import mongoose from 'mongoose';
import { attachSlugHook } from '../lib/utils/slug';

const examNewsSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true, index: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['notification', 'admit_card', 'result', 'answer_key', 'syllabus', 'vacancy', 'date_change', 'other'], required: true },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    examName: { type: String, trim: true },
    importantDates: [{
        label: { type: String, required: true },
        date: { type: Date, required: true }
    }],
    officialLink: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    isPinned: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

examNewsSchema.index({ status: 1, createdAt: -1 });
examNewsSchema.index({ type: 1, status: 1 });
examNewsSchema.index({ exam: 1, status: 1 });
examNewsSchema.index({ isPinned: -1, createdAt: -1 });
examNewsSchema.index({ title: 'text', content: 'text' });
examNewsSchema.index({ slug: 1 }, { unique: true, sparse: true });

attachSlugHook(examNewsSchema, { sourceField: 'title' });

export default mongoose.models.ExamNews || mongoose.model('ExamNews', examNewsSchema);
