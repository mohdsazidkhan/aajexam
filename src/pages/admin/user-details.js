import dynamic from 'next/dynamic';
import Head from 'next/head';

const UserDetailsPage = dynamic(() => import('../../components/pages/admin/UserDetailsPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function UserDetailsPageRoute() {
  return (
    <>
      <Head>
        <title>User Details - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <UserDetailsPage />
    </>
  );
}

