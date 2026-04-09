import mongoose from 'mongoose';

const communityQuestionSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  options: [{
    text: { type: String, trim: true },
    isCorrect: { type: Boolean, default: false }
  }],
  explanation: {
    type: String,
    trim: true,
    maxlength: 3000,
    default: ''
  },
  image: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

communityQuestionSchema.index({ author: 1, createdAt: -1 });
communityQuestionSchema.index({ exam: 1, status: 1 });
communityQuestionSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models?.CommunityQuestion || mongoose.model('CommunityQuestion', communityQuestionSchema);
