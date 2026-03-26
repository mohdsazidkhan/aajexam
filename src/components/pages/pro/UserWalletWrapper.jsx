'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from '../../../utils/authUtils';
import dynamic from 'next/dynamic';

const UserWallet = dynamic(() => import('./UserWallet'), { ssr: false });

const UserWalletWrapper = () => {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setAllow(true);
    setReady(true);
  }, [router]);

  if (!ready) return null;

  if (!allow) {
    return null;
  }

  return <UserWallet />;
};

export default UserWalletWrapper;
