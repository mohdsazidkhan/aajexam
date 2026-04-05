import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import Loading from '../../components/Loading';

const AttemptQuizPage = dynamic(() => import('../../components/pages/AttemptQuizPage'), {
	ssr: false,
	loading: () => (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
			<Loading size="lg" />
			<p className="text-sm font-medium text-slate-600 dark:text-slate-400">Preparing your quiz...</p>
		</div>
	)
});

const AttemptQuizFallback = () => (
	<div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center gap-4">
		<Loading size="lg" />
		<p className="text-sm font-medium text-slate-600 dark:text-slate-400">Preparing your quiz...</p>
	</div>
);

export default function AttemptQuiz({ quiz, seo }) {
	return (
		<>
			<Head>
				<title>{seo?.title || 'Attempt Quiz - AajExam Platform'}</title>
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
			<Suspense fallback={<AttemptQuizFallback />}>
				<AttemptQuizPage />
			</Suspense>
		</>
	);
}
