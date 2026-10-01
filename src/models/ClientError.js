import mongoose from 'mongoose';

/**
 * Errors reported by the clients themselves.
 *   source 'mobile' -> POST /api/mobile-errors  (aajexam-app, React Native)  -> admin: /admin/app-errors
 *   source 'web'    -> POST /api/web-errors     (this Next.js site's browser) -> admin: /admin/web-errors
 *
 * Identical errors are folded into ONE document (same fingerprint) and `count` is bumped,
 * so a crash hitting 5,000 users shows up as one row with count 5000, not 5,000 rows.
 */
const clientErrorSchema = new mongoose.Schema({
    source: { type: String, enum: ['mobile', 'web'], required: true, index: true },
    fingerprint: { type: String, required: true },

    // Whose fault: 'backend' = the server failed (API 5xx / timeout / unreachable),
    // 'frontend' = client-side bug (render crash, JS exception, bad request 4xx).
    origin: { type: String, enum: ['backend', 'frontend'], default: 'frontend', index: true },

    // What happened
    type: { type: String, enum: ['api', 'render', 'js', 'promise', 'network', 'other'], default: 'other' },
    message: { type: String, default: '' },
    errorName: { type: String, default: '' },
    stack: { type: String, default: '' },
    componentStack: { type: String, default: '' },

    // Where
    screen: { type: String, default: '' },      // RN route name / web pathname
    endpoint: { type: String, default: '' },    // normalised (/api/foo/:id)
    method: { type: String, default: '' },
    statusCode: { type: Number, default: null },

    // Who / on what (latest occurrence)
    appVersion: { type: String, default: '' },
    platform: { type: String, default: '' },    // android | ios | browser name
    osVersion: { type: String, default: '' },
    device: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    extra: { type: mongoose.Schema.Types.Mixed, default: null },

    // Triage
    count: { type: Number, default: 1 },
    firstSeenAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['open', 'resolved', 'ignored'], default: 'open', index: true },
    note: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
    reopenedCount: { type: Number, default: 0 },
}, { timestamps: true });

clientErrorSchema.index({ source: 1, fingerprint: 1 }, { unique: true });
clientErrorSchema.index({ source: 1, status: 1, lastSeenAt: -1 });
clientErrorSchema.index({ source: 1, lastSeenAt: -1 });

export default mongoose.models.ClientError || mongoose.model('ClientError', clientErrorSchema);
