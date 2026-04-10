import mongoose from 'mongoose';

const reelInteractionSchema = new mongoose.Schema({
	userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	reelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reel', required: true, index: true },

	// Actions
	liked: { type: Boolean, default: false },
	bookmarked: { type: Boolean, default: false },
	shared: { type: Boolean, default: false },

	// For question type reels
	answered: { type: Boolean, default: false },
	selectedOptionIndex: { type: Number, default: -1 },
	isCorrect: { type: Boolean, default: false },

	// For poll type reels
	votedOptionIndex: { type: Number, default: -1 },

	// Tracking
	viewedAt: { type: Date, default: Date.now },
	timeSpentSeconds: { type: Number, default: 0 }
}, { timestamps: true });

// One interaction per user per reel
reelInteractionSchema.index({ userId: 1, reelId: 1 }, { unique: true });
// Find all bookmarked reels for a user
reelInteractionSchema.index({ userId: 1, bookmarked: 1, createdAt: -1 });
// Find all liked reels for a user
reelInteractionSchema.index({ userId: 1, liked: 1, createdAt: -1 });

const ReelInteraction = mongoose.models.ReelInteraction || mongoose.model('ReelInteraction', reelInteractionSchema);
export default ReelInteraction;
