'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from '../../../utils/authUtils';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Wallet, ShieldCheck, Zap } from 'lucide-react';

const UserWallet = dynamic(() => import('./UserWallet'), {
  ssr: false,
  loading: () => <VaultLoadingState />
});

const VaultLoadingState = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-6 font-outfit">
    <div className="relative">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 lg:w-32 h-20 lg:h-32 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-duo-primary flex items-center justify-center relative z-10 border-4 border-white dark:border-slate-800"
      >
        <Wallet className="w-16 h-16 text-primary-700 dark:text-primary-500" />
      </motion.div>
      <motion.div
        animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-primary-500/20 rounded-[2.5rem] blur-2xl"
      />
    </div>

    <div className="mt-12 text-center space-y-4">
      <div className="flex items-center justify-center gap-3 text-primary-700 dark:text-primary-500">
        <Zap className="w-5 h-5 animate-pulse" />
        <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tighter">Initializing Vault</h2>
      </div>
      <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.4em]">Establishing Secure Asset Uplink...</p>

      <div className="w-64 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto overflow-hidden mt-8">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-1/2 h-full bg-gradient-to-r from-transparent via-primary-500 to-transparent"
        />
      </div>
    </div>

    <div className="fixed bottom-12 flex items-center gap-4 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-xl border-l-4 border-primary-500">
      <ShieldCheck className="w-5 h-5 text-primary-700 dark:text-primary-500" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">ENCRYPTED SESSION ACTIVE</p>
    </div>
  </div>
);

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

  if (!ready || !allow) {
    return <VaultLoadingState />;
  }

  return <UserWallet />;
};

export default UserWalletWrapper;


