import { useMemo } from 'react';
import { useRouter } from 'next/router';
import { toStudentUrl, useIsLoggedInStudent } from '../lib/utils/appRoutes';

// useRouter() whose push/replace/prefetch send logged-in students to /student/...
// for pages that also exist publicly. Everything else is the plain next router.
export const useAppRouter = () => {
  const router = useRouter();
  const isStudent = useIsLoggedInStudent();

  return useMemo(() => {
    if (!isStudent || !router) return router;
    const wrap = (fn) => (url, ...rest) => fn.call(router, toStudentUrl(url), ...rest);
    return Object.assign(Object.create(router), {
      push: wrap(router.push),
      replace: wrap(router.replace),
      prefetch: wrap(router.prefetch),
    });
  }, [router, isStudent]);
};

export default useAppRouter;
