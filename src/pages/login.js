import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import Seo from '../components/Seo';

const LoginPage = dynamic(() => import('../components/pages/LoginPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Login() {
  return (
    <>
      <Seo
        title="Login - AajExam Platform"
        description="Login to your AajExam account to access quizzes, track your progress, compete on leaderboards, and earn rewards."
        noIndex={true}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <LoginPage />
      </Suspense>
    </>
  );
}
