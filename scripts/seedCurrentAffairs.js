// Bulk-seeds CurrentAffair documents from a structured JSON batch file.
// Usage: node scripts/seedCurrentAffairs.js scripts/data/current-affairs/2026-09-01.json
//        node scripts/seedCurrentAffairs.js            (seeds every *.json file in that folder)

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('MONGO_URI not found in .env / .env.local');
    process.exit(1);
}

const MAX_LEN = 120;
const slugify = (input) => {
    const raw = String(input || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '');
    const cleaned = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!cleaned) return 'item';
    if (cleaned.length <= MAX_LEN) return cleaned;
    const truncated = cleaned.slice(0, MAX_LEN);
    const lastHyphen = truncated.lastIndexOf('-');
    return (lastHyphen > 60 ? truncated.slice(0, lastHyphen) : truncated).replace(/-+$/, '');
};
const dateSegment = (d) => {
    const date = d ? new Date(d) : new Date();
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
};
const ensureUniqueSlug = async (Model, baseSlug) => {
    const base = slugify(baseSlug);
    let candidate = base;
    let suffix = 1;
    while (true) {
        const existing = await Model.exists({ slug: candidate });
        if (!existing) return candidate;
        suffix += 1;
        const tail = `-${suffix}`;
        const trimmedBase = base.length + tail.length > MAX_LEN
            ? base.slice(0, MAX_LEN - tail.length).replace(/-+$/, '')
            : base;
        candidate = `${trimmedBase}${tail}`;
    }
};

const currentAffairSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    category: { type: String, enum: ['national', 'international', 'economy', 'science', 'sports', 'awards', 'appointments', 'defence', 'environment', 'other'], required: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    content: { type: String, required: true },
    keyPoints: [{ type: String, trim: true }],
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    tags: [{ type: String, trim: true, lowercase: true }],
    questions: [{
        questionText: { type: String, required: true },
        options: [{ text: { type: String, required: true }, isCorrect: { type: Boolean, default: false } }],
        explanation: { type: String, default: '' }
    }],
    views: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

currentAffairSchema.pre('save', async function slugHook(next) {
    try {
        if (!this.slug) {
            const ds = dateSegment(this.date);
            const base = [ds, this.title].filter(Boolean).join(' ');
            this.slug = await ensureUniqueSlug(this.constructor, base);
        }
        next();
    } catch (err) {
        next(err);
    }
});

const CurrentAffair = mongoose.model('CurrentAffair', currentAffairSchema);

const userSchema = new mongoose.Schema({ role: String, email: String }, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

async function main() {
    await mongoose.connect(MONGO_URI);

    const admin = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 }).lean();
    if (!admin) {
        console.error('No admin user found in DB — cannot set createdBy.');
        process.exit(1);
    }
    console.log(`Using admin "${admin.email || admin._id}" as createdBy`);

    const dataDir = path.join(__dirname, 'data', 'current-affairs');
    const argFile = process.argv[2];
    const files = argFile
        ? [path.isAbsolute(argFile) ? argFile : path.join(process.cwd(), argFile)]
        : fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).map(f => path.join(dataDir, f));

    let totalCreated = 0, totalSkipped = 0;

    for (const file of files) {
        const batch = JSON.parse(fs.readFileSync(file, 'utf-8'));
        const date = new Date(batch.date);
        console.log(`\n${path.basename(file)} — ${batch.items.length} items for ${dateSegment(date)}`);

        for (const item of batch.items) {
            const exists = await CurrentAffair.exists({ date, title: item.title });
            if (exists) { totalSkipped++; continue; }

            await CurrentAffair.create({
                date,
                category: item.category,
                title: item.title,
                content: item.content,
                keyPoints: item.keyPoints || [],
                tags: item.tags || [],
                createdBy: admin._id,
                status: 'published'
            });
            totalCreated++;
        }
    }

    console.log(`\nDone. Created: ${totalCreated}, Skipped (already existed): ${totalSkipped}`);
    await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
