import mongoose from 'mongoose';
import { attachSlugHook } from '../lib/utils/slug';

const topicSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String, trim: true, default: '' },
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

topicSchema.index({ isActive: 1, order: 1 });
topicSchema.index({ subject: 1 });
topicSchema.index({ exams: 1, subject: 1, isActive: 1 });
topicSchema.index({ slug: 1 }, { unique: true, sparse: true });

attachSlugHook(topicSchema, { sourceField: 'name' });

export default mongoose.models.Topic || mongoose.model('Topic', topicSchema);
