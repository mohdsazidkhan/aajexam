import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Seo from '../../../components/Seo';

const FollowersList = dynamic(() => import('../../../components/FollowersList'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function FollowersListPage() {
  const router = useRouter();
  const { username } = router.query;

  return (
    <>
      <Seo
        title={`@${username || 'User'} – Followers | AajExam`}
        description={`Followers list for @${username || 'this user'} on AajExam.`}
        noIndex={true}
      />
      <FollowersList username={username} />
    </>
  );
}
