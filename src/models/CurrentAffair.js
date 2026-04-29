import mongoose from 'mongoose';
import { attachSlugHook, dateSegment } from '../lib/utils/slug';

const currentAffairSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    category: { type: String, enum: ['national', 'international', 'economy', 'science', 'sports', 'awards', 'appointments', 'defence', 'environment', 'other'], required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true, index: true },
    content: { type: String, required: true },
    keyPoints: [{ type: String, trim: true }],
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    tags: [{ type: String, trim: true, lowercase: true }],
    questions: [{
        questionText: { type: String, required: true },
        options: [{
            text: { type: String, required: true },
            isCorrect: { type: Boolean, default: false }
        }],
        explanation: { type: String, default: '' }
    }],
    views: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

currentAffairSchema.index({ date: -1, status: 1 });
currentAffairSchema.index({ category: 1, date: -1 });
currentAffairSchema.index({ tags: 1 });
currentAffairSchema.index({ title: 'text', content: 'text' });
currentAffairSchema.index({ slug: 1 }, { unique: true, sparse: true });

attachSlugHook(currentAffairSchema, {
    composer: (doc) => {
        const ds = dateSegment(doc.date);
        return [ds, doc.title].filter(Boolean).join(' ');
    }
});

export default mongoose.models.CurrentAffair || mongoose.model('CurrentAffair', currentAffairSchema);
