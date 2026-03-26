import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import API from '../../lib/api';
import dbConnect from '../../lib/db';
import SubcategoryModel from '../../models/Subcategory';

const SubcategoryDetailPage = dynamic(() => import('../../components/pages/SubcategoryDetailPage'), {
	ssr: false,
	loading: () => <div>Loading...</div>
});

export default function Subcategory({ subcategory, seo }) {
	return (
		<>
			<Head>
				<title>{seo?.title || 'Subcategory Quizzes - AajExam Platform'}</title>
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
				<SubcategoryDetailPage />
			</Suspense>
		</>
	);
}

export async function getStaticPaths() {
	// Many subcategories; use fallback
	return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
	const { subcategoryId } = params || {};
	let subcategory = null;
	try {
		await dbConnect();
		const subcatDoc = await SubcategoryModel.findById(subcategoryId).select('name description').lean();
		if (subcatDoc) {
			subcategory = {
				name: subcatDoc.name,
				description: subcatDoc.description
			};
		}
	} catch (e) {
		console.error('Error in subcategory getStaticProps:', e);
	}
	if (!subcategory) {
		// We still allow rendering but SEO will be generic
	}
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
	const titleBase = 'AajExam Platform';
	const name = subcategory?.name || 'Subcategory';
	const title = `${name} Quizzes - ${titleBase}`;
	const description = subcategory?.description || `Explore quizzes in ${name} on AajExam.`;
	const keywords = `${name}, quizzes, practice, learning`;
	const image = '/logo.png';
	const url = baseUrl ? `${baseUrl}/subcategory/${subcategoryId}` : undefined;

	return {
		props: { subcategory, seo: { title, description, keywords, image, url } },
		revalidate: 60
	};
}
