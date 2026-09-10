import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Seo from '../../../components/Seo';
import { ListSkeleton } from '../../../components/skeletons/PrivateSkeletons';

const FollowersList = dynamic(() => import('../../../components/FollowersList'), {
  ssr: false,
  loading: () => <div className="container mx-auto py-4 px-4 lg:px-10"><ListSkeleton rows={8} /></div>
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
