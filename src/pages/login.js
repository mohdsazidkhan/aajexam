import dynamic from 'next/dynamic';
import Seo from '../components/Seo';
import { AuthFormSkeleton } from '../components/skeletons/PublicSkeletons';

const LoginPage = dynamic(() => import('../components/pages/LoginPage'), {
  ssr: false,
  loading: () => <AuthFormSkeleton />
});

export default function Login() {
  return (
    <>
      <Seo
        title="Login - AajExam Platform"
        description="Login to your AajExam account to access practice tests, track your progress, compete on leaderboards, and earn rewards."
        noIndex={true}
      />
      <LoginPage />
    </>
  );
}
