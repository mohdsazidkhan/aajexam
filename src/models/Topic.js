import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

topicSchema.index({ subject: 1, name: 1 }, { unique: true });
topicSchema.index({ subject: 1, isActive: 1, order: 1 });

export default mongoose.models.Topic || mongoose.model('Topic', topicSchema);
