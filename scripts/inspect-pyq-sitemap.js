/**
 * Diagnostic: why do my PYQ papers not appear in sitemap.xml?
 *
 * The sitemap query filters PracticeTest by:
 *   isPYQ: true
 *   slug: exists & not null
 *   examPattern populated → exam populated → exam.slug exists & exam.isActive !== false
 *
 * This script connects to the same DB and reports exactly which papers
 * pass / fail each gate, with a per-exam breakdown.
 *
 * Run with: node scripts/inspect-pyq-sitemap.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) { console.error('MONGO_URI not set'); process.exit(1); }

// Minimal schemas matching production (read-only — we don't write).
const examSchema = new mongoose.Schema({
    name: String,
    code: String,
    slug: String,
    isActive: Boolean,
}, { strict: false, timestamps: true });

const examPatternSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam' },
    title: String,
}, { strict: false, timestamps: true });

const practiceTestSchema = new mongoose.Schema({
    examPattern: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamPattern' },
    title: String,
    slug: String,
    isPYQ: Boolean,
    pyqYear: Number,
    pyqShift: String,
}, { strict: false, timestamps: true });

const Exam = mongoose.model('Exam', examSchema);
const ExamPattern = mongoose.model('ExamPattern', examPatternSchema);
const PracticeTest = mongoose.model('PracticeTest', practiceTestSchema);

const fmt = (n) => String(n).padStart(4, ' ');
const sep = (label) => console.log('\n' + '═'.repeat(72) + '\n  ' + label + '\n' + '═'.repeat(72));

(async () => {
    console.log('Connecting to MongoDB…');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.\n');

    // ────────────────────────────────────────────────────────────────────
    sep('1. PracticeTest totals');
    const totalTests = await PracticeTest.countDocuments({});
    const totalPYQ = await PracticeTest.countDocuments({ isPYQ: true });
    const pyqWithSlug = await PracticeTest.countDocuments({ isPYQ: true, slug: { $exists: true, $ne: null, $ne: '' } });
    const pyqMissingSlug = await PracticeTest.countDocuments({ isPYQ: true, $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
    console.log(`  Total PracticeTest records ............ ${fmt(totalTests)}`);
    console.log(`  → with isPYQ: true .................... ${fmt(totalPYQ)}`);
    console.log(`     ├─ with slug populated ............. ${fmt(pyqWithSlug)}`);
    console.log(`     └─ MISSING slug (filtered out) ..... ${fmt(pyqMissingSlug)}`);

    // ────────────────────────────────────────────────────────────────────
    sep('2. Exam records & isActive breakdown');
    const totalExams = await Exam.countDocuments({});
    const activeExams = await Exam.countDocuments({ isActive: true });
    const inactiveExams = await Exam.countDocuments({ isActive: false });
    const noActiveField = await Exam.countDocuments({ isActive: { $exists: false } });
    const examsWithSlug = await Exam.countDocuments({ slug: { $exists: true, $ne: null, $ne: '' } });
    const examsMissingSlug = await Exam.countDocuments({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] });
    console.log(`  Total Exam records .................... ${fmt(totalExams)}`);
    console.log(`  → isActive: true ...................... ${fmt(activeExams)}`);
    console.log(`  → isActive: false ..................... ${fmt(inactiveExams)}`);
    console.log(`  → isActive field missing .............. ${fmt(noActiveField)}`);
    console.log(`  → with slug populated ................. ${fmt(examsWithSlug)}`);
    console.log(`  → MISSING slug ........................ ${fmt(examsMissingSlug)}`);

    // ────────────────────────────────────────────────────────────────────
    sep('3. Per-exam PYQ paper count (all stages)');
    const allExams = await Exam.find({}).select('name code slug isActive').lean();
    const examMap = new Map(allExams.map((e) => [String(e._id), e]));

    const allPatterns = await ExamPattern.find({}).select('_id exam title').lean();
    const patternToExam = new Map(allPatterns.map((p) => [String(p._id), String(p.exam || '')]));

    const allPYQ = await PracticeTest.find({ isPYQ: true })
        .select('slug examPattern title pyqYear pyqShift')
        .lean();

    // Bucket by exam, then count: total / has-slug / would-pass-sitemap-filter
    const buckets = new Map(); // examId → { exam, total, withSlug, sitemapEligible, missingSlugTitles[] }

    for (const t of allPYQ) {
        const examId = patternToExam.get(String(t.examPattern || '')) || '__orphan__';
        if (!buckets.has(examId)) {
            buckets.set(examId, { total: 0, withSlug: 0, sitemapEligible: 0, missingSlugTitles: [] });
        }
        const b = buckets.get(examId);
        b.total += 1;
        const hasSlug = !!(t.slug && t.slug.trim());
        if (hasSlug) b.withSlug += 1;
        else b.missingSlugTitles.push(t.title);
        if (hasSlug) {
            const exam = examMap.get(examId);
            if (exam?.slug && exam.isActive !== false) b.sitemapEligible += 1;
        }
    }

    // Print sorted by total desc
    const rows = Array.from(buckets.entries()).map(([examId, b]) => ({
        examId,
        exam: examMap.get(examId),
        ...b,
    })).sort((a, b) => b.total - a.total);

    console.log(`  ${'Exam slug / code'.padEnd(40)} ${'PYQ'.padStart(4)} ${'slug✓'.padStart(6)} ${'sitemap✓'.padStart(8)}  state`);
    console.log(`  ${'-'.repeat(40)} ${'-'.repeat(4)} ${'-'.repeat(6)} ${'-'.repeat(8)}  ${'-'.repeat(20)}`);
    for (const r of rows) {
        const label = r.exam
            ? (r.exam.slug || r.exam.code || r.exam.name || r.examId).slice(0, 40)
            : `(no exam: ${r.examId.slice(0, 28)})`;
        const stateBits = [];
        if (!r.exam) stateBits.push('NO_EXAM');
        else {
            if (!r.exam.slug) stateBits.push('NO_SLUG');
            if (r.exam.isActive === false) stateBits.push('INACTIVE');
            if (r.exam.isActive == null) stateBits.push('isActive=null');
        }
        const state = stateBits.length ? stateBits.join(',') : 'OK';
        console.log(`  ${label.padEnd(40)} ${fmt(r.total)} ${fmt(r.withSlug)} ${fmt(r.sitemapEligible)}  ${state}`);
    }

    // ────────────────────────────────────────────────────────────────────
    sep('4. Sitemap-eligible PYQ totals (matches sitemap.xml.js query)');
    const eligibleCount = rows.reduce((sum, r) => sum + r.sitemapEligible, 0);
    console.log(`  Sitemap will emit ~${eligibleCount} /pyq/<exam>/<paper> URLs`);
    console.log(`  Live sitemap currently shows: 17 (CHSL only — see why above)`);

    // ────────────────────────────────────────────────────────────────────
    sep('5. Missing-slug PYQ titles (top 10 per exam)');
    let totalMissing = 0;
    for (const r of rows) {
        if (r.missingSlugTitles.length === 0) continue;
        totalMissing += r.missingSlugTitles.length;
        const label = r.exam ? (r.exam.slug || r.exam.code || r.exam.name) : `(no exam)`;
        console.log(`\n  ${label} — ${r.missingSlugTitles.length} paper(s) without slug:`);
        for (const t of r.missingSlugTitles.slice(0, 10)) console.log(`    · ${t}`);
        if (r.missingSlugTitles.length > 10) console.log(`    · …and ${r.missingSlugTitles.length - 10} more`);
    }
    if (totalMissing === 0) console.log(`  None — all PYQ papers have a slug.`);

    // ────────────────────────────────────────────────────────────────────
    sep('6. Inactive / no-slug Exam records that hold PYQs');
    const blockedExams = rows.filter((r) => r.total > 0 && r.sitemapEligible < r.total);
    if (blockedExams.length === 0) {
        console.log(`  None — every exam holding PYQs is sitemap-eligible.`);
    } else {
        for (const r of blockedExams) {
            const label = r.exam ? (r.exam.slug || r.exam.code || r.exam.name) : '(orphan)';
            const reason = r.exam
                ? (r.exam.isActive === false ? 'isActive=false'
                    : (!r.exam.slug ? 'no slug' : 'mixed (some papers lack slug)'))
                : 'PracticeTest.examPattern points to nothing';
            console.log(`  ${label.padEnd(40)} blocking ${r.total - r.sitemapEligible} of ${r.total} papers — ${reason}`);
            if (r.exam) {
                console.log(`     code=${r.exam.code || '∅'}  slug=${r.exam.slug || '∅'}  isActive=${r.exam.isActive}`);
            }
        }
    }

    sep('Done.');
    await mongoose.disconnect();
})().catch((err) => {
    console.error(err);
    process.exit(1);
});
