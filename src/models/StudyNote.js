import mongoose from 'mongoose';

const studyNoteSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    noteType: { type: String, enum: ['notes', 'formulas', 'shortcuts', 'important_points', 'tables', 'mnemonics'], required: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
    accessLevel: { type: String, enum: ['free', 'pro'], default: 'free' },
    views: { type: Number, default: 0 },
    bookmarks: { type: Number, default: 0 },
    bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    contributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isAdminCreated: { type: Boolean, default: true },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' }
}, { timestamps: true });

studyNoteSchema.index({ subject: 1, noteType: 1, accessLevel: 1, status: 1 });
studyNoteSchema.index({ topic: 1, status: 1 });
studyNoteSchema.index({ exam: 1, status: 1 });
studyNoteSchema.index({ title: 'text', content: 'text', tags: 'text' });

studyNoteSchema.pre('save', function (next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    next();
});

export default mongoose.models.StudyNote || mongoose.model('StudyNote', studyNoteSchema);
