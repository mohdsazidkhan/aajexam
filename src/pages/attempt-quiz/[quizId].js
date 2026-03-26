import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const AttemptQuizPage = dynamic(() => import('../../components/pages/AttemptQuizPage'), {
	ssr: false,
	loading: () => <div>Loading...</div>
});

export default function AttemptQuiz({ quiz, seo }) {
	return (
		<>
			<Head>
				<title>{seo?.title || 'Attempt Quiz - SUBG QUIZ Platform'}</title>
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
				<AttemptQuizPage />
			</Suspense>
		</>
	);
}
