import dbConnect from '../lib/db';
import Exam from '../models/Exam';

let EXTERNAL_DATA_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';

if (EXTERNAL_DATA_URL.includes('localhost') || EXTERNAL_DATA_URL.includes('127.0.0.1')) {
    EXTERNAL_DATA_URL = 'https://aajexam.com';
}

const escapeXml = (s) => String(s || '').replace(/[<>&'"]/g, (c) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
}[c]));

const xmlUrl = ({ loc, lastmod, changefreq, priority }) => {
    // <lastmod> is only emitted when we genuinely know when the record changed.
    // Stamping "now" on every URL every crawl makes Google distrust the field
    // sitewide, which slows re-crawling of the pages that really did change.
    const stamp = lastmod ? new Date(lastmod) : null;
    const lastmodTag = stamp && !Number.isNaN(stamp.getTime())
        ? `
       <lastmod>${stamp.toISOString()}</lastmod>`
        : '';

    return `
   <url>
       <loc>${escapeXml(loc)}</loc>${lastmodTag}
       <changefreq>${changefreq || 'weekly'}</changefreq>
       <priority>${priority ?? '0.7'}</priority>
   </url>`;
};

function generateSiteMap({ exams = [], categoryIds = [], blogs = [], notes = [], examNews = [], currentAffairs = [], subjects = [], topics = [], quizzes = [], pyqPapers = [], pyqExamIndexes = [], practiceSeries = [] }) {
    // Only PUBLIC, non-login pages here. Login-gated pages (profile, history,
    // dashboards, etc.) and admin pages are excluded by design and are also
    // disallowed in robots.txt + carry noIndex meta on the page itself.
    //
    // Notable removals:
    // - /exams listing → 301-redirected to /govt-exams (canonical exam hub).
    // - /search → user-driven query results, prone to thin/duplicate content.
    const staticPages = [
        { path: '', priority: '1.0', changefreq: 'daily' },
        { path: '/about', priority: '0.7', changefreq: 'monthly' },
        { path: '/about-founder', priority: '0.5', changefreq: 'yearly' },
        { path: '/contact', priority: '0.6', changefreq: 'monthly' },
        { path: '/faq', priority: '0.7', changefreq: 'monthly' },
        { path: '/how-it-works', priority: '0.6', changefreq: 'monthly' },
        { path: '/govt-exams', priority: '0.95', changefreq: 'daily' },
        { path: '/govt-exams-preparation', priority: '0.85', changefreq: 'weekly' },
        { path: '/quizzes', priority: '0.8', changefreq: 'daily' },
        { path: '/subjects', priority: '0.75', changefreq: 'weekly' },
        { path: '/topics', priority: '0.75', changefreq: 'weekly' },
        { path: '/notes', priority: '0.75', changefreq: 'daily' },
        { path: '/pyq', priority: '0.9', changefreq: 'daily' },
        { path: '/current-affairs', priority: '0.85', changefreq: 'daily' },
        { path: '/exam-news', priority: '0.85', changefreq: 'daily' },
        { path: '/blog', priority: '0.8', changefreq: 'daily' },
        { path: '/community-questions', priority: '0.6', changefreq: 'daily' },
        { path: '/mentors', priority: '0.6', changefreq: 'weekly' },
        { path: '/daily-challenge', priority: '0.7', changefreq: 'daily' },
        { path: '/subscription', priority: '0.6', changefreq: 'monthly' },
        { path: '/editorial-policy', priority: '0.3', changefreq: 'yearly' },
        { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
        { path: '/terms', priority: '0.3', changefreq: 'yearly' },
        { path: '/refund', priority: '0.3', changefreq: 'yearly' },
        { path: '/disclaimer', priority: '0.3', changefreq: 'yearly' },
        { path: '/halal-disclaimer', priority: '0.3', changefreq: 'yearly' }
    ];

    // Sitemap is slug-only by design — every record has a slug post-backfill,
    // and any future record without one is skipped here so we never expose a
    // legacy ObjectId URL to Google.
    const sections = [
        staticPages.map(p => xmlUrl({ loc: `${EXTERNAL_DATA_URL}${p.path}`, priority: p.priority, changefreq: p.changefreq })).join(''),
        categoryIds.filter(c => c?.slug).map(c => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/govt-exams/category/${c.slug}`, lastmod: c.updatedAt, changefreq: 'weekly', priority: '0.7' })).join(''),
        // Canonical exam URL is /govt-exams/exam/<slug>. /exams/<slug> still exists
        // as a route but is intentionally NOT in the sitemap to avoid content
        // duplication — its <link rel="canonical"> points back to /govt-exams/exam/<slug>.
        exams.filter(e => e?.slug).map(e => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/govt-exams/exam/${e.slug}`, lastmod: e.updatedAt || e.createdAt, changefreq: 'weekly', priority: '0.85' })).join(''),
        subjects.filter(s => s?.slug).map(s => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/subjects/${s.slug}`, lastmod: s.updatedAt || s.createdAt, changefreq: 'monthly', priority: '0.6' })).join(''),
        topics.filter(t => t?.slug).map(t => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/topics/${t.slug}`, lastmod: t.updatedAt || t.createdAt, changefreq: 'monthly', priority: '0.55' })).join(''),
        quizzes.filter(q => q?.slug).map(q => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/quiz/${q.slug}`, lastmod: q.updatedAt || q.publishedAt || q.createdAt, changefreq: 'weekly', priority: '0.65' })).join(''),
        blogs.filter(b => b?.slug).map(b => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/blog/${b.slug}`, lastmod: b.updatedAt || b.publishedAt || b.createdAt, changefreq: 'monthly', priority: '0.7' })).join(''),
        notes.filter(n => n?.slug).map(n => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/notes/${n.slug}`, lastmod: n.updatedAt || n.publishedAt || n.createdAt, changefreq: 'monthly', priority: '0.6' })).join(''),
        examNews.filter(n => n?.slug).map(n => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/exam-news/${n.slug}`, lastmod: n.updatedAt || n.createdAt, changefreq: 'weekly', priority: '0.7' })).join(''),
        currentAffairs.filter(a => a?.slug).map(a => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/current-affairs/${a.slug}`, lastmod: a.updatedAt || a.date || a.createdAt, changefreq: 'weekly', priority: '0.65' })).join(''),
        // /pyq/<examSlug> — per-exam PYQ archive index
        pyqExamIndexes.filter(e => e?.slug).map(e => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/pyq/${e.slug}`, lastmod: e.updatedAt, changefreq: 'weekly', priority: '0.85' })).join(''),
        // /pyq/<examSlug>/<paperSlug> — individual PYQ paper landing pages
        pyqPapers.filter(p => p?.slug && p?.examSlug).map(p => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/pyq/${p.examSlug}/${p.slug}`, lastmod: p.updatedAt || p.publishedAt || p.createdAt, changefreq: 'monthly', priority: '0.9' })).join(''),
        // /practice/<examSlug>/<subjectSlug> — consolidated subject-wise PYQ banks.
        // These replace the thousands of noindexed 10-question quiz slices.
        practiceSeries.filter(p => p?.examSlug && p?.subjectSlug).map(p => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/practice/${p.examSlug}/${p.subjectSlug}`, changefreq: 'weekly', priority: '0.85' })).join('')
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sections.join('')}
   </urlset>`;
}

function SiteMap() {}

const safeFind = async (importer, projection, filter = {}, limit = 25000, sort = {}) => {
    try {
        const Model = (await importer()).default;
        return await Model.find(filter).select(projection).sort(sort).limit(limit).lean();
    } catch (e) {
        return [];
    }
};

export async function getServerSideProps({ res }) {
    try {
        await dbConnect();

        const [
            exams,
            categoryIds,
            blogs,
            notes,
            examNews,
            currentAffairs,
            subjects,
            topics,
            quizzes,
            pyqPapers,
        ] = await Promise.all([
            Exam.find({ isActive: true }).select('_id slug updatedAt createdAt').lean(),
            safeFind(() => import('../models/ExamCategory'), '_id slug updatedAt'),
            safeFind(() => import('../models/Blog'), 'slug updatedAt publishedAt createdAt', { status: 'published' }, 5000, { publishedAt: -1 }),
            safeFind(() => import('../models/StudyNote'), 'slug updatedAt publishedAt createdAt', {}, 5000, { publishedAt: -1 }),
            safeFind(() => import('../models/ExamNews'), '_id slug updatedAt createdAt', {}, 5000, { createdAt: -1 }),
            safeFind(() => import('../models/CurrentAffair'), '_id slug updatedAt date createdAt', {}, 5000, { date: -1 }),
            safeFind(() => import('../models/Subject'), '_id slug updatedAt createdAt', {}, 5000),
            safeFind(() => import('../models/Topic'), '_id slug updatedAt createdAt', {}, 5000),
            safeFind(() => import('../models/Quiz'), '_id slug updatedAt publishedAt createdAt',
                // The auto-sliced quiz series carries noindexOverride, so submitting
                // it would just pad the sitemap with URLs Google is told not to index.
                { status: 'published', noindexOverride: { $ne: true } }, 25000, { publishedAt: -1 }),
            // PYQ papers — populate examPattern.exam for slug, scope to PYQ docs with slugs
            (async () => {
                try {
                    const PracticeTest = (await import('../models/PracticeTest')).default;
                    await import('../models/ExamPattern');
                    const docs = await PracticeTest.find({ isPYQ: true, slug: { $exists: true, $ne: null } })
                        .select('slug pyqYear updatedAt publishedAt createdAt examPattern')
                        .populate({ path: 'examPattern', select: 'exam', populate: { path: 'exam', select: 'slug isActive' } })
                        .limit(25000)
                        .lean();
                    // Sorting on { pyqYear, publishedAt } in Mongo blew the 32MB
                    // in-memory sort limit (no compound index covers that pair),
                    // which silently dropped every PYQ URL from the sitemap.
                    // The result set is small, so order it in JS instead.
                    return docs
                        .filter(d => d?.examPattern?.exam?.slug && d.examPattern.exam.isActive !== false)
                        .map(d => ({
                            slug: d.slug,
                            examSlug: d.examPattern.exam.slug,
                            pyqYear: d.pyqYear || 0,
                            updatedAt: d.updatedAt,
                            publishedAt: d.publishedAt,
                            createdAt: d.createdAt,
                        }))
                        .sort((a, b) => (b.pyqYear - a.pyqYear)
                            || (new Date(b.publishedAt || b.createdAt || 0) - new Date(a.publishedAt || a.createdAt || 0)));
                } catch (e) {
                    // Never swallow this silently: a throw here drops every
                    // /pyq/<exam>/<paper> URL from the sitemap without a trace.
                    console.error('Sitemap: PYQ section failed:', e);
                    return [];
                }
            })(),
        ]);

        // Consolidated /practice/<exam>/<subject> pages — only the series with
        // enough questions to stand on their own get submitted.
        let practiceSeries = [];
        try {
            const Quiz = (await import('../models/Quiz')).default;
            const Subject = (await import('../models/Subject')).default;
            const groups = await Quiz.aggregate([
                { $match: { type: 'subject_test', status: 'published' } },
                { $unwind: '$applicableExams' },
                { $group: { _id: { exam: '$applicableExams', subject: '$subject' }, questions: { $sum: { $size: { $ifNull: ['$questions', []] } } } } },
                { $match: { questions: { $gte: 50 } } },
            ]);
            const [seriesExams, seriesSubjects] = await Promise.all([
                Exam.find({ _id: { $in: groups.map(g => g._id.exam) }, isActive: true }).select('slug').lean(),
                Subject.find({ _id: { $in: groups.map(g => g._id.subject) } }).select('slug').lean(),
            ]);
            const examSlugs = new Map(seriesExams.map(e => [String(e._id), e.slug]));
            const subjectSlugs = new Map(seriesSubjects.map(x => [String(x._id), x.slug]));
            practiceSeries = groups
                .map(g => ({ examSlug: examSlugs.get(String(g._id.exam)), subjectSlug: subjectSlugs.get(String(g._id.subject)) }))
                .filter(p => p.examSlug && p.subjectSlug);
        } catch (e) {
            console.error('Sitemap: practice series section failed:', e);
        }

        // Derive per-exam PYQ index URLs from distinct exam slugs in pyqPapers
        const pyqExamIndexMap = new Map();
        pyqPapers.forEach(p => {
            const existing = pyqExamIndexMap.get(p.examSlug);
            const candidate = p.updatedAt || p.publishedAt || p.createdAt;
            if (!existing || (candidate && candidate > existing.updatedAt)) {
                pyqExamIndexMap.set(p.examSlug, { slug: p.examSlug, updatedAt: candidate });
            }
        });
        const pyqExamIndexes = Array.from(pyqExamIndexMap.values());

        const sitemap = generateSiteMap({ exams, categoryIds, blogs, notes, examNews, currentAffairs, subjects, topics, quizzes, pyqPapers, pyqExamIndexes, practiceSeries });

        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
        res.write(sitemap);
        res.end();
    } catch (e) {
        console.error('Error generating sitemap:', e);
        const sitemap = generateSiteMap({});
        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
        res.write(sitemap);
        res.end();
    }

    return { props: {} };
}

export default SiteMap;
