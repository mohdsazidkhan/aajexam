import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true, default: '' },
    icon: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

subjectSchema.index({ isActive: 1, order: 1 });

export default mongoose.models.Subject || mongoose.model('Subject', subjectSchema);
