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
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
export default Question;
