// Writes query-driven seoTitle / seoDescription on every Exam that has PYQ papers.
// Based on Search Console queries (Oct 2026): people search "<exam> previous year question paper",
// "<exam> pyq", "<exam> pyq with solutions", "<exam> question paper".
// Usage: node scripts/seoExamPyqMeta.js          (dry run, prints only)
//        node scripts/seoExamPyqMeta.js --write  (updates DB)
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const WRITE = process.argv.includes('--write');

// slug -> { short: name people type, extra: optional extra keyword phrase }
const NAMES = {
    'rrb-group-d': { short: 'RRB Group D' },
    'delhi-police-constable-ssc': { short: 'Delhi Police Constable', extra: 'SSC' },
    'ssc-selection-post-matriculation-level': { short: 'SSC Selection Post Matriculation' },
    'ssc-mts': { short: 'SSC MTS' },
    'ssc-cgl': { short: 'SSC CGL' },
    'ssc-gd-constable': { short: 'SSC GD Constable' },
    'upsc-prelims': { short: 'UPSC Prelims' },
    'ssc-selection-post': { short: 'SSC Selection Post' },
    'rajasthan-police-constable': { short: 'Rajasthan Police Constable' },
    'ssc-stenographer-grade-c-d': { short: 'SSC Stenographer' },
    'ssc-cpo-si-delhi-police-capf': { short: 'SSC CPO' },
    'ssc-chsl-tier-i': { short: 'SSC CHSL Tier 1' },
    'neet-2': { short: 'NEET' },
    'rrb-ntpc': { short: 'RRB NTPC' },
    'ssc-selection-post-higher-secondary-level': { short: 'SSC Selection Post Higher Secondary' },
    'sbi-clerk-prelims': { short: 'SBI Clerk Prelims' },
    'ibps-po-probationary-officer-prelims': { short: 'IBPS PO Prelims' },
    'central-teacher-eligibility-test': { short: 'CTET' },
    'haryana-police-constable': { short: 'Haryana Police Constable' },
    'cil-coal-india-limited': { short: 'Coal India CIL' },
    'ibps-clerk-prelims': { short: 'IBPS Clerk Prelims' },
    'rssb-computer-instructor': { short: 'RSSB Computer Instructor' },
    'up-police-constable': { short: 'UP Police Constable' },
    'esic-udc-prelims': { short: 'ESIC UDC Prelims' },
};

function buildTitle(short, y1, y2) {
    const span = y1 === y2 ? `${y1}` : `${y1}-${y2}`;
    const options = [
        `${short} Previous Year Question Papers ${span} with Solutions | AajExam`,
        `${short} Previous Year Question Papers with Solutions | AajExam`,
        `${short} Previous Year Question Papers | AajExam`,
        `${short} PYQ & Previous Year Papers | AajExam`,
        `${short} PYQ Question Papers | AajExam`,
    ];
    return options.find((t) => t.length <= 62) || options[options.length - 1];
}

function buildDesc(short, y1, y2) {
    const span = y1 === y2 ? `${y1}` : `${y1}-${y2}`;
    const options = [
        `${short} PYQ ${span}: solve previous year question papers shift-wise with solutions, answer key and instant score. Free ${short} mock test on AajExam.`,
        `${short} previous year question papers (${span}) with solutions. Free ${short} PYQ mock test with answer key and instant score on AajExam.`,
        `${short} previous year question papers (${span}) with solutions. Free PYQ mock test, answer key and instant score on AajExam.`,
        `${short} previous year question papers with solutions. Free PYQ mock test and instant score on AajExam.`,
    ];
    return options.find((t) => t.length <= 160) || options[options.length - 1];
}

(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection.db;
    const rows = await db.collection('practicetests').aggregate([
        { $match: { isPYQ: true } },
        { $lookup: { from: 'exampatterns', localField: 'examPattern', foreignField: '_id', as: 'p' } },
        { $group: { _id: { $first: '$p.exam' }, years: { $addToSet: '$pyqYear' } } },
    ]).toArray();
    const exams = await db.collection('exams').find({ _id: { $in: rows.map((r) => r._id) } }).toArray();
    const yearsById = Object.fromEntries(rows.map((r) => [String(r._id), r.years.filter(Boolean).sort()]));

    for (const e of exams) {
        const cfg = NAMES[e.slug];
        if (!cfg) { console.log('SKIP (no config):', e.slug); continue; }
        const ys = yearsById[String(e._id)];
        if (!ys.length) { console.log('SKIP (no years):', e.slug); continue; }
        const seoTitle = buildTitle(cfg.short, ys[0], ys[ys.length - 1]);
        const seoDescription = buildDesc(cfg.short, ys[0], ys[ys.length - 1]);
        console.log(`\n${e.slug}\n  T(${seoTitle.length}): ${seoTitle}\n  D(${seoDescription.length}): ${seoDescription}`);
        if (WRITE) await db.collection('exams').updateOne({ _id: e._id }, { $set: { seoTitle, seoDescription } });
    }
    console.log(WRITE ? '\nWRITTEN' : '\nDRY RUN - nothing written');
    await mongoose.disconnect();
})();
