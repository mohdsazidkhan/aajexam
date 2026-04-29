import mongoose from 'mongoose';
import { attachSlugHook } from '../lib/utils/slug';

const examCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Central', 'State'], required: true },
    slug: { type: String, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true }
}, { timestamps: true });

examCategorySchema.index({ type: 1 });
examCategorySchema.index({ name: 1 });
examCategorySchema.index({ slug: 1 }, { unique: true, sparse: true });

attachSlugHook(examCategorySchema, {
    composer: (doc) => `${doc.name}${doc.type ? ' ' + doc.type : ''}`
});

export default mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
