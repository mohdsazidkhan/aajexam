import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import Seo from '../components/Seo';

const RegisterPage = dynamic(() => import('../components/pages/RegisterPage'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function Register() {
  return (
    <>
      <Seo
        title="Register - SUBG QUIZ Reward Platform"
        description="Create your free SUBG QUIZ account today! Join thousands of users testing their knowledge, competing in quizzes, and earning Daily, Weekly, and Monthly Rewards."
        noIndex={true}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <RegisterPage />
      </Suspense>
    </>
  );
}
