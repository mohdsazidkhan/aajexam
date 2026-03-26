import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from '../../utils/authUtils';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';

const UserQuizRewards = dynamic(() => import('../../components/pages/pro/UserQuizRewards.jsx'), {
    ssr: false,
    loading: () => <div className="min-h-screen flex items-center justify-center">Loading Rewards History...</div>
});

export default function UserQuizRewardsPage() {
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
                <title>Quiz Rewards History - AajExam Platform</title>
                <meta name="description" content="View your historical earnings from approved quizzes on AajExam." />
            </Head>
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                <UserQuizRewards />
            </Suspense>
        </>
    );
}
