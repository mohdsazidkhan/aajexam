import mongoose from 'mongoose';

/**
 * Email + mobile number captured from a logged-out visitor who did not want to sign up with Google yet
 * (exit-intent modal). Used later for a reminder / campaign before the free-PRO promo ends.
 */
const leadSchema = new mongoose.Schema({
    email: { type: String, required: true, lowercase: true, trim: true, maxlength: 200 },
    phone: { type: String, default: '' },        // 10-digit Indian mobile number, digits only
    source: { type: String, default: 'exit' },   // which prompt captured it
    path: { type: String, default: '' },         // page the visitor was on
    day: { type: String, default: '' },          // IST day, 'YYYY-MM-DD'
    createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

leadSchema.index({ email: 1 }, { unique: true });
leadSchema.index({ createdAt: -1 });

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);
