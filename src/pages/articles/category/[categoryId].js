import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import API from '../../../lib/api';
import dbConnect from '../../../lib/db';
import Category from '../../../models/Category';

const ArticleCategoryPage = dynamic(() => import('../../../components/pages/ArticleCategoryPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function ArticleCategory({ category, seo }) {
  return (
    <>
			<Head>
				<title>{seo?.title || 'Category Articles - SUBG QUIZ Platform'}</title>
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
				<ArticleCategoryPage />
      </Suspense>
    </>
  );
}

export async function getStaticPaths() {
	// Categories can be many; generate none up front
	return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
	const { categoryId } = params || {};

	// Try to enrich SEO using public categories list
	let category = null;
	try {
		await dbConnect();
		const catDoc = await Category.findById(categoryId).select('name description').lean();
		if (catDoc) {
			category = {
				name: catDoc.name,
				description: catDoc.description
			};
		}
	} catch (e) {
		console.error('Error in article category getStaticProps:', e);
	}

	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
	const titleBase = 'SUBG QUIZ Platform';
	const name = category?.name || 'Category';
	const title = `${name} Articles - ${titleBase}`;
	const description = category?.description || `Browse educational articles in ${name} on SUBG QUIZ.`;
	const keywords = `${name}, articles, study, learning`;
	const image = '/logo.png';
	const url = baseUrl ? `${baseUrl}/articles/category/${encodeURIComponent(categoryId)}` : undefined;

	return {
		props: { category, seo: { title, description, keywords, image, url } },
		revalidate: 60
	};
}