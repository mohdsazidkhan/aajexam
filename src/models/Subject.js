import mongoose from 'mongoose';
import { attachSlugHook } from '../lib/utils/slug';

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, lowercase: true, trim: true },
    // Slugs this Subject was previously published under. Populated when a
    // slug is regenerated (e.g. stripping an ugly auto-suffix); routes fall
    // back to this list and 301-redirect to the current slug so any indexed
    // old URL keeps working instead of 404ing.
    previousSlugs: [{ type: String, lowercase: true, trim: true }],
    description: { type: String, trim: true, default: '' },
    icon: { type: String, default: '' },
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    // Set when a duplicate Subject doc is merged into a canonical one (data cleanup).
    mergedInto: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }
}, { timestamps: true });

subjectSchema.index({ isActive: 1, order: 1 });
subjectSchema.index({ exams: 1, isActive: 1, order: 1 });
subjectSchema.index({ slug: 1 }, { unique: true, sparse: true });
subjectSchema.index({ previousSlugs: 1 });

attachSlugHook(subjectSchema, { sourceField: 'name' });

export default mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
