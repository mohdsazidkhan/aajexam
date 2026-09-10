import dynamic from 'next/dynamic';
import Head from 'next/head';
import { FormSkeleton } from '../../components/skeletons/PrivateSkeletons';

const ReelCreate = dynamic(() => import('../../components/pages/ReelCreate'), {
  ssr: false,
  loading: () => <div className="px-4 py-6"><FormSkeleton fields={3} /></div>
});

export default function ReelCreatePage() {
  return (
    <>
      <Head>
        <title>Create Reel | AajExam</title>
      </Head>
      <ReelCreate />
    </>
  );
}
