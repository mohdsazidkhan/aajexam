import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Seo from '../../../components/Seo';

// Legacy URL — following list now lives at /u/[username]/following.
export default function FollowingRedirect() {
  const router = useRouter();
  const { username } = router.query;

  useEffect(() => {
    if (username) router.replace(`/u/${encodeURIComponent(username)}/following`);
  }, [username, router]);

  return <Seo title="Redirecting..." noIndex={true} />;
}
