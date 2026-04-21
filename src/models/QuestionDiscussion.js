import mongoose from 'mongoose';

const questionDiscussionSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  authorRole: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student'
  },

  sourceType: {
    type: String,
    enum: ['quiz', 'practice_test', 'pyq', 'daily_challenge', 'govt_exam_test'],
    required: true
  },
  sourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionDiscussion',
    default: null,
    index: true
  },
  rootId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'QuestionDiscussion',
    default: null,
    index: true
  },

  body: {
    type: String,
    required: true,
    trim: true,
    maxlength: 3000
  },
  image: {
    type: String,
    default: null
  },

  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  downvotes: { type: Number, default: 0 },
  downvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replyCount: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected', 'hidden'],
    default: 'approved',
    index: true
  },
  flaggedBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, trim: true, maxlength: 200 },
    at: { type: Date, default: Date.now }
  }],
  flagCount: { type: Number, default: 0, index: true },

  isAlternateSolution: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  editedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

questionDiscussionSchema.index({ question: 1, parent: 1, upvotes: -1 });
questionDiscussionSchema.index({ question: 1, createdAt: -1 });
questionDiscussionSchema.index({ rootId: 1, createdAt: 1 });

export default mongoose.models?.QuestionDiscussion
  || mongoose.model('QuestionDiscussion', questionDiscussionSchema);
