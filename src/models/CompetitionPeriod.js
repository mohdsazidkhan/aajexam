import mongoose from 'mongoose';

/**
 * CompetitionPeriod
 * Tracks the status of each competition period (open → processing → rewarded).
 * Used to prevent double-processing by cron re-runs or manual triggers.
 */
const CompetitionPeriodSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },
    // period: '2025-01-15' (daily), '2025-W3' (weekly), '2025-01' (monthly)
    period: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'processing', 'rewarded', 'failed'],
        default: 'open',
        index: true
    },
    // Summary after processing
    totalWinners:    { type: Number, default: 0 },
    totalPrizePool:  { type: Number, default: 0 },
    activeProUsers:  { type: Number, default: 0 },
    processedAt:     { type: Date, default: null },
    processedBy:     { type: String, default: 'cron' }, // 'cron' | 'manual'
    // Error capture if status = 'failed'
    errorMessage:    { type: String, default: null },
    // Idempotency: cron sets this to prevent parallel execution
    processingStartedAt: { type: Date, default: null }
}, { timestamps: true });

// Unique: one period document per type+period
CompetitionPeriodSchema.index({ type: 1, period: 1 }, { unique: true });

// ── Static Methods ────────────────────────────────────────────────────────────

/**
 * Atomically claim a period for processing.
 * Returns null if already being processed or already rewarded.
 */
CompetitionPeriodSchema.statics.claimForProcessing = async function (type, period) {
    const doc = await this.findOneAndUpdate(
        {
            type,
            period,
            status: { $in: ['open', 'failed'] } // allow retry on failure
        },
        {
            $set: {
                status:              'processing',
                processingStartedAt: new Date()
            },
            $setOnInsert: { type, period }
        },
        { upsert: true, new: true, runValidators: true }
    );

    // If the returned doc status isn't 'processing' (e.g. was already 'rewarded'), bail out
    if (!doc || doc.status !== 'processing') return null;

    // Guard: if another process already claimed it within the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (doc.processingStartedAt && doc.processingStartedAt < tenMinutesAgo && doc.status === 'processing') {
        // Stale processing lock — another run crashed. Allow this run to continue.
        return doc;
    }

    return doc;
};

/**
 * Mark period as rewarded after successful cron run.
 */
CompetitionPeriodSchema.statics.markRewarded = async function (type, period, summary) {
    return this.findOneAndUpdate(
        { type, period },
        {
            $set: {
                status:         'rewarded',
                processedAt:    new Date(),
                totalWinners:   summary.totalWinners   || 0,
                totalPrizePool: summary.totalPrizePool || 0,
                activeProUsers: summary.activeProUsers || 0,
                processedBy:    summary.processedBy    || 'cron',
                errorMessage:   null
            }
        },
        { new: true, upsert: true }
    );
};

/**
 * Mark period as failed (so cron can retry).
 */
CompetitionPeriodSchema.statics.markFailed = async function (type, period, errorMessage) {
    return this.findOneAndUpdate(
        { type, period },
        { $set: { status: 'failed', errorMessage } },
        { new: true, upsert: true }
    );
};

/**
 * Check if a period was already successfully rewarded (quick idempotency check).
 */
CompetitionPeriodSchema.statics.isAlreadyRewarded = async function (type, period) {
    const doc = await this.findOne({ type, period });
    return doc?.status === 'rewarded';
};

const CompetitionPeriod = mongoose.models.CompetitionPeriod
    || mongoose.model('CompetitionPeriod', CompetitionPeriodSchema);

export default CompetitionPeriod;
