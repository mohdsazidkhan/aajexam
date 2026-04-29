import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import Seo from '../../../components/Seo';

const FollowingList = dynamic(() => import('../../../components/FollowingList'), {
  ssr: false,
  loading: () => <div>Loading...</div>
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
