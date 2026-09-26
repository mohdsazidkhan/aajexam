import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Seo from '../../../components/Seo';

// Legacy URL — followers list now lives at /u/[username]/followers.
export default function FollowersRedirect() {
  const router = useRouter();
  const { username } = router.query;

  useEffect(() => {
    if (username) router.replace(`/u/${encodeURIComponent(username)}/followers`);
  }, [username, router]);

  return <Seo title="Redirecting..." noIndex={true} />;
}
