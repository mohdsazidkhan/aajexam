import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

// Dynamic wrapper to handle SSR issues with useRouter
const DynamicWrapper = ({ children, fallback = null }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return fallback;
  }

  return children;
};

export default DynamicWrapper;
