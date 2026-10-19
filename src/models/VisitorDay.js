import mongoose from 'mongoose';

/**
 * One document per (IST day, anonymous visitor id). Powers /admin/traffic.
 * Deliberately tiny and PII free: `vid` is a random id kept in a first-party cookie, never an email/user id.
 * Raw page views are NOT stored, only a counter, so the collection stays small on the M0 cluster;
 * the TTL index drops rows after 3 years.
 */
const visitorDaySchema = new mongoose.Schema({
    day: { type: String, required: true },          // 'YYYY-MM-DD' in IST
    vid: { type: String, required: true },
    pages: { type: Number, default: 0 },
    firstPath: { type: String, default: '' },
    source: { type: String, default: 'Direct' },    // Google | Search | Social | WhatsApp | Telegram | Referral | Direct
    device: { type: String, default: 'desktop' },   // mobile | tablet | desktop
    wasLoggedIn: { type: Boolean, default: false }, // already had a login token on the first view of the day
    sawAuth: { type: Boolean, default: false },     // opened /login or /register
    signup: { type: String, default: '' },          // '' | google | password
    login: { type: String, default: '' },           // '' | google | password
    createdAt: { type: Date, default: Date.now },
    lastAt: { type: Date, default: Date.now },
}, { versionKey: false });

visitorDaySchema.index({ day: 1, vid: 1 }, { unique: true });
visitorDaySchema.index({ createdAt: 1 }, { expireAfterSeconds: 1095 * 24 * 3600 });

export default mongoose.models.VisitorDay || mongoose.model('VisitorDay', visitorDaySchema);
