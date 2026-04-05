'use client';

import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { CircleAlert, RefreshCcw, ShieldCheck, Sparkles, Target, Trophy, TrendingUp } from 'lucide-react';

import RewardsDashboard from '../RewardsDashboard';
import { useRewards } from '../../hooks/useRewards';
import Button from '../ui/Button';
import UnifiedFooter from '../UnifiedFooter';

const RewardsPage = () => {
  const { rewards, loading, error } = useRewards();

  if (loading) {
    return (
      <div className="min-h-screen bg-background-page flex flex-col items-center justify-center p-6 font-outfit">
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="w-20 lg:w-32 h-20 lg:h-32 rounded-[2.5rem] bg-gradient-to-tr from-primary-500/20 to-primary-500/20 blur-2xl"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 w-20 lg:w-32 h-20 lg:h-32 bg-background-surface rounded-[2.5rem] shadow-duo-primary flex items-center justify-center border-4 border-border-primary"
          >
            <Trophy className="w-16 h-16 text-primary-600" />
          </motion.div>
        </div>
        <h2 className="text-xl lg:text-2xl font-black tracking-tight text-content-primary">Loading rewards</h2>
        <p className="text-sm font-medium text-content-secondary mt-4">Please wait while we load your reward summary.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-page flex items-center justify-center p-6 font-outfit">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-background-surface p-10 rounded-[3rem] shadow-duo-secondary border-4 border-border-primary text-center space-y-8"
        >
          <div className="w-24 h-24 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner border-2 border-primary-500/10">
            <CircleAlert className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <h2 className="text-xl lg:text-3xl font-black tracking-tight text-content-primary leading-none">Failed to load rewards</h2>
            <p className="text-base font-medium text-content-secondary">{error}</p>
          </div>
          <Button
            variant="secondary"
            fullWidth
            onClick={() => window.location.reload()}
            className="py-6 text-sm font-black shadow-duo-secondary rounded-3xl"
          >
            <RefreshCcw className="w-5 h-5 mr-3" /> Try again
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Rewards | AajExam</title>
        <meta name="description" content="Access your AajExam rewards. Track your learning progress, prize wins, and claim your earned rewards easily." />
      </Head>

      <div className="min-h-screen bg-background-page pb-20 font-outfit selection:bg-primary-500 selection:text-white mt-0 lg:mt-16">
        <div className="relative overflow-hidden pt-4 lg:pt-12 pb-8 lg:pb-24">
          <div className="container mx-auto px-2 md:px-6 lg:px-10 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
              <div className="space-y-6 max-w-2xl">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="flex items-center gap-4 bg-primary-500/10 text-primary-600 px-6 py-2 rounded-2xl w-fit shadow-sm border-2 border-primary-500/10"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-sm font-semibold">Your reward status</span>
                </motion.div>

                <div className="space-y-3">
                  <h1 className="text-xl lg:text-5xl font-black tracking-tight leading-none text-content-primary">
                    My <span className="text-primary-600">rewards</span>
                  </h1>
                  <p className="text-base lg:text-lg font-medium text-content-secondary leading-relaxed">
                    See how much you have earned, what you can claim, and track your winnings.
                  </p>
                </div>
              </div>

              {rewards && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative group lg:min-w-[400px]"
                >
                  <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full group-hover:bg-emerald-500/30 transition-all duration-700" />
                  <div className="relative bg-background-surface p-5 lg:p-10 rounded-[1rem] lg:rounded-[2rem] rounded-[4rem] shadow-duo-emerald border-4 border-border-primary flex items-center gap-8 group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="w-20 h-20 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-duo-emerald shrink-0 scale-110 lg:scale-125 group-hover:scale-110 transition-transform relative overflow-hidden">
                      <Target className="w-10 h-10 relative z-10" />
                      <div className="absolute inset-0 bg-white/20 blur-xl translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] lg:text-xs font-black uppercase tracking-[0.4em] text-content-secondary leading-none">Money ready to claim</p>
                      <h2 className="text-2xl lg:text-4xl xl:text-6xl font-black tracking-tight text-emerald-500 leading-none">
                        ₹{rewards.claimableRewards?.toLocaleString('en-IN') || '0'}
                      </h2>
                      <div className="flex items-center gap-2 text-emerald-500/60">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">Live balance</span>
                      </div>
                    </div>
                    <Sparkles className="absolute top-10 right-10 w-8 h-8 text-emerald-500/20 animate-pulse" />
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container mx-auto px-0 md:px-6 lg:px-10 -mt-10 relative z-20">
          <RewardsDashboard />
        </div>

        <div className="container mx-auto px-0 md:px-6 lg:px-10 pt-16">
          <UnifiedFooter />
        </div>
      </div>
    </>
  );
};

export default RewardsPage;


