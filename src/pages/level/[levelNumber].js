import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import API from '../../lib/api';
import dbConnect from '../../lib/db';
import LevelModel from '../../models/Level';

const LevelDetailPage = dynamic(() => import('../../components/pages/LevelDetailPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Level({ levelNumber, level, seo }) {
  return (
    <>
			<Head>
				<title>{seo?.title || 'Level Details - SUBG QUIZ Platform'}</title>
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
				<LevelDetailPage />
      </Suspense>
    </>
  );
}

export async function getStaticPaths() {
	try {
		await dbConnect();
		const levels = await LevelModel.find({ isActive: true }).select('levelNumber').lean();
		const paths = (levels || [])
			.map(l => ({ params: { levelNumber: String(l.levelNumber) } }));
		return { paths, fallback: 'blocking' };
	} catch (e) {
		console.error('Error in levelDetail getStaticPaths:', e);
		return { paths: [], fallback: 'blocking' };
	}
}

export async function getStaticProps({ params }) {
	const { levelNumber } = params || {};
	let level = null;
	try {
		await dbConnect();
		const levelDoc = await LevelModel.findOne({ levelNumber: parseInt(levelNumber, 10), isActive: true }).lean();
		if (levelDoc) {
			level = {
				number: levelDoc.levelNumber,
				name: levelDoc.name,
				description: levelDoc.description
			};
		}
	} catch (e) {
		console.error('Error in levelDetail getStaticProps:', e);
	}
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
	const titleBase = 'SUBG QUIZ Platform';
	const number = level?.number || levelNumber;
	const name = level?.name ? `Level ${number}: ${level.name}` : `Level ${number}`;
	const title = `${name} - ${titleBase}`;
	const description = level?.description || `Explore details for Level ${number} on SUBG QUIZ. See requirements and rewards.`;
	const keywords = `level ${number}, quizzes, achievements, learning`;
	const image = '/logo.png';
	const url = baseUrl ? `${baseUrl}/level/${encodeURIComponent(levelNumber)}` : undefined;

	return {
		props: { levelNumber, level, seo: { title, description, keywords, image, url } },
		revalidate: 60
	};
}
