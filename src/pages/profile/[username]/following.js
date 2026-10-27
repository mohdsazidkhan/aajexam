import { useEffect } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Seo from '../../../components/common/Seo';

// Legacy URL — following list now lives at /u/[username]/following.
export default function FollowingRedirect() {
  const router = useRouter();
  const { username } = router.query;

  useEffect(() => {
    if (username) router.replace(`/@${encodeURIComponent(username)}/following`);
  }, [username, router]);

  return <Seo title="Redirecting..." noIndex={true} />;
}
