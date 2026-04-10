import dynamic from 'next/dynamic';
import Head from 'next/head';

const ReelsFeed = dynamic(() => import('../../components/pages/ReelsFeed'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-screen bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div></div>
});

export default function ReelsPage() {
  return (
    <>
      <Head>
        <title>Reels - Learn by Swiping | AajExam</title>
      </Head>
      <ReelsFeed />
    </>
  );
}
