import mongoose from 'mongoose';

/**
 * One document per (IST day, anonymous visitor id). Powers /admin/traffic.
 * Deliberately tiny: `vid` is a random id kept in a first-party cookie, never an email. Only a login/signup row also keeps the user id (loginUid/signupUid).
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
    deviceModel: { type: String, default: '' },     // e.g. 'SM-M315F' (Android only, when the browser exposes it)
    os: { type: String, default: '' },              // Android | iOS | Windows | macOS | Linux
    osVersion: { type: String, default: '' },
    browser: { type: String, default: '' },
    browserVersion: { type: String, default: '' },  // major version
    country: { type: String, default: '' },         // ISO code, from Vercel's edge headers
    region: { type: String, default: '' },
    state: { type: String, default: '' },          // state name, e.g. 'Uttar Pradesh' (derived from `region`)
    city: { type: String, default: '' },
    ipHash: { type: String, default: '' },          // salted SHA-256 prefix; the raw IP is never stored
    wasLoggedIn: { type: Boolean, default: false }, // already had a login token on the first view of the day
    sawAuth: { type: Boolean, default: false },     // opened /login or /register
    lastPath: { type: String, default: '' },        // most recent page seen that day = the exit page
    prompts: { type: [String], default: [] },       // signup prompts shown: exit | welcome | nudge | sticky | onetap
    clicks: { type: [String], default: [] },        // signup prompts the visitor clicked
    signupFrom: { type: String, default: '' },      // CTA pressed before signing up (see lib/tracker.js markCta), 'auth_page' = no CTA
    signupPath: { type: String, default: '' },      // page that CTA was on
    signup: { type: String, default: '' },          // '' | google | password
    login: { type: String, default: '' },           // '' | google | password
    loginUid: { type: String, default: '' },        // who logged in / signed up, so the admin Traffic modal can list them (rows before this field have none)
    signupUid: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    lastAt: { type: Date, default: Date.now },
}, { versionKey: false });

visitorDaySchema.index({ day: 1, vid: 1 }, { unique: true });
visitorDaySchema.index({ createdAt: 1 }, { expireAfterSeconds: 1095 * 24 * 3600 });

export default mongoose.models.VisitorDay || mongoose.model('VisitorDay', visitorDaySchema);
