import dynamic from 'next/dynamic';
import Head from 'next/head';

const ReelCreate = dynamic(() => import('../../components/pages/ReelCreate'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>
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
