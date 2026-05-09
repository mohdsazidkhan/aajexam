import mongoose from 'mongoose';
import { attachSlugHook } from '../lib/utils/slug';

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String, trim: true, default: '' },
    icon: { type: String, default: '' },
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

subjectSchema.index({ isActive: 1, order: 1 });
subjectSchema.index({ exams: 1, isActive: 1, order: 1 });
subjectSchema.index({ slug: 1 }, { unique: true, sparse: true });

attachSlugHook(subjectSchema, { sourceField: 'name' });

export default mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
