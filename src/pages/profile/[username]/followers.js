import { useEffect } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import Seo from '../../../components/common/Seo';

// Legacy URL — followers list now lives at /u/[username]/followers.
export default function FollowersRedirect() {
  const router = useRouter();
  const { username } = router.query;

  useEffect(() => {
    if (username) router.replace(`/@${encodeURIComponent(username)}/followers`);
  }, [username, router]);

  return <Seo title="Redirecting..." noIndex={true} />;
}
