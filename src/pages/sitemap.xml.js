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

    // Sitemap is slug-only by design — every record has a slug post-backfill,
    // and any future record without one is skipped here so we never expose a
    // legacy ObjectId URL to Google.
    const sections = [
        staticPages.map(p => xmlUrl({ loc: `${EXTERNAL_DATA_URL}${p.path}`, priority: p.priority, changefreq: p.changefreq })).join(''),
        categoryIds.filter(c => c?.slug).map(c => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/govt-exams/category/${c.slug}`, lastmod: c.updatedAt, changefreq: 'weekly', priority: '0.7' })).join(''),
        exams.filter(e => e?.slug).map(e => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/govt-exams/exam/${e.slug}`, lastmod: e.updatedAt || e.createdAt, changefreq: 'weekly', priority: '0.85' })).join(''),
        publicExams.filter(e => e?.slug).map(e => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/exams/${e.slug}`, lastmod: e.updatedAt || e.createdAt, changefreq: 'weekly', priority: '0.7' })).join(''),
        subjects.filter(s => s?.slug).map(s => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/subjects/${s.slug}`, lastmod: s.updatedAt || s.createdAt, changefreq: 'monthly', priority: '0.6' })).join(''),
        topics.filter(t => t?.slug).map(t => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/topics/${t.slug}`, lastmod: t.updatedAt || t.createdAt, changefreq: 'monthly', priority: '0.55' })).join(''),
        quizzes.filter(q => q?.slug).map(q => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/quiz/${q.slug}`, lastmod: q.updatedAt || q.publishedAt || q.createdAt, changefreq: 'weekly', priority: '0.65' })).join(''),
        blogs.filter(b => b?.slug).map(b => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/blog/${b.slug}`, lastmod: b.updatedAt || b.publishedAt || b.createdAt, changefreq: 'monthly', priority: '0.7' })).join(''),
        notes.filter(n => n?.slug).map(n => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/notes/${n.slug}`, lastmod: n.updatedAt || n.publishedAt || n.createdAt, changefreq: 'monthly', priority: '0.6' })).join(''),
        examNews.filter(n => n?.slug).map(n => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/exam-news/${n.slug}`, lastmod: n.updatedAt || n.createdAt, changefreq: 'weekly', priority: '0.7' })).join(''),
        currentAffairs.filter(a => a?.slug).map(a => xmlUrl({ loc: `${EXTERNAL_DATA_URL}/current-affairs/${a.slug}`, lastmod: a.updatedAt || a.date || a.createdAt, changefreq: 'weekly', priority: '0.65' })).join('')
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
