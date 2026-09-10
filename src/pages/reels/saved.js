import dynamic from 'next/dynamic';
import Head from 'next/head';
import { GridSkeleton } from '../../components/skeletons/PrivateSkeletons';

const ReelsSaved = dynamic(() => import('../../components/pages/ReelsSaved'), {
  ssr: false,
  loading: () => <div className="px-4 py-6"><GridSkeleton count={6} /></div>
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
