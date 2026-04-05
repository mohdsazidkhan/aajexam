import mongoose from 'mongoose';
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  options: [String],
  correctAnswerIndex: Number,
  timeLimit: {
    type: Number, // in seconds
    default: 30,  // optional: default time if not specified
    min: 5        // optional: minimum allowed
  },
  // AajExam Transformation Fields
  subject: { type: String, default: 'General' },
  subSubject: { type: String, default: '' },
  topic: { type: String, default: 'Miscellaneous' },
  explanation: { type: String, default: '' }, // Educational feedback for users
  examType: { type: String, default: 'General' }, // For targeted prep (e.g. SSC, UPSC)
}, { timestamps: true });

// Performance Optimization Indexes
questionSchema.index({ quiz: 1 });
questionSchema.index({ subject: 1, topic: 1 });
questionSchema.index({ examType: 1 });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
export default Question;
