import mongoose from 'mongoose';
import { attachSlugHook } from '../lib/utils/slug';

const examSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamCategory', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    actualExam: { type: Boolean, default: true },
    logo: { type: String }
}, { timestamps: true });

examSchema.index({ category: 1 });
examSchema.index({ code: 1 });
examSchema.index({ isActive: 1 });
examSchema.index({ slug: 1 }, { unique: true, sparse: true });

attachSlugHook(examSchema, { sourceField: 'name' });

// Global hook to exclude actualExam: false by default in all lists and counts
examSchema.pre(/^(find|countDocuments)$/, function(next) {
    if (this.getQuery().actualExam === undefined) {
        this.where({ actualExam: { $ne: false } });
    }
    next();
});

export default mongoose.models.Exam || mongoose.model('Exam', examSchema);
