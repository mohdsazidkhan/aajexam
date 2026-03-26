import mongoose from 'mongoose';

const examPatternSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    title: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 0 },
    negativeMarking: { type: Number, default: 0, min: 0 },
    sections: [{
        name: { type: String, required: true, trim: true },
        totalQuestions: { type: Number, required: true, min: 1 },
        marksPerQuestion: { type: Number, required: true, min: 0 },
        negativePerQuestion: { type: Number, default: 0, min: 0 },
        sectionDuration: { type: Number, min: 0 }
    }]
}, { timestamps: true });

examPatternSchema.index({ exam: 1 });
examPatternSchema.index({ title: 1 });

export default mongoose.models.ExamPattern || mongoose.model('ExamPattern', examPatternSchema);
