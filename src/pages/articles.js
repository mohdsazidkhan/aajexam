import ArticlesPage from '../components/pages/ArticlesPage'
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getPaginationRobotsMeta, getPaginationUrls, getCanonicalUrl } from '../utils/seo';

export default function Articles() {
    const router = useRouter();
    const currentPage = parseInt(router.query.page || '1', 10);
    const totalPages = 100; // This will be updated dynamically from ArticlesPage

    const robotsMeta = getPaginationRobotsMeta(currentPage);
    const { prevUrl, nextUrl } = getPaginationUrls('/articles', currentPage, totalPages);
    const canonicalUrl = getCanonicalUrl('/articles');

    return (
        <>
            <Head>
                <title>{currentPage > 1 ? `Articles - Page ${currentPage} - AajExam` : 'Articles - AajExam'}</title>
                <meta name="robots" content={robotsMeta} />
                <meta name="description" content="Browse educational articles, study guides, and helpful content to enhance your knowledge. Read insightful articles on various topics and subjects." />
                <meta name="keywords" content="articles, educational content, study guides, knowledge articles, learning resources" />
                <link rel="canonical" href={canonicalUrl} />
                {prevUrl && <link rel="prev" href={prevUrl} />}
                {nextUrl && <link rel="next" href={nextUrl} />}
                <meta property="og:title" content="Articles - AajExam Platform" />
                <meta property="og:description" content="Browse educational articles, study guides, and helpful content to enhance your knowledge." />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Articles - AajExam Platform" />
                <meta name="twitter:description" content="Browse educational articles and study guides to enhance your knowledge." />
            </Head>
            <ArticlesPage />
        </>
    );
}
