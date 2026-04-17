import dynamic from 'next/dynamic';
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
        title="Register - AajExam Exam Preparation Platform"
        description="Create your free AajExam account today! Join thousands of students preparing for government exams, practicing tests, and earning Daily, Weekly, and Monthly Rewards."
        noIndex={true}
      />
      <RegisterPage />
    </>
  );
}
