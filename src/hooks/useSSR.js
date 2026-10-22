import { useState, useEffect } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';

// Named export expected by many components
export const useSSR = () => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return {
    isMounted,
    isRouterReady: Boolean(router?.isReady),
    router,
  };
};

// Default export for backward compatibility
export default useSSR;
