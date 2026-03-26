import mongoose from 'mongoose';

const examCategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Central', 'State'], required: true },
    description: { type: String, trim: true }
}, { timestamps: true });

examCategorySchema.index({ type: 1 });
examCategorySchema.index({ name: 1 });

export default mongoose.models.ExamCategory || mongoose.model('ExamCategory', examCategorySchema);
