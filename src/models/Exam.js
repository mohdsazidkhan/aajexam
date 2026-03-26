import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamCategory', required: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    logo: { type: String }
}, { timestamps: true });

examSchema.index({ category: 1 });
examSchema.index({ code: 1 });
examSchema.index({ isActive: 1 });

export default mongoose.models.Exam || mongoose.model('Exam', examSchema);
