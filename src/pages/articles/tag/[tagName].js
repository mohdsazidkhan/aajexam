import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import API from '../../../lib/api';

const ArticleTagPage = dynamic(() => import('../../../components/pages/ArticleTagPage'), {
	ssr: false,
	loading: () => <div>Loading...</div>
});

export default function ArticleTag({ tagName, seo }) {
	return (
		<>
			<Head>
				<meta name="robots" content="noindex, follow" />
				<title>{seo?.title || 'Tagged Articles - SUBG QUIZ Platform'}</title>
				{seo?.description && <meta name="description" content={seo.description} />}
				{seo?.keywords && <meta name="keywords" content={seo.keywords} />}
				<meta property="og:type" content="website" />
				{seo?.title && <meta property="og:title" content={seo.title} />}
				{seo?.description && <meta property="og:description" content={seo.description} />}
				{seo?.image && <meta property="og:image" content={seo.image} />}
				{seo?.url && <meta property="og:url" content={seo.url} />}
				<meta name="twitter:card" content="summary_large_image" />
				{seo?.title && <meta name="twitter:title" content={seo.title} />}
				{seo?.description && <meta name="twitter:description" content={seo.description} />}
				{seo?.image && <meta name="twitter:image" content={seo.image} />}
				{seo?.url && <link rel="canonical" href={seo.url} />}
			</Head>
			<Suspense fallback={<div>Loading...</div>}>
				<ArticleTagPage />
			</Suspense>
		</>
	);
}

export async function getStaticPaths() {
	// Tags list might be large/unknown; use blocking fallback
	return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
	const { tagName } = params || {};
	
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
	const titleBase = 'SUBG QUIZ Platform';
	const humanTag = decodeURIComponent(tagName || '').replace(/-/g, ' ');
	const title = `${humanTag ? `Articles tagged "${humanTag}"` : 'Tagged Articles'} - ${titleBase}`;
	const description = humanTag
		? `Explore articles tagged with ${humanTag} on SUBG QUIZ. Learn with curated resources and insights.`
		: 'Browse articles by tag on SUBG QUIZ.';
	const keywords = humanTag ? `${humanTag}, articles, tags, learning` : 'articles, tags, learning';
	const image = '/logo.png';
	const url = baseUrl ? `${baseUrl}/articles/tag/${encodeURIComponent(tagName)}` : undefined;

	return {
		props: { tagName, seo: { title, description, keywords, image, url } },
		revalidate: 60
	};
}