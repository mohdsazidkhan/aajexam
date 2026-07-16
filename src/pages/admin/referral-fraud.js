import dynamic from 'next/dynamic';
import Head from 'next/head';

const ReferralFraudDashboard = dynamic(() => import('../../components/pages/admin/ReferralFraudDashboard'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function ReferralFraudPage() {
  return (
    <>
      <Head>
        <title>Referral Fraud - AajExam Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <ReferralFraudDashboard />
    </>
  );
}
