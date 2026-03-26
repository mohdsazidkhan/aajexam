import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from '../../utils/authUtils';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const UserQuestionRewards = dynamic(() => import('../../components/pages/pro/UserQuestionRewards.jsx'), {
    ssr: false,
    loading: () => <div className="min-h-screen flex items-center justify-center">Loading Rewards History...</div>
});

export default function UserQuestionRewardsPage() {
    const router = useRouter();

    useEffect(() => {
        const user = getCurrentUser();
        if (!user) {
            router.push('/login');
        }
    }, [router]);

    return (
        <>
            <Head>
                <title>Question Rewards History - SUBG QUIZ Platform</title>
                <meta name="description" content="View your historical earnings from approved practice questions on SUBG QUIZ." />
            </Head>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <UserQuestionRewards />
            </Suspense>
        </>
    );
}
