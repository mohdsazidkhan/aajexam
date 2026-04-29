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

const xmlUrl = ({ loc, lastmod, changefreq, priority }) => `
   <url>
       <loc>${escapeXml(loc)}</loc>
       <lastmod>${(lastmod ? new Date(lastmod) : new Date()).toISOString()}</lastmod>
       <changefreq>${changefreq || 'weekly'}</changefreq>
       <priority>${priority ?? '0.7'}</priority>
   </url>`;

function generateSiteMap({ exams = [], categoryIds = [], blogs = [], notes = [], examNews = [], currentAffairs = [], subjects = [], topics = [], publicExams = [], quizzes = [] }) {
    const staticPages = [
        { path: '', priority: '1.0', changefreq: 'daily' },
        { path: '/about', priority: '0.7', changefreq: 'monthly' },
        { path: '/about-founder', priority: '0.5', changefreq: 'yearly' },
        { path: '/contact', priority: '0.6', changefreq: 'monthly' },
        { path: '/faq', priority: '0.7', changefreq: 'monthly' },
        { path: '/how-it-works', priority: '0.6', changefreq: 'monthly' },
        { path: '/govt-exams', priority: '0.95', changefreq: 'daily' },
        { path: '/govt-exams-preparation', priority: '0.85', changefreq: 'weekly' },
        { path: '/exams', priority: '0.85', changefreq: 'weekly' },
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
        { path: '/search', priority: '0.4', changefreq: 'monthly' },
        { path: '/editorial-policy', priority: '0.3', changefreq: 'yearly' },
        { path: '/privacy', priority: '0.3', changefreq: 'yearly' },
        { path: '/terms', priority: '0.3', changefreq: 'yearly' },
        { path: '/refund', priority: '0.3', changefreq: 'yearly' },
        { path: '/disclaimer', priority: '0.3', changefreq: 'yearly' },
        { path: '/halal-disclaimer', priority: '0.3', changefreq: 'yearly' }
    ];

    // Always prefer the slug for canonical URLs; fall back to _id only for
    // legacy records without a slug yet (post-backfill there should be none).
    const idOrSlug = (d) => d.slug || (d._id && String(d._id));
    const sections = [
        staticPages.map(p => xmlUrl({ loc: `${EXTERNAL_DATA_URL}${p.path}`, priority: p.priority, changefreq: p.changefreq })).join(''),
        categoryIds.map(c => idOrSlug(c) && xmlUrl({ loc: `${EXTERNAL_DATA_URL}/govt-exams/category/${idOrSlug(c)}`, lastmod: c.updatedAt, changefreq: 'weekly', priority: '0.7' })).filter(Boolean).join(''),
        exams.map(e => idOrSlug(e) && xmlUrl({ loc: `${EXTERNAL_DATA_URL}/govt-exams/exam/${idOrSlug(e)}`, lastmod: e.updatedAt || e.createdAt, changefreq: 'weekly', priority: '0.85' })).filter(Boolean).join(''),
        publicExams.map(e => idOrSlug(e) && xmlUrl({ loc: `${EXTERNAL_DATA_URL}/exams/${idOrSlug(e)}`, lastmod: e.updatedAt || e.createdAt, changefreq: 'weekly', priority: '0.7' })).filter(Boolean).join(''),
        subjects.map(s => idOrSlug(s) && xmlUrl({ loc: `${EXTERNAL_DATA_URL}/subjects/${idOrSlug(s)}`, lastmod: s.updatedAt || s.createdAt, changefreq: 'monthly', priority: '0.6' })).filter(Boolean).join(''),
        topics.map(t => idOrSlug(t) && xmlUrl({ loc: `${EXTERNAL_DATA_URL}/topics/${idOrSlug(t)}`, lastmod: t.updatedAt || t.createdAt, changefreq: 'monthly', priority: '0.55' })).filter(Boolean).join(''),
        quizzes.map(q => idOrSlug(q) && xmlUrl({ loc: `${EXTERNAL_DATA_URL}/quiz/${idOrSlug(q)}`, lastmod: q.updatedAt || q.publishedAt || q.createdAt, changefreq: 'weekly', priority: '0.65' })).filter(Boolean).join(''),
        blogs.map(b => b?.slug && xmlUrl({ loc: `${EXTERNAL_DATA_URL}/blog/${b.slug}`, lastmod: b.updatedAt || b.publishedAt || b.createdAt, changefreq: 'monthly', priority: '0.7' })).filter(Boolean).join(''),
        notes.map(n => n?.slug && xmlUrl({ loc: `${EXTERNAL_DATA_URL}/notes/${n.slug}`, lastmod: n.updatedAt || n.publishedAt || n.createdAt, changefreq: 'monthly', priority: '0.6' })).filter(Boolean).join(''),
        examNews.map(n => idOrSlug(n) && xmlUrl({ loc: `${EXTERNAL_DATA_URL}/exam-news/${idOrSlug(n)}`, lastmod: n.updatedAt || n.createdAt, changefreq: 'weekly', priority: '0.7' })).filter(Boolean).join(''),
        currentAffairs.map(a => idOrSlug(a) && xmlUrl({ loc: `${EXTERNAL_DATA_URL}/current-affairs/${idOrSlug(a)}`, lastmod: a.updatedAt || a.date || a.createdAt, changefreq: 'weekly', priority: '0.65' })).filter(Boolean).join('')
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sections.join('')}
   </urlset>`;
}

function SiteMap() {}

const safeFind = async (importer, projection, filter = {}, limit = 5000, sort = {}) => {
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
            quizzes
        ] = await Promise.all([
            Exam.find({ isActive: true }).select('_id slug updatedAt createdAt').lean(),
            safeFind(() => import('../models/ExamCategory'), '_id slug updatedAt'),
            safeFind(() => import('../models/Blog'), 'slug updatedAt publishedAt createdAt', { status: 'published' }, 5000, { publishedAt: -1 }),
            safeFind(() => import('../models/StudyNote'), 'slug updatedAt publishedAt createdAt', {}, 5000, { publishedAt: -1 }),
            safeFind(() => import('../models/ExamNews'), '_id slug updatedAt createdAt', {}, 5000, { createdAt: -1 }),
            safeFind(() => import('../models/CurrentAffair'), '_id slug updatedAt date createdAt', {}, 5000, { date: -1 }),
            safeFind(() => import('../models/Subject'), '_id slug updatedAt createdAt', {}, 5000),
            safeFind(() => import('../models/Topic'), '_id slug updatedAt createdAt', {}, 5000),
            safeFind(() => import('../models/Quiz'), '_id slug updatedAt publishedAt createdAt', { status: 'published' }, 5000, { publishedAt: -1 })
        ]);

        const sitemap = generateSiteMap({ exams, categoryIds, blogs, notes, examNews, currentAffairs, subjects, topics, publicExams: exams, quizzes });

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
