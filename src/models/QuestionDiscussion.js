import mongoose from 'mongoose';

const questionDiscussionSchema = new mongoose.Schema({
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuestionDiscussion', default: null },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: { type: Number, default: 0 },
    downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isShortcut: { type: Boolean, default: false },
    isBestAnswer: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'hidden', 'deleted'], default: 'active' }
}, { timestamps: true });

questionDiscussionSchema.index({ question: 1, parentId: 1, createdAt: -1 });
questionDiscussionSchema.index({ question: 1, upvotes: -1 });
questionDiscussionSchema.index({ user: 1, createdAt: -1 });

export default mongoose.models.QuestionDiscussion || mongoose.model('QuestionDiscussion', questionDiscussionSchema);
