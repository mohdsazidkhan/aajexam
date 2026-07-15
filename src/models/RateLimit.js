import mongoose from 'mongoose';

/**
 * Fixed-window rate-limit counter, one document per (key).
 * `key` is something like "login:1.2.3.4" or "ai-generate:<userId>".
 * `expiresAt` is when the current window ends; a TTL index reaps stale
 * docs a minute or so after they lapse (logical reset happens in the
 * update pipeline regardless, so physical cleanup timing doesn't matter).
 */
const rateLimitSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
}, { timestamps: false, versionKey: false });

// TTL cleanup — Mongo removes the doc ~60s after expiresAt passes.
rateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 60 });

export default mongoose.models.RateLimit || mongoose.model('RateLimit', rateLimitSchema);
