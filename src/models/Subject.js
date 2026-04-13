import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    icon: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

subjectSchema.index({ exam: 1, name: 1 }, { unique: true });
subjectSchema.index({ exam: 1, isActive: 1, order: 1 });

export default mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
