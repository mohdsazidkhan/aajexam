import mongoose from 'mongoose';
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  totalMarks: Number,
  timeLimit: Number, // in minutes

  // Level-based quiz system
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },
  requiredLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  recommendedLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  levelRange: {
    min: { type: Number, default: 1, min: 1, max: 10 },
    max: { type: Number, default: 10, min: 1, max: 10 }
  },
  tags: [String], // For additional categorization

  // Educational content fields for AdSense compliance
  educationalDescription: {
    type: String,
    default: '',
    maxlength: 5000 // Allow up to 5000 characters for detailed educational content
  },
  syllabusCovered: [{
    type: String,
    trim: true
  }], // Array of syllabus topics covered
  learningOutcomes: [{
    type: String,
    trim: true
  }], // Array of learning outcomes
  examRelevance: {
    type: String,
    default: '',
    maxlength: 1000 // Which government exams this quiz is relevant for
  },
  sampleQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }], // Array of question IDs to show as preview (3-5 questions)

  description: String,
  isActive: { type: Boolean, default: true },

  // Creator tracking fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdType: { type: String, enum: ['admin', 'user'], default: 'admin' },

  // Approval status (admin quizzes are auto-approved, user quizzes need approval)
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  adminNotes: { type: String }, // Admin approval/rejection notes
  approvedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Reward fields
  rewardAmount: { type: Number, default: 0 },
  rewardCredited: { type: Boolean, default: false },

  // Engagement metrics (for user-created quizzes)
  viewsCount: { type: Number, default: 0 },
  attemptsCount: { type: Number, default: 0 }
}, { timestamps: true });

// Index for efficient level-based queries
quizSchema.index({ requiredLevel: 1, isActive: 1 });
quizSchema.index({ difficulty: 1, isActive: 1 });
quizSchema.index({ createdBy: 1, createdType: 1, status: 1 });
quizSchema.index({ status: 1, createdAt: -1 });
quizSchema.index({ createdType: 1, status: 1, isActive: 1 });

const Quiz = mongoose.models?.Quiz || mongoose.model('Quiz', quizSchema);
export default Quiz;
