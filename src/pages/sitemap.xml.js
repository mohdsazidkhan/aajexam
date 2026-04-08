import dbConnect from '../lib/db';
import Exam from '../models/Exam';

let EXTERNAL_DATA_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';

// Prevent localhost URLs from appearing in the sitemap unconditionally
if (EXTERNAL_DATA_URL.includes('localhost') || EXTERNAL_DATA_URL.includes('127.0.0.1')) {
    EXTERNAL_DATA_URL = 'https://aajexam.com';
}

function generateSiteMap({
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
        '/govt-exams-preparation',
        '/disclaimer',
        '/halal-disclaimer',
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
        const exams = await Exam.find({ isActive: true }).select('_id updatedAt createdAt').lean();

        const sitemap = generateSiteMap({
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
