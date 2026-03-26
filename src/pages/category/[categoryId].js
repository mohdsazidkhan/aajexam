import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import API from '../../lib/api';

const CategoryDetailPage = dynamic(() => import('../../components/pages/CategoryDetailPage'), {
	ssr: false,
	loading: () => <div>Loading...</div>
});

export default function Category({ category, seo }) {
	return (
		<>
			<Head>
				<title>{seo?.title || 'Category Quizzes - SUBG QUIZ Platform'}</title>
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
				<CategoryDetailPage />
			</Suspense>
		</>
	);
}

export async function getStaticPaths() {
	return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
	const { categoryId } = params || {};

	let category = null;
	try {
		const dbConnect = (await import('../../lib/db')).default;
		const CategoryModel = (await import('../../models/Category')).default;

		await dbConnect();
		const catDoc = await CategoryModel.findById(categoryId).select('name description').lean();
		if (catDoc) {
			category = {
				name: catDoc.name,
				description: catDoc.description
			};
		}
	} catch (e) {
		console.error('Error in category getStaticProps:', e);
	}

	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
	const titleBase = 'SUBG QUIZ Platform';
	const name = category?.name || 'Category';
	const title = `${name} Quizzes - ${titleBase}`;
	const description = category?.description || `Browse quizzes in ${name} on SUBG QUIZ and test your knowledge.`;
	const keywords = `${name}, quizzes, practice, learning`;
	const image = '/logo.png';
	const url = baseUrl ? `${baseUrl}/category/${categoryId}` : undefined;

	return {
		props: { category, seo: { title, description, keywords, image, url } },
		revalidate: 60
	};
}
