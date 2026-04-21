import mongoose from 'mongoose';

const translationCacheSchema = new mongoose.Schema({
    sourceHash: { type: String, required: true, index: true },
    targetLang: { type: String, required: true, lowercase: true },
    source: { type: String, required: true },
    translated: { type: String, required: true },
    model: { type: String, default: '' },
    charCount: { type: Number, default: 0 },
    hitCount: { type: Number, default: 0 }
}, { timestamps: true });

translationCacheSchema.index({ sourceHash: 1, targetLang: 1 }, { unique: true });

export default mongoose.models.TranslationCache || mongoose.model('TranslationCache', translationCacheSchema);
