import dynamic from 'next/dynamic';
import Head from 'next/head';

const ReelsSaved = dynamic(() => import('../../components/pages/ReelsSaved'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
});

export default function ReelsSavedPage() {
  return (
    <>
      <Head>
        <title>Saved Reels | AajExam</title>
      </Head>
      <ReelsSaved />
    </>
  );
}
