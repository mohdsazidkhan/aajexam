import mongoose from 'mongoose';

// Shared (cross-instance) cache for expensive read endpoints; see lib/utils/sharedCache.js.
// Mongo's TTL monitor removes rows once `expiresAt` passes.
const apiCacheSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed },
    expiresAt: { type: Date, required: true },
}, { timestamps: false });

apiCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ApiCache = mongoose.models.ApiCache || mongoose.model('ApiCache', apiCacheSchema);
export default ApiCache;
