import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const UserWallet = dynamic(() => import('../../components/pages/pro/UserWalletWrapper.jsx'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Wallet() {
  return (
    <>
      <Head>
        <title>My Wallet - SUBG QUIZ Pro</title>
        <meta name="description" content="Manage your SUBG QUIZ Pro wallet. View your earnings, transaction history, request withdrawals, and track your rewards from creating quizzes and questions." />
        <meta name="keywords" content="wallet, earnings, pro wallet, rewards, transactions, withdraw money" />
        <meta property="og:title" content="My Wallet - SUBG QUIZ Pro" />
        <meta property="og:description" content="Manage your SUBG QUIZ Pro wallet, view earnings, and request withdrawals." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="My Wallet - SUBG QUIZ Pro" />
        <meta name="twitter:description" content="Manage your earnings and wallet on SUBG QUIZ Pro." />
      </Head>
      <Suspense fallback={<div>Loading...</div>}>
        <UserWallet />
      </Suspense>
    </>
  );
}