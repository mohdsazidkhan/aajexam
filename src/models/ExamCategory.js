import mongoose from 'mongoose';
import { attachSlugHook } from '../lib/utils/slug';

const examCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Central', 'State'], required: true },
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String, trim: true }
}, { timestamps: true });

examCategorySchema.index({ type: 1 });
examCategorySchema.index({ name: 1 });
examCategorySchema.index({ slug: 1 }, { unique: true, sparse: true });

// Append the type only when the name doesn't already imply it. Avoids ugly
// "central-central" / "state-state" slugs when the editor names a category
// after its type ("Central", "State"). Real-world names like "SSC Central"
// keep their type suffix to stay disambiguated.
attachSlugHook(examCategorySchema, {
    composer: (doc) => {
        const name = (doc.name || '').trim();
        const type = (doc.type || '').trim();
        if (!type) return name;
        if (name.toLowerCase() === type.toLowerCase()) return name;
        if (name.toLowerCase().includes(type.toLowerCase())) return name;
        return `${name} ${type}`;
    }
});

export default mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
