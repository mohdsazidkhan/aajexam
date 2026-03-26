import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

const UserQuizRewardsHistory = dynamic(() => import('../../../../components/pages/admin/UserQuizRewardsHistory'), {
    ssr: false,
    loading: () => <div>Loading...</div>
});

export default function UserQuizRewardsHistoryPage() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <>
            <Head>
                <title>User Quiz Rewards History - SUBG QUIZ Admin</title>
                <meta name="robots" content="noindex,nofollow" />
            </Head>
            <Suspense fallback={<div>Loading...</div>}>
                <UserQuizRewardsHistory userId={id} />
            </Suspense>
        </>
    );
}
