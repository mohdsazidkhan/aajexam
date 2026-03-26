import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import API from '../../../lib/api';
import dbConnect from '../../../lib/db';
import Quiz from '../../../models/Quiz';

const ProQuizDetail = dynamic(() => import('../../../components/pages/pro/ProQuizDetail.jsx'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function ProQuizDetailPage({ quiz, seo }) {
  return (
    <>
			<Head>
				<title>{seo?.title || 'Quiz Details - AajExam Pro'}</title>
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
				<ProQuizDetail />
      </Suspense>
    </>
  );
}

export async function getStaticPaths() {
	// Pro quizzes are dynamic; use fallback
	return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
	const { quizId } = params || {};
	let quiz = null;
	try {
		await dbConnect();
		const quizDoc = await Quiz.findById(quizId).select('title description').lean();
		if (quizDoc) {
			quiz = {
				title: quizDoc.title,
				description: quizDoc.description
			};
		}
	} catch (e) {
		console.error('Error in pro quiz getStaticProps:', e);
	}
	if (!quiz) return { notFound: true, revalidate: 60 };

	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
	const titleBase = 'AajExam Pro';
	const title = `${quiz?.title || 'Quiz Details'} - ${titleBase}`;
	const description = quiz?.description || 'View and manage your pro quiz.';
	const keywords = `${quiz?.title || 'quiz'}, pro, management, analytics`;
	const image = '/logo.png';
	const url = baseUrl ? `${baseUrl}/pro/quiz/${encodeURIComponent(quizId)}` : undefined;

	return {
		props: { quiz, seo: { title, description, keywords, image, url } },
		revalidate: 60
	};
}
