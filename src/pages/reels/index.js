import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ReelFeedSkeleton } from '../../components/skeletons/PrivateSkeletons';

const ReelsFeed = dynamic(() => import('../../components/pages/ReelsFeed'), {
  ssr: false,
  loading: () => <ReelFeedSkeleton />
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
