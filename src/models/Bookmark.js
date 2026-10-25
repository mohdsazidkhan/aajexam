import mongoose from 'mongoose';

// Generic "saved for later" link between a student and a piece of content. Reels and study notes
// keep their original stores (ReelInteraction.bookmarked / StudyNote.bookmarkedBy); everything
// else lives here, one row per (user, type, content).
export const BOOKMARK_TYPES = ['test', 'quiz', 'community', 'news', 'affair', 'subject', 'topic', 'blog'];

const bookmarkSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: BOOKMARK_TYPES, required: true },
    refId: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

bookmarkSchema.index({ user: 1, type: 1, refId: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, type: 1, createdAt: -1 });

export default mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);
