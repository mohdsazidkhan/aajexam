import mongoose from 'mongoose';
import { attachSlugHook } from '../lib/utils/slug';

const interviewCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    // Slugs this category was previously published under; routes fall back to
    // this list and 301-redirect to the current slug so old links keep working.
    previousSlugs: [{ type: String, lowercase: true, trim: true }],
    type: { type: String, enum: ['government', 'private'], required: true },
    description: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

interviewCategorySchema.index({ type: 1, isActive: 1, order: 1 });
interviewCategorySchema.index({ slug: 1 }, { unique: true, sparse: true });
interviewCategorySchema.index({ previousSlugs: 1 });

attachSlugHook(interviewCategorySchema, { sourceField: 'name' });

export default mongoose.models.InterviewCategory || mongoose.model('InterviewCategory', interviewCategorySchema);
