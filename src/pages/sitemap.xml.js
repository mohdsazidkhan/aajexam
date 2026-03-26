import dbConnect from '../lib/db';
import Article from '../models/Article';
import Level from '../models/Level';
import Exam from '../models/Exam';

let EXTERNAL_DATA_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://subgquiz.com';

// Prevent localhost URLs from appearing in the sitemap unconditionally
if (EXTERNAL_DATA_URL.includes('localhost') || EXTERNAL_DATA_URL.includes('127.0.0.1')) {
    EXTERNAL_DATA_URL = 'https://subgquiz.com';
}

function generateSiteMap({
    articles = [],
    levels = [],
    exams = []
}) {
    const currentDate = new Date().toISOString();

    // Static pages - Core content only
    const staticPages = [
        '',
        '/about',
        '/contact',
        '/articles',
        '/privacy',
        '/terms',
        '/faq',
        '/editorial-policy',
        '/about-founder',
        '/levels',
        '/how-it-works',
        '/govt-exams-preparation',
        '/disclaimer',
        '/halal-disclaimer',
        '/leaderboard',
        '/monthly-winners',
        '/search',
        '/refund'
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Static Pages -->
     ${staticPages
            .map((path) => {
                return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}${path}`}</loc>
           <lastmod>${currentDate}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>${path === '' ? '1.0' : '0.8'}</priority>
       </url>
     `;
            })
            .join('')}

     <!-- Articles -->
     ${articles
            .map(({ slug, updatedAt, createdAt }) => {
                if (!slug) return ''; // Skip articles without slugs
                return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}/articles/${slug}`}</loc>
           <lastmod>${(updatedAt || createdAt || new Date()).toISOString()}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.9</priority>
       </url>
     `;
            })
            .join('')}

     <!-- Level Pages -->
     ${levels && levels.length > 0 ? levels.map((lvl) => `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}/levels/${lvl.levelNumber}`}</loc>
           <lastmod>${currentDate}</lastmod>
           <changefreq>monthly</changefreq>
           <priority>0.8</priority>
       </url>
     `).join('') : ''}

     <!-- Government Exam Pages (if available) -->
     ${exams
            .map((exam) => {
                if (!exam?._id) return '';
                return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}/govt-exams/exam/${exam._id}`}</loc>
           <lastmod>${(exam.updatedAt || exam.createdAt || new Date()).toISOString()}</lastmod>
           <changefreq>monthly</changefreq>
           <priority>0.7</priority>
       </url>
       `;
            })
            .join('')}

   </urlset>
 `;
}

function SiteMap() {
    // getServerSideProps will do the heavy lifting
}

export async function getServerSideProps({ res }) {
    try {
        await dbConnect();

        // Fetch data directly from the database
        const [articles, levels, exams] = await Promise.all([
            Article.find({ status: 'published' }).select('slug updatedAt createdAt').lean(),
            Level.find({ isActive: true }).select('levelNumber').lean(),
            Exam.find({ isActive: true }).select('_id updatedAt createdAt').lean()
        ]);

        const sitemap = generateSiteMap({
            articles,
            levels,
            exams
        });

        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
        res.write(sitemap);
        res.end();
    } catch (e) {
        console.error('Error generating sitemap:', e);
        // Fallback: Generate sitemap with only static pages
        const sitemap = generateSiteMap({});
        res.setHeader('Content-Type', 'text/xml');
        res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=600');
        res.write(sitemap);
        res.end();
    }

    return {
        props: {},
    };
}

export default SiteMap;

