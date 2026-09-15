import mongoose from 'mongoose';
import { attachSlugHook } from '../lib/utils/slug';

const topicSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    // See Subject.previousSlugs — same redirect-preservation purpose.
    previousSlugs: [{ type: String, lowercase: true, trim: true }],
    description: { type: String, trim: true, default: '' },
    exams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Exam' }],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    // Set when a duplicate Topic doc is merged into a canonical one (data cleanup).
    mergedInto: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }
}, { timestamps: true });

// Same per-subject-not-global reasoning as the slug index below.
topicSchema.index({ subject: 1, name: 1 }, { unique: true });
topicSchema.index({ isActive: 1, order: 1 });
topicSchema.index({ subject: 1 });
topicSchema.index({ exams: 1, subject: 1, isActive: 1 });
// Topic slugs are unique per-subject, not globally — the same topic name
// (e.g. "World History") legitimately recurs across many subjects/exams,
// and pages are always addressed as /practice/<exam>/<subject>/<topic>.
topicSchema.index({ subject: 1, slug: 1 }, { unique: true, sparse: true });
topicSchema.index({ previousSlugs: 1 });

attachSlugHook(topicSchema, { sourceField: 'name' });

export default mongoose.models.Topic || mongoose.model('Topic', topicSchema);
