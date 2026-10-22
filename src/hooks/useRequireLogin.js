import { useEffect } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';

// For pages that only make sense after login: anonymous visitors are sent to /login.
// (The pages are also noindex + robots-disallowed, so crawlers never depend on this.)
export default function useRequireLogin() {
  const router = useRouter();
  useEffect(() => {
    try {
      if (!localStorage.getItem('token')) router.replace('/login');
    } catch (e) { /* storage blocked: leave the page as is */ }
  }, [router]);
}
