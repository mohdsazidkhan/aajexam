import mongoose from 'mongoose';

const tableDataSchema = new mongoose.Schema({
	key: { type: String, required: true, trim: true },
	value: { type: String, required: true, trim: true }
}, { _id: false });

const reelSchema = new mongoose.Schema({
	// Card Type
	type: {
		type: String,
		enum: ['question', 'fact', 'tip', 'current_affairs', 'poll'],
		required: true
	},

	// ──── Common Fields ────
	title: { type: String, trim: true, default: '' },
	content: { type: String, trim: true, default: '' },
	backgroundColor: { type: String, default: '' }, // Gradient override

	// ──── Question Type ────
	questionText: { type: String, trim: true },
	options: {
		type: [String],
		validate: {
			validator: function (arr) {
				if (this.type !== 'question') return true;
				return Array.isArray(arr) && arr.length === 4;
			},
			message: 'Questions require exactly 4 options.'
		}
	},
	correctAnswerIndex: { type: Number, min: 0, max: 3 },
	explanation: { type: String, trim: true, default: '' },
	shortcutTrick: { type: String, trim: true, default: '' },

	// ──── Fact Type ────
	keyPoints: { type: [String], default: [] },
	highlightText: { type: String, trim: true, default: '' },

	// ──── Tip/Trick Type ────
	steps: { type: [String], default: [] },
	tryYourself: { type: [String], default: [] },
	formula: { type: String, trim: true, default: '' },

	// ──── Current Affairs Type ────
	caDate: { type: Date },
	caCategory: { type: String, trim: true, default: '' }, // Economy, Sports, National, International...
	tableData: { type: [tableDataSchema], default: [] },
	keyTakeaway: { type: String, trim: true, default: '' },

	// ──── Poll Type ────
	pollQuestion: { type: String, trim: true },
	pollOptions: {
		type: [{
			text: { type: String, required: true, trim: true },
			votes: { type: Number, default: 0 }
		}],
		default: []
	},

	// ──── Categorization ────
	subject: { type: String, trim: true, default: 'General' },
	topic: { type: String, trim: true, default: '' },
	examType: { type: String, trim: true, default: 'General' }, // SSC, Banking, Railway...
	difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
	tags: { type: [String], default: [] },

	// ──── Engagement Counters ────
	likesCount: { type: Number, default: 0 },
	bookmarksCount: { type: Number, default: 0 },
	sharesCount: { type: Number, default: 0 },
	viewsCount: { type: Number, default: 0 },
	answeredCount: { type: Number, default: 0 },
	correctCount: { type: Number, default: 0 },

	// ──── Audio & Duration ────
	audioFile: { type: String, trim: true, default: '' }, // filename from /reel_audio/
	duration: { type: Number, default: 0, min: 0 }, // seconds

	// ──── Creator ────
	createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	creatorRole: { type: String, enum: ['admin', 'user'], default: 'user' },
	status: { type: String, enum: ['draft', 'pending', 'published', 'rejected', 'archived'], default: 'pending' },
	adminNotes: { type: String, trim: true, default: '' },
	publishedAt: { type: Date }
}, { timestamps: true });

// Indexes for feed queries
reelSchema.index({ status: 1, publishedAt: -1 });
reelSchema.index({ status: 1, type: 1, publishedAt: -1 });
reelSchema.index({ status: 1, subject: 1, publishedAt: -1 });
reelSchema.index({ status: 1, topic: 1, publishedAt: -1 });
reelSchema.index({ status: 1, examType: 1, publishedAt: -1 });
reelSchema.index({ createdBy: 1, createdAt: -1 });
reelSchema.index({ status: 1, likesCount: -1 }); // Trending
reelSchema.index({ tags: 1 });

// Auto-set publishedAt when status changes to published
reelSchema.pre('save', function (next) {
	if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
		this.publishedAt = new Date();
	}
	next();
});

// Re-register model with latest schema (handles HMR in dev mode)
if (mongoose.models.Reel) delete mongoose.models.Reel;
if (mongoose.connection?.models?.Reel) delete mongoose.connection.models.Reel;
if (mongoose.modelSchemas?.Reel) delete mongoose.modelSchemas.Reel;
const Reel = mongoose.model('Reel', reelSchema);
export default Reel;
