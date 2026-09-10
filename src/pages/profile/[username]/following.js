import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Seo from '../../../components/Seo';
import { ListSkeleton } from '../../../components/skeletons/PrivateSkeletons';

const FollowingList = dynamic(() => import('../../../components/FollowingList'), {
  ssr: false,
  loading: () => <div className="container mx-auto py-4 px-4 lg:px-10"><ListSkeleton rows={8} /></div>
});

export default function FollowingListPage() {
  const router = useRouter();
  const { username } = router.query;

  return (
    <>
      <Seo
        title={`@${username || 'User'} – Following | AajExam`}
        description={`Accounts followed by @${username || 'this user'} on AajExam.`}
        noIndex={true}
      />
      <FollowingList username={username} />
    </>
  );
}
